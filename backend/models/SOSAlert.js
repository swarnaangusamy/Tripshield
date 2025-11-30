const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: 'SOS — Please help' },
  time: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  recipients: [{ name: String, phoneNumber: String, email: String }],
  status: { type: String, enum: ['sent','failed','delivered'], default: 'sent' }
});

module.exports = mongoose.model('SOSAlert', SOSSchema);
