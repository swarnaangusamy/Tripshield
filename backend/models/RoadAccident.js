const mongoose = require("mongoose");

const RoadSchema = new mongoose.Schema({
  state: String,
  roadCases: Number,
  roadInjured: Number,
  roadDied: Number,
  railwayCases: Number,
  totalCases: Number,
  totalInjured: Number,
  totalDied: Number
});

module.exports = mongoose.model("RoadAccident", RoadSchema);
