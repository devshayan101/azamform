const express = require('express');
const router = express.Router();
require('dotenv').config()
var sha512 = require('js-sha512');

let app = express();
app.use(express.urlencoded({ extended: true }));


const config = {
    key: process.env.EASEBUZZ_KEY,
    salt: process.env.EASEBUZZ_SALT,
    env: process.env.EASEBUZZ_ENV,
    enable_iframe: process.env.EASEBUZZ_IFRAME,
  };
  
  router.get('/', function (req, res) {
    res.render('payIndex');
  });
  
  router.get('/initiate', function(req, res){
    res.render( 'initiate_payment.ejs');
  })


  //response 
  router.post('/response', function (req, res) {
    function checkReverseHash(response) {
      var hashstring = config.salt + "|" + response.status + "|" + response.udf10 + "|" + response.udf9 + "|" + response.udf8 + "|" + response.udf7 +
        "|" + response.udf6 + "|" + response.udf5 + "|" + response.udf4 + "|" + response.udf3 + "|" + response.udf2 + "|" + response.udf1 + "|" +
        response.email + "|" + response.firstname + "|" + response.productinfo + "|" + response.amount + "|" + response.txnid + "|" + response.key
      hash_key = sha512.sha512(hashstring);
      if (hash_key == req.body.hash)
        return true;
      else
        return false;
    }
    if (checkReverseHash(req.body)) {
    
    

      res.json("status:",req.body.status);
//    load form page filled with name , email, phone, etc with comming from req.body
    }
    res.send('false, check the hash value ');
  });
  
  
  //initiate_payment API
  router.post('/initiate_payment', function (req, res) {
    data = req.body;
    var initiate_payment = require('../Easebuzz/initiate_payment.js');
    initiate_payment.initiate_payment(data, config, res);
  });
  
  //Transcation API  
  router.post('/transaction', function (req, res) {
    data = req.body;
    var transaction = require('../Easebuzz/transaction.js');
    transaction.transaction(data, config, res);
  });
  
  
  //Transcation Date API  
  router.post('/transaction_date', function (req, res) {
  
    data = req.body;
    var transaction_date = require('../Easebuzz/tranaction_date.js');
    transaction_date.tranaction_date(data, config, res);
  });
  
  //Payout API
  router.post('/payout', function (req, res) {
  
    data = req.body;
    var payout = require('../Easebuzz/payout.js');
    payout.payout(data, config, res);
  
  });
  
  //Refund API
  router.post('/refund', function (req, res) {
    data = req.body;
    var refund = require('../Easebuzz/refund.js');
    refund.refund(data, config, res);
  
  });

module.exports = router;
