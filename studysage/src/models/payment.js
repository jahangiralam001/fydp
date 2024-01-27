const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  cardName: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  expDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  userId: {
    type: String, 
    
  },
  amount:{
      type: Number,
      default:5
  },
  
});

module.exports = mongoose.model('Payment', paymentSchema);
