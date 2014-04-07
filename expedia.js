var request = require('request');

var Expedia = function() {};

Expedia.prototype.base_url = 'http://api.ean.com/ean-services/rs/hotel/v3/';

Expedia.prototype.search = function(params, callback) {
    var endpoint = 'list';
    params['supplierType'] = 'E';
    params['minorRev'] = 22;
    if (!('cacheKey' in params) && !('cacheLocation' in params)) {
        params['searchRadius'] = 5;
        params['searchRadiusUnit'] = 'KM';
        params['includeDetails'] = true;
        params['options'] = 'HOTEL_SUMMARY,ROOM_RATE_DETAILS';
        params['numberOfResults'] = 20;
    }
    if (!(params['rooms'] instanceof Array)) {
        params['rooms'] = [params['rooms']];
    }
    for (var i = 1; i <= params['rooms'].length; i++) {
        if (params['rooms'][i - 1]) {
            params['room' + i] = params['rooms'][i - 1];
        }
    }
    delete params['rooms'];
    request.get(this.base_url + 'list', {
        qs: params
    }, function(err, request, body) {
        var error = err;
        var result = null;
        if (body == "<h1>503 Service Unavailable</h1>") {
            error = "Service Unavailable";
        } else if (body == "<h1>403 Developer Over Rate</h1>") {
            error = "403 Developer Over Rate";
        } else {
            result = JSON.parse(body);
            if (result['HotelListResponse'].hasOwnProperty('EanWsError')) {
                error = result['HotelListResponse']['EanWsError']['verboseMessage'];
                result = null;
            }
        }
        callback(error, result);
    });
};

Expedia.prototype.hotelInformation = function(params, callback) {
    params['minorRev'] = 22;
    params['options'] = 'HOTEL_SUMMARY,HOTEL_IMAGES';
    request.get(this.base_url + 'info', {
        qs: params
    }, function (err, request, body) {
        var error = err;
        var result = null;
        if (body == "<h1>503 Service Unavailable</h1>") {
            error = "Service Unavailable";
        } else if (body == "<h1>403 Developer Over Rate</h1>") {
            error = "403 Developer Over Rate";
        } else {
            result = JSON.parse(body);
            if (result['HotelInformationResponse'].hasOwnProperty('EanWsError')) {
                error = result['HotelInformationResponse']['EanWsError']['verboseMessage'];
                result = null;
            }
        }
        callback(error, result);
    });
};

Expedia.prototype.availability = function(params, callback) {
    params['minorRev'] = 22;
    params['includeDetails'] = true;
    params['includeRoomImages'] = true;
    if (!(params['rooms'] instanceof Array)) {
        params['rooms'] = [params['rooms']];
    }
    for (var i = 1; i <= params['rooms'].length; i++) {
        params['room' + i] = params['rooms'][i - 1];
    }
    delete params['rooms'];
    request.get(this.base_url + 'avail', {
        qs: params
    }, function (err, request, body) {
        var error = err;
        var result = null;
        if (body == "<h1>503 Service Unavailable</h1>") {
            error = "Service Unavailable";
        } else if (body == "<h1>403 Developer Over Rate</h1>") {
            error = "403 Developer Over Rate";
        } else {
            result = JSON.parse(body);
            if (result['HotelRoomAvailabilityResponse'].hasOwnProperty('EanWsError')) {
                error = result['HotelRoomAvailabilityResponse']['EanWsError']['verboseMessage'];
                result = null;
            }
        }
        callback(error, result);
    });
};

Expedia.prototype.book = function(params, callback) {
    var endpoint = 'res';
    var booking_url = this.base_url.replace('http://', 'https://book.');
    params['supplierType'] = 'E';
    params['minorRev'] = '22';
    request.post(booking_url + 'res', {
        qs: params
    }, function(err, request, body) {
        var result = JSON.parse(body);
        callback(err, result);
    });
};

module.exports = new Expedia();