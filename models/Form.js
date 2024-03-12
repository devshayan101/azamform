const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({

  name: {
    type: String,
   required: [true, 'Name is required']
  },
  email: {
    type: String,    
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be 10 digits'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  address: {
    type: String
  },

  articletopic: {
    type: String
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  formSubmissionTime: {
    type: Date,
    default: Date.now
  },

  payment: {
    status: String,
    amount: String,
    txnid: String,
    easepayid: String
  }
  
});

let Form = mongoose.model('form', participantSchema);

module.exports = Form;