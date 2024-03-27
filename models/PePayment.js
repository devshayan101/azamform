const mongoose = require('mongoose');

const pePaymentSchema = new mongoose.Schema(
	{
		phone: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		imdadType: {
			type: String,
			enum: ['zakat', 'imdad', 'fitra', 'sadqa', 'ushr'],
			required: true,
		},
		merchantTransactionId: {
			type: String,
			required: true,
		},
		transactionId: {
			type: String,
			required: true,
		},
		merchantId: {
			type: String,
		},
		'payment-status': {
			type: String,
		},
		formType: {
			type: String,
			default: 'peForm',
		},
	},
	{ timestamps: true, timezone: 'Asia/Kolkata' },
);

module.exports = mongoose.model('PePayment', pePaymentSchema);
