const mongoose = require('mongoose');

const pePaymentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
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
			enum: ['Zakat', 'Imdad', 'Fitra', 'Sadqa', 'Ushr'],
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
		createdAt: { type: Date, default: Date.now },
	},
	// { timestamps: true, timezone: 'Asia/Kolkata' },
);

module.exports = mongoose.model('PePayment', pePaymentSchema);
