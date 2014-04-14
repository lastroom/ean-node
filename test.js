var parser = require('./EANparser.js');

var paramsSearch = {
	latitude: 19.4326077,
	longitude: -99.13320799999997,
	checkin: '24-05-2014',
	checkout: '25-05-2014',
	ocuppancy: ['1,2', '1', '2,1'],
	currency: 'MXN',
	language: 'es',
	apiKey: 'wrwfbeqm4bzd669kxugrdpnu',
	cid: '55505'
}

var paramsInfo = {
	hotelId: 122212,
	Language: 'es',
	apiKey: 'wrwfbeqm4bzd669kxugrdpnu',
	cid: '55505',
}

var paramsAvai = {
	hotelId: 106347,
	checkin: '13-05-2014',
	checkout: '15-05-2014',
	ocuppancy: ['2'],
	currency: 'MXN',
	language: 'es',
	apiKey: 'wrwfbeqm4bzd669kxugrdpnu',
	cid: '55505'
}

var paramsBook = {
	hotelId: '',
	roomId: '',
	currency: '',
	language: '',
	contact: {
		name: {
			firstName: '',
			lastName: ''
		},
		phone: '',
		email: '',
	},
	guest: [
		{
			name: {
				firstName: '',
				lastName: '',
			}
		}
	],
	card: {
		number: '',
		holder: '',
		dueDate: {
			month: '',
			year: ''
		},
		secureCode: '',
	}
}
// parser.search(paramsSearch, function(err, response) {
// 	console.log(err, JSON.stringify(response));
// })

// parser.hotelInformation(paramsInfo, function(err, response) {
// 	console.log(err, response);
// })

parser.availability(paramsAvai, function(err, response) {
	console.log(err,JSON.stringify(response));
});

// parser.book(paramsBook, function(err, response) {
// 	console.log(err, JSON.stringify(response))
// })
