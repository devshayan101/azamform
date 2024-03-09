const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  address: {
    type: String
  },
  'article-topic': {
    type: String
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  formSubmissionTime: {
    type: Date,
    default: Date.now,
  },
});

const Form = mongoose.model('Form', participantSchema);

module.exports = Form;
