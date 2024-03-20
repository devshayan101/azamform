const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const uniqid = require('uniqid');
const SHA256 = require('crypto-js/sha256');
let app = express();
app.use(express.urlencoded({ extended: true }));

function generateUniqueId(length) {
	let id = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		id += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return id + Date.now();
}

const uniqueIdCustom = generateUniqueId(5);

const config = {
	hostUrl: process.env.PHONEPE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox',
	merchantId: process.env.MERCHANT_ID || 'PGTESTPAYUAT',
	saltKey: process.env.SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
	saltIndex: process.env.SALT_INDEX || '1',
	apiEndPoint: process.env.API_END_POINT || '/pg/v1/pay',
	merchantTransactionId: uniqid(),
	merchantUserId: uniqueIdCustom,
};
console.log(config);
router.get('/', (req, res) => {
	res.render('pePaymentForm.ejs');
});

router.post('/pay', (req, res) => {
	//validate amount and phone input
	// Validate amount
	const amountRegex = /^\d{1,4}(\.\d{1,2})?$/;
	if (!amountRegex.test(req.body.amount)) {
		return res.status(400).send('Invalid amount');
	}

	// Validate phone
	const phoneRegex = /^\d{10}$/;
	if (!phoneRegex.test(req.body.phone)) {
		return res.status(400).send('Invalid phone number');
	}

	const payload = {
		merchantId: config.merchantId,
		merchantTransactionId: config.merchantTransactionId,
		merchantUserId: config.merchantUserId,
		amount: 100 * req.body.amount, //take input from form //validate input
		redirectUrl: `https://sawadeazam.org/pe/redirect-url/${config.merchantTransactionId}`,
		redirectMode: 'REDIRECT',
		mobileNumber: req.body.phone, //take input from form //validate input
		paymentInstrument: {
			type: 'PAY_PAGE',
		},
	};

	console.log(payload);
	const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');
	const base64EncodedPayload = payloadBuffer.toString('base64');
	console.log('base64EncodedPayload:', base64EncodedPayload);
	//   (Base64 encoded payload + “/pg/v1/pay” + salt key
	// SHA256(Base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index
	const xVerify = SHA256(base64EncodedPayload + config.apiEndPoint + config.saltKey) + '###' + config.saltIndex;
	console.log('xVerify:', xVerify);

	const options = {
		method: 'post',
		url: `${config.hostUrl}${config.apiEndPoint}`,
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			'X-VERIFY': xVerify,
		},
		data: {
			request: base64EncodedPayload,
		},
	};
	axios
		.request(options)
		.then(function (response) {
			console.log('response-data:', response.data);
			if (response.data.success === true) {
				console.log(response.data.data.instrumentResponse.redirectInfo.url);
				const url = response.data.data.instrumentResponse.redirectInfo.url;
				res.redirect(url);
			} else res.send(response.data);
		})
		.catch(function (error) {
			console.error(error.message);
			console.log(error.response.headers);
			console.log(error.response.status);
			console.log(error.response.statusText);
			res.send(error.message);
		});
});

//transaction status check
router.get('/redirect-url/:merchantTransactionId', (req, res) => {
	const { merchantTransactionId } = req.params;
	console.log('merchantTransactionId:', merchantTransactionId);
	console.log('merchantId:', config.merchantId);
	const xVerify = SHA256('/pg/v1/status/' + config.merchantId + '/' + merchantTransactionId + config.saltKey) + '###' + config.saltIndex;

	const axios = require('axios');
	const options = {
		method: 'get',
		url: `${config.hostUrl}/pg/v1/status/${config.merchantId}/${merchantTransactionId}`,
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json',
			'X-VERIFY': xVerify,
			'X-MERCHANT-ID': config.merchantId,
		},
		data: {},
	};
	axios
		.request(options)
		.then(function (response) {
			console.log(response.data);
			if (response.data.code === 'PAYMENT_SUCCESS') {
				//handle payment success
				res.render('pePaymentSuccess.ejs', { data: response.data });
			} else res.send(error, 'Error');
		})
		.catch(function (error) {
			console.error(error.message);
			res.send(error.message);
			console.log(error.response.headers);
			console.log(error.response.status);
			console.log(error.response.statusText);
		});
});

module.exports = router;
