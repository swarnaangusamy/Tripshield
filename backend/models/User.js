const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  relationship: { type: String },
  address: { type: String }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String },
  password: { type: String, required: true },
  emergencyContacts: [EmergencyContactSchema],
  role: { type: String, enum: ['user','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model('User', UserSchema);
