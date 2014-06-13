var request = require('request');
 
var EAN = function() {};
 
EAN.prototype.base_url = 'http://api.eancdn.com/ean-services/rs/hotel/v3/';
 
EAN.prototype.list = function(params, callback) {
    request.get(this.base_url + 'list', {
        qs: params
    }, function(err, request, body) {
        var error = err;
        var result = null;
        if (error) {
            callback(null, {
                HotelListResponse: {
                    moreResultsAvailable: false,
                    HotelList: {
                        HotelSummary: []
                    }
                }
            });
            return;
        }
        if (body == "<h1>503 Service Unavailable</h1>") {
            error = "Service Unavailable";
        } else if (body == "<h1>403 Developer Over Rate</h1>") {
            error = "403 Developer Over Rate";
        } else {
            result = JSON.parse(body);
            if (result['HotelListResponse'].hasOwnProperty('EanWsError')) {
                error = result['HotelListResponse']['EanWsError']['verboseMessage'];
                result = null;
                if (error == 'Results NULL') {
                    error = null;
                    result = {
                        HotelListResponse: {
                            moreResultsAvailable: false,
                            HotelList: {
                                HotelSummary: []
                            }
                        }
                    };
                }
            }
        }
        callback(error, result);
    });
};
 
EAN.prototype.info = function(params, callback) {
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
 
EAN.prototype.roomImages = function(params, callback) {
    request.get(this.base_url + 'roomImages', {
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
            if (result['HotelRoomAvailabilityResponse'].hasOwnProperty('EanWsError')) {
                error = result['HotelRoomAvailabilityResponse']['EanWsError']['verboseMessage'];
                result = null;
            }
        }
        callback(error, result);
    });
};
 
EAN.prototype.avail = function(params, callback) {
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
 
EAN.prototype.res = function(params, callback) {
    var booking_url = this.base_url.replace('http://api.eancdn.com', 'http://api.ean.com').replace('http://', 'https://book.');
    request.post(booking_url + 'res', {
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
            if (result.HotelRoomReservationResponse.hasOwnProperty('EanWsError')) {
                error = result.HotelRoomReservationResponse.EanWsError.verboseMessage;
                result = null;
            }
        }
        callback(error, result);
    });
};
 
module.exports = new EAN();
