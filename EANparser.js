var EAN = require('./ean.js');


var EANparser = function() {}

var globalArray = [];

EANparser.prototype.search = function(params, callback) {
	params['arrivalDate'] = formatDate(params['checkin']);
	params['departureDate'] = formatDate(params['checkout']);
	params['currencyCode'] = params['currency'];
	params['locale'] = params['language'];
	params['supplierType'] = 'E';
    params['minorRev'] = 22;
    if (!('cacheKey' in params) && !('cacheLocation' in params)) {
        params['searchRadius'] = 5;
        params['searchRadiusUnit'] = 'KM';
        params['includeDetails'] = true;
        params['options'] = 'HOTEL_SUMMARY,ROOM_RATE_DETAILS';
        params['numberOfResults'] = 22;
    }
    if (!(params['ocuppancy'] instanceof Array)) {
        params['ocuppancy'] = [params['ocuppancy']];
    }
    for (var i = 1; i <= params['ocuppancy'].length; i++) {
        if (params['ocuppancy'][i - 1]) {
            params['room' + i] = params['ocuppancy'][i - 1];
        }
    }
    delete params['ocuppancy'];
    delete params['checkout'];
    delete params['checkin'];
    delete params['currency'];
    delete params['language'];
	EAN.list(params, function(err, result) {
		if(result != null) {
			moreResults(params, result, callback);
			hotelList(result, params['arrivalDate'], params['departureDate'], true);
		}		
	});
}

EANparser.prototype.hotelInformation = function(params, callback) {
	params['locale'] = params['language'];
	delete params['locale'];
	EAN.info(params, function(err, result) {
		if(!result) return;
		var infoHotel = result['HotelInformationResponse'],
			summaryHotel = infoHotel['HotelSummary'],
			response = {
			id: infoHotel['@hotelId'],
			name: summaryHotel['name'],
			latitude: summaryHotel['latitude'],
			longitude: summaryHotel['longitude'],
			country: summaryHotel['countryCode'],
			address: summaryHotel['address1'],
			state: summaryHotel['stateProvinceCode'],
			city: summaryHotel['city'],
			zipCode: summaryHotel['postalCode'],
			images: arrayOfImages(infoHotel['HotelImages'])
		};
		callback(err, response);
	});
}

EANparser.prototype.availability = function(params, callback) {
	params['includeDetails'] = true;
	params['locale'] = params['language'];
	params['arrivalDate'] = formatDate(params['checkin']);
	params['departureDate'] = formatDate(params['checkout']);
	params['currencyCode'] = params['currency'];
    params['minorRev'] = 22;
    if (!(params['ocuppancy'] instanceof Array)) {
        params['ocuppancy'] = [params['ocuppancy']];
    }
    for (var i = 1; i <= params['ocuppancy'].length; i++) {
        if (params['ocuppancy'][i - 1]) {
            params['room' + i] = params['ocuppancy'][i - 1];
        }
    }
    delete params['ocuppancy'];
    delete params['checkout'];
    delete params['checkin'];
    delete params['currency'];
    delete params['language'];

    EAN.avail(params, function(err, result) {
    	var hotelInfo = {
    		hotelId: result['HotelRoomAvailabilityResponse']['hotelId'],
    		name: result['HotelRoomAvailabilityResponse']['hotelName']
    	}
    	var rooms = [];

    	for (var i = 0; i < result['HotelRoomAvailabilityResponse']['HotelRoomResponse'].length; i++) {
    		var hotel = result['HotelRoomAvailabilityResponse']['HotelRoomResponse'];
    		var rateInfo = hotel[i]['RateInfos']['RateInfo']['ChargeableRateInfo'];
    		var nights = nightCounter(result['HotelRoomAvailabilityResponse']['arrivalDate'], result['HotelRoomAvailabilityResponse']['departureDate']);
    		rooms.push({
    			roomId: hotel[i]['roomTypeCode'].toString() + hotel[i]['rateCode'].toString() + i.toString() + getRandomString(10),
    			name: hotel[i]['roomTypeDescription'],
    			maxOcuppancy:{
    				adults: hotel[i]['RateInfos']['RateInfo']['RoomGroup']['Room']['numberOfAdults'],
    				children: hotel[i]['RateInfos']['RateInfo']['RoomGroup']['Room']['numberOfChildren']
    			},	
    			cancellationPolicies: [ hotel[i]['RateInfos']['RateInfo']['cancellationPolicy'] ],
    			internet: false,
    			breakfast: false,
    			rate: {
    				totalRate: rateInfo['@total'],
					nightlyRate: rateInfo['@total'] / nights,
					totalRateNoTax: rateInfo['@nightlyRateTotal'],
					nightlyRateNoTax: rateInfo['@nightlyRateTotal'] / nights,
    				currency: rateInfo['@currencyCode'],
    				taxes: taxes(rateInfo)
    			}
    		})
    	}
    	var response = {
    		hotel: hotelInfo,
    		rooms: rooms
    	}
    	callback(err, response);
    })
}

EANparser.prototype.book = function(params, callback) {
	callback(null, params);
}

var parseAmenities = function(amenityMask) {
    var amenitiesHTML = '';
    var amenitiesArray = [];
 
    var multiplyString = function(string, times) {
        var newString = '';
        for(var i=0; i<times; i++) {
            newString += string;
        }
        return newString;
    };
 
    var findObject = function(array, value) {
        for(var i=0; i<array.length; i++) {
            if(array[i].id == value) {
                return array[i];
            }
        }
    };
 
    var binary = amenityMask.toString(2);
 
    var amenities = [
        {id:1, name: "Business Center"}, {id:2, name: "Fitness Center"},
        {id:4, name: "Hot Tub On-site"}, {id:8, name: "Internet Access Available"},
        {id:16, name: "Kids\' Activities"}, {id:32, name: "Kitchen or Kitchenette"},
        {id:64, name: "Pets Allowed"}, {id:128, name: "Pool"},
        {id:256, name: "Restaurant On-site"}, {id:512, name: "Spa On-site"},
        {id:1024, name: "Whirlpool Bath Available"}, {id:2048, name: "Breakfast"},
        {id:4096, name: "Babysitting"}, {id:8192, name: "Jacuzzi"},
        {id:16384, name: "Parking"}, {id:32768, name: "Room Service"},
        {id:65536, name: "Accessible Path of Travel"}, {id:131072, name: "Accessible Bathroom"},
        {id:262144, name: "Roll-in Shower"}, {id:524288, name: "Handicapped Parking"},
        {id:1048576, name: "In-room Accessibility"}, {id:2097152, name: "Accessibility Equipment for the Deaf"},
        {id:4194304, name: "Braille or Raised Signage"}, {id:8388608, name: "Free Airport Shuttle"},
        {id:16777216, name: "Indoor Pool"}, {id:33554432, name: "Outdoor Pool"},
        {id:67108864, name: "Extended Parking"}, {id:134217728, name: "Free Parking"}];
 
        for(var i = 0; i < binary.length; i++) {
            var index = binary[i];
            if(index == '1') {
                var binaryAmenity = binary.substring(binary.length,i);
                var fixed = 1+multiplyString('0',(binaryAmenity.length-1));
                var amenityId = parseInt(fixed,2);
                amenitiesArray.push(findObject(amenities,amenityId));
            }
        }
        return amenitiesArray;
}

var formatDate = function(check) {
	var date = check.split('-');
	return date[1] +'/'+ date[0] + '/' + date[2];
}

var nightCounter = function(arrival, departure) {
	arrival = new Date(arrival);
	departure = new Date(departure);
	var timeDiff = Math.abs(departure.getTime() - arrival.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays;
} 

var removeHTMLSymbols = function(string) {
    var symbols = {
        "&amp;": '&',
        "&lt;": "<",
        "&gt;": ">",
        "&apos;": "'"
    };
    return string.replace(/&(amp|lt|gt|apos);/gi, function(m) {
        return symbols[m];
    });
}

var taxes = function(rateInfo) {
	var taxes = [];
	if(!rateInfo || !rateInfo['Surcharges']) return;
	if (rateInfo['Surcharges']['@size'] == 1) {
		taxes.push({
			name: rateInfo['Surcharges']['Surcharge']['@type'],
			amount: rateInfo['Surcharges']['Surcharge']['@amount'],
			percentage: (rateInfo['Surcharges']['Surcharge']['@amount'] * 100) / rateInfo['@total'],
		});
	} else {
		for (j = 0; j < rateInfo['Surcharges']['Surcharge'].length; j++) {
			taxes.push({
				name: rateInfo['Surcharges']['Surcharge'][j]['@type'],
				amount: rateInfo['Surcharges']['Surcharge'][j]['@amount'],
				percentage: (rateInfo['Surcharges']['Surcharge'][j]['@amount'] * 100) / rateInfo['@total'],
			});
		}
	}
	return taxes;
}

var moreResults = function(args, resp, callback) {
	if(!resp || !resp['HotelListResponse']) return;
	var params = {
		cacheKey:  resp['HotelListResponse']['cacheKey'],
		cacheLocation: resp['HotelListResponse']['cacheLocation'],
		apiKey: args['apiKey'],
		cid: args['cid'],
		locale: args['locale'],
		currencyCode: args['currencyCode'],
		customerSessionId: resp['HotelListResponse']['customerSessionId'],
	}	
	EAN.list(params, function(err, response) {
		hotelList(response, args['arrivalDate'], args['departureDate'], false);
		if (resp['HotelListResponse']['moreResultsAvailable'] == true) moreResults(args, response, callback);
		if (resp['HotelListResponse']['moreResultsAvailable'] == false)  callback(err, globalArray);
	});
}

var hotelList = function(result, arrival, departure, flag) {
	if (!result) return;
	var hotel = [], 
		list = result['HotelListResponse']['HotelList'],
		summary = list['HotelSummary'],
		nights = nightCounter(arrival, departure);
	if(!list) return;
	for(i = 0; i < summary.length; i++) {
		rateInfo = flag == true ? 
		summary[i]['RoomRateDetailsList']['RoomRateDetails']['RateInfos']['RateInfo']['ChargeableRateInfo'] :
		summary[i]['RoomRateDetailsList']['RoomRateDetails']['RateInfo']['ChargeableRateInfo'];
		globalArray.push({
			id: summary[i]['hotelId'],
			name: summary[i]['name'],
			latitude: summary[i]['latitude'],
			longitude: summary[i]['longitude'],
			images: summary[i]['thumbNailUrl'],
			description: removeHTMLSymbols(summary[i]['shortDescription']),
			checkin: arrival,
			checkout: departure,
			amenities: parseAmenities(summary[i]['amenityMask']),
			raiting: summary[i]['hotelRating'],
			category: '',
			rate: {
				totalRate: rateInfo['@total'],
				nightlyRate: rateInfo['@total'] / nights,
				totalRateNoTax: rateInfo['@nightlyRateTotal'],
				nightlyRateNoTax: rateInfo['@nightlyRateTotal'] / nights,
				currency: rateInfo['@currencyCode'],
				taxes: taxes(rateInfo),
			}
		});	
	}
}

var arrayOfImages = function(images) {
	var imagesList = [];
	if (images['@size'] > 1 ) {
		for (i = 0; i < images['HotelImage'].length; i++){
			imagesList.push({
				original: images['HotelImage'][i]['url'],
				thumbnail: images['HotelImage'][i]['thumbnailUrl']
			});
		}
	} else {
		imagesList.push({
			original: images['HotelImage']['url'],
			thumbnail: images['HotelImage']['thumbnailUrl']
		});
	}
	return imagesList;
}

var getRandomString = function(len) {
    var token = '',
    chars ='AaBb1CcDd2EeFf3GgHh4IiJj5KkLl6MmNn7OoPp8QqRr9SsTtUuVvWwXxYyZz';
    len = len ? len : 24;
    for (var i = len; i > 0; --i) token += chars[Math.round(Math.random() * (chars.length - 1))];
    return token;
}

module.exports = new EANparser();