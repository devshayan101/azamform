require('dotenv').config();
var express = require('express');
const expressLayouts = require('express-ejs-layouts');
var path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const payRoutes = require('./routes/payRoutes');
const peRoutes = require('./routes/peRoutes');
const Form = require('./models/Form.js');
var app = express();
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Public Folder
app.use(express.static('./public'));
app.use((req, res, next) => {
	// Make `user` and `authenticated` available in templates
	res.locals.user = req.user;
	next();
});
const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Server started on port ${port}`))
mongoose
	.connect(process.env.MONGO_URI)
	.then((result) => app.listen(port, () => console.log(`Server started on port ${port}`)))
	.catch((err) => console.log(`db connection`, err));

//Routes
// app.use('/', allRoutes);
//File-Upload to server
const storage = multer.diskStorage({
	destination: 'public/uploads',
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	},
});
const maxFileSize = 5 * 1024 * 1024; // 5MB
//Init Upload
const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Only .jpg .jpeg .png formats allowed'));
		}
	},
	//,limits: { fileSize: maxFileSize }
});
// Handle POST request for file upload
app.post('/registraion-upload', upload.single('photo'), (req, res) => {
	//form submission after payment is not checcking form fields input at server side
	//enter conditions for form check
	console.log('file', req.file);
	// Validate name
	const nameRegex = /^[A-Za-z\s]{3,30}$/;
	if (!nameRegex.test(req.body.name)) {
		return res.status(400).send('Invalid name input');
	}

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
	if (!imdadTypeRegex.test(req.body.imdadType)) {
		// 9 character input
		return res.status(400).send('Invalid imdad-Type');
	}

	const addressRegex = /^\d+\s[A-z]+\s[A-z]+/;
	if (!imdadTypeRegex.test(req.body.address)) {
		// 9 character input
		return res.status(400).send('Invalid Address input!');
	}

	var obj = {
		name: req.body.name,
		phone: req.body.phone,
		email: req.body.email,
		address: req.body.address,
		gender: req.body.gender,
		qualification: req.body.qualification,
		'article-topic': req.body.topic,
		'registration-number': req.body.registration,
		payment: {
			status: req.body.status,
			amount: req.body.amount,
			txnid: req.body.txnid,
			easepayid: req.body.easepayid,
		},

		fileName: req.file.originalname,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.file.filename)),
			contentType: req.file.mimetype,
		},
	};
	const newForm = new Form(obj);

	newForm
		.save()
		.then((form) => {
			fs.unlinkSync(path.join(__dirname + '/public/uploads/' + req.file.filename)); //delete uploaded image file from system storage.
			res.render('formSubmission.ejs');
		})
		.catch((err) => {
			console.error(err);
			res.sendStatus(500);
		});
});

//view forms
app.get('/forms-view-aX4e3Fa5pJsr', (req, res) => {
	Form.find()
		.then((forms) => {
			console.log('items:', forms);
			res.render('formsData', { items: forms });
			// res.send(forms);
		})
		.catch((err) => console.error(err));
});

app.get('/', (req, res) => {
	res.render('index.ejs');
});

app.get('/terms-and-privacy', (req, res) => {
	res.render('termsandprivacy.ejs');
});

app.get('/registration', (req, res) => {
	// const data = res.locals || ''; //data coming from registration form after payment completion

	// console.log('abcde', res.locals);

	const data = req.query;
	console.log('query params:', req.query);
	//form submission after payment is not checcking form fields input at server side

	res.render('registration.ejs', { data: data });
});
app.use('/pe', peRoutes); //phonepe payment routes
// app.use('/pay', payRoutes);

//404
app.use((req, res) => {
	res.status(404).render('404', { title: 'Error 404' });
});

//testing payment

//intergrate from with initiate_payment
//put pay button on form page and when clicked call /initiate-payment route
//for this use fetch() and put the response with success:true/false
//with false disable submit, when success:true enable submit button.
// on form submit
