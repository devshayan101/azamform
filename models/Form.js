const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
	},

	email: {
		type: String,
		match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
	},

	phone: {
		type: String,
		required: true,
		validate: {
			validator: function (v) {
				return /^\d{10}$/.test(v);
			},
			message: 'Phone number must be 10 digits',
		},
	},

	gender: {
		type: String,
		// enum: ['male', 'female']
	},
	qualification: {
		type: String,
		// enum: ['student', 'completedEducation']
	},
	address: {
		type: String,
		//match: /^[a-zA-Z0-9,]*$/,
		not: [
			// add this
			/[{}\[\]();:!#&^%]/, // regex to disallow these chars
		],
	},

	'registration-number': {
		type: String,
		match: /^[0-9]*$/,
	},

	'article-topic': {
		type: String,
		not: [
			// add this
			/[{}\[\]();:!#&^%]/, // regex to disallow these chars
		],
	},

	img: {
		data: Buffer,
		contentType: String,
	},

	payment: {
		code: {
			type: String,
		},
		amount: {
			type: Number,
			required: true,
			not: [
				// add this
				/[{}\[\]();:!#&^%]/, // regex to disallow these chars
			],
		},
		txnid: {
			type: String,
			required: true,
			maxlength: 20,
			not: [
				// add this
				/[{}\[\]();:!#&^%]/, // regex to disallow these chars
			],
		},
		transactionId: {
			type: String,
			not: [
				// add this
				/[{}\[\]();:!#&^%]/, // regex to disallow these chars
			],
		},
		// easepayid: {
		// 	type: String,
		// 	not: [
		// 		// add this
		// 		/[{}\[\]();:!#&^%]/, // regex to disallow these chars
		// 	],
		// },
	},
});

let Form = mongoose.model('form', participantSchema);

module.exports = Form;
