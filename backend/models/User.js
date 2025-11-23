const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  relation: String,
  email: String,
  address: String,
});

const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  phone: String,
  email: String,
  dob: String,
  blood: String,
  password: String,
  contacts: [ContactSchema],
});

module.exports = mongoose.model("User", UserSchema);
