
require('dotenv').config()
var express = require("express");
const expressLayouts = require('express-ejs-layouts');
var path = require("path");
const multer = require('multer');
const mongoose = require('mongoose')

const payRoutes = require('./routes/payRoutes')
// const allRoutes = require('./routes/allRoutes')

var app = express();
app.set('view engine', 'ejs')

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Public Folder
app.use(express.static('./public'));

const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Server started on port ${port}`))
mongoose.connect(process.env.MONGO_URI)
    .then(result => app.listen(port, () => console.log(`Server started on port ${port}`)))
    .catch(err => console.log(`db connection`, err))

//Routes
// app.use('/', allRoutes);
//File-Upload to server
const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const maxFileSize = 5 * 1024 * 1024; // 5MB
//Init Upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (
          file.mimetype == "image/png" ||
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/jpeg"
      ) {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error("Only .jpg .jpeg .png formats allowed"))
      }
  }
  ,limits: { fileSize: maxFileSize }
});
// Handle POST request for file upload
app.post('/registraion-upload', upload.single('image'), (req, res) => {
  console.log('file',req.file);
  console.log('files:', req.files)
  
  var obj = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    gender: req.body.gender,

    payment:{
      status: req.body.payment_status,
      amount: req.body.net_amount_debit,
      txnid: req.body.txnid,
      easepayid: req.body.easepayid
    },

    fileName: req.file.originalname,
      img: {
          data:fs.readFileSync(path.join(__dirname + '/public/uploads/'+ req.file.filename)),
          contentType: req.file.mimetype
      }
  }
  const newImage = new Image(obj);
  
  newImage.save()
      .then(image => {
          res.status(200).json({
              message: 'Image uploaded successfully',
              image
            });
      })
      .catch(err => {
          console.error(err);
          res.sendStatus(500);
      });

  
});
app.get('/imageView', (req, res) => {
  Image.find()
  .then(images => {
    res.render('index', { items: images });
  })
  .catch(err => console.error(err));
});

app.get('/', (req, res) => {  
  res.render('index.ejs')
});

app.get('/terms-and-privacy', (req, res) => {
  res.render('termsandprivacy.ejs')
})

app.get('/registration', (req, res) => {
  res.render('registration.ejs');
})

app.use('/pay', payRoutes);

//404 
app.use((req, res) => {
  res.status(404).render('404', { title: 'Error 404' });
})

//testing payment

//intergrate from with initiate_payment
      //put pay button on form page and when clicked call /initiate-payment route
      //for this use fetch() and put the response with success:true/false
      //with false disable submit, when success:true enable submit button.
      // on form submit 