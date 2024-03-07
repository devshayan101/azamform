const express = require('express');
// const controller = require('../controller/controller');
// const validate = require('../validation/formAuth');
// // const { check, validationResult } = require('express-validator');
// const { check } = require('express-validator');


let app = express();
const router = express.Router()

app.use(express.urlencoded({ extended: true }));


router.get('/', (req, res) => {
    res.render('index.ejs')

});
router.get('/terms-and-privacy', (req, res) => {
    res.render('termsandprivacy.ejs')
})


router.get('/contact', (req, res) => {
    res.render('contact')
})

router.get('/information', (req, res) => {
    res.render('information.ejs')
})


router.get('/gallery', (req, res) => {
    res.render('gallery', { title: 'Gallery' })
})

router.post('/submit-no-payment-error', (req, res) => {
    res.render('submit-error.ejs', { title: 'Form Error', messege_title: 'Form fees not paid!', messege_body: 'Kindly pay form fee Rs.50 first then fill admission form.' })
})

router.get('/admission-form', (req, res) => {
    res.render('admission-form', { _id: null, title: 'Admission Form', path: '=/submit-no-payment-error' })
})




// router.post('/orders', controller.orders)

// router.post('/admissions', controller.formPostPayment)


// router.post('/submit', controller.upload, controller.submitPostPayment);

// router.post('/submit', validate.formCheck);






module.exports = router;