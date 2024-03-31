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
			enum: ['Zakat', 'Imdad', 'Fitra', 'Sadqa', 'Ushr', 'SuffaFee'],
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
		createdAt: {
			type: Date,
			default: Date.now, //  Set default value to current UTC time
		},
	},
	// { timestamps: true, timezone: 'Asia/Kolkata' },
);

// Define a custom setter for the 'createdAt' field to set it to +05:30 time zone
pePaymentSchema.path('createdAt').set(function (value) {
	// Convert the value to Indian Standard Time (IST) (+05:30)
	const istTime = new Date(value).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
	return new Date(istTime);
});

module.exports = mongoose.model('PePayment', pePaymentSchema);
