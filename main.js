
require('dotenv').config()
var sha512 = require('js-sha512');
var express = require("express");
const expressLayouts = require('express-ejs-layouts');
var path = require("path");
const mongoose = require('mongoose')

// const payRoutes = require('./routes/payRoutes')
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
app.get('/', (req, res) => {
  res.render('index.ejs')

});
app.get('/terms-and-privacy', (req, res) => {
  res.render('termsandprivacy.ejs')
})
// app.use('/pay', payRoutes);

//404 
app.use((req, res) => {
  res.status(404).render('404', { title: 'Error 404' });
})

