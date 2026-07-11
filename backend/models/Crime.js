const mongoose = require("mongoose");

const CrimeSchema = new mongoose.Schema({
  state: String,
  year2020: Number,
  year2021: Number,
  year2022: Number,
  population: Number,
  rate: Number,
  chargesheetRate: Number
});

module.exports = mongoose.model("Crime", CrimeSchema);
