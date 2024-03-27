const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const uniqid = require('uniqid');
const SHA256 = require('crypto-js/sha256');
const PePayment = require('../models/pePayment');
let app = express();
app.use(express.urlencoded({ extended: true }));

let tx_uuid = uniqid();
const config = {
	// process.env.PHONEPE_URL ||
	hostUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
	merchantId: process.env.MERCHANT_ID || 'PGTESTPAYUAT',
	saltKey: process.env.SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
	saltIndex: process.env.SALT_INDEX || '1',
	apiEndPoint: process.env.API_END_POINT || '/pg/v1/pay',
	merchantTransactionId: tx_uuid,
	merchantUserId: uniqid(),
	redirectUrl: process.env.PROD_REDIRECT_URL || 'http://localhost:3000',
};

router.get('/', (req, res) => {
	res.render('pePaymentForm.ejs');
});

router.post('/pay', (req, res) => {
	// Validate amount
	const amountRegex = /^\d{1,6}(\.\d{1,2})?$/;
	if (!amountRegex.test(req.body.amount)) {
		return res.status(400).send('Invalid amount');
	}

	// Validate phone
	const phoneRegex = /^\d{10}$/;
	if (!phoneRegex.test(req.body.phone)) {
		return res.status(400).send('Invalid phone number');
	}
	//validate txnid
	const txnidRegex = /^\d{13}$/;
	if (!txnidRegex.test(req.body.txnid)) {
		// 13 digit input
		return res.status(400).send('Invalid transactionId');
	}
	console.log(req.body.txnid);

	const formTypeRegex = /^\w{5,9}$/;
	if (!formTypeRegex.test(req.body.formType)) {
		// 9 character input
		return res.status(400).send('Invalid form-Type');
	}

	const imdadTypeRegex = /^\w{5,9}$/;
	if (!imdadTypeRegex.test(req.body.formType)) {
		// 9 character input
		return res.status(400).send('Invalid imdad-Type');
	}
	console.log(req.body.imdadType);

	const payload = {
		merchantId: config.merchantId,
		merchantTransactionId: req.body.txnid,
		merchantUserId: req.body.phone,
		amount: 100 * req.body.amount, //take input from form //validate input
		redirectUrl: `${config.redirectUrl}/pe/redirect-url/${req.body.txnid}/${req.body.formType}/${req.body.phone}/${req.body.imdadType}`,
		redirectMode: 'REDIRECT',
		mobileNumber: req.body.phone, //take input from form //validate input
		paymentInstrument: {
			type: 'PAY_PAGE',
		},
	};

	console.log(payload);
	const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');
	const base64EncodedPayload = payloadBuffer.toString('base64');

	const xVerify = SHA256(base64EncodedPayload + config.apiEndPoint + config.saltKey) + '###' + config.saltIndex;

	console.log('xVerify:', xVerify);

	fetch(`${config.hostUrl}/pg/v1/pay`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-VERIFY': xVerify,
		},
		body: JSON.stringify({
			request: base64EncodedPayload,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			console.log('Payment response:', data);
			if (data.success) {
				const url = data.data.instrumentResponse.redirectInfo.url;
				console.log(url);

				return res.redirect(303, url);
			} else {
				console.error('Payment failed');
				return res.status(400).send('Payment failed');
			}
		})
		.catch((err) => {
			console.error('Error:', err.message);
			return res.status(500).send('Error making payment');
		});
});

//transaction status check
router.get('/redirect-url/:merchantTransactionId/:formType/:phone/:imdadType', (req, res) => {
	const { merchantTransactionId, formType, phone, imdadType } = req.params;

	// Validate phone
	const phoneRegex = /^\d{10}$/;
	if (!phoneRegex.test(phone)) {
		return res.status(400).send('Invalid phone number');
	}
	//validate txnid
	const txnidRegex = /^\d{13}$/;
	if (!txnidRegex.test(merchantTransactionId)) {
		// 13 digit input
		return res.status(400).send('Invalid transactionId');
	}
	//validate form type
	const formTypeRegex = /^\w{5,9}$/;
	if (!formTypeRegex.test(formType)) {
		// 5-9 character input
		return res.status(400).send('Invalid form-Type');
	}

	const imdadTypeRegex = /^\w{4,6}$/;
	if (!imdadTypeRegex.test(imdadType)) {
		// 4-5 character input
		return res.status(400).send('Invalid imdad-Type');
	}
	console.log(formType, phone, imdadType);

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
			//data from peForm
			const paymentObj = {
				phone: phone,
				amount: response.data.data.amount,
				imdadType: imdadType,
				// merchantId: config.merchantId,
				merchantTransactionId: merchantTransactionId,
				transactionId: response.data.data.transactionId,
				'payment-status': response.data.code,
				formType: formType,
			};
			const payment = new PePayment(paymentObj);
			payment
				.save()
				.then((resp) => {
					console.log('data saved:', resp);
					var paymentDatafromDb = resp;
					if (response.data.code === 'PAYMENT_SUCCESS') {
						//handle payment success
						//save data to database
						if (formType === 'peForm') {
							return res.render('pePaymentSuccess.ejs', { data: paymentDatafromDb }); //data from database to be rendered
						} else {
							//suffa form
							return res.render('registration.ejs', { data: response.data });
						}
					} else {
						throw new Error('Payment Failed');
					}
				})
				.catch((err) => console.log('Error saving data:', err));
		})
		.catch(function (error) {
			console.error(error.message);

			return res.send(error.message);
		});
});

module.exports = router;
