const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },

  severity: {
    type: String,
    enum: ["Low", "Moderate", "High", "Critical"],
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  // When the incident actually happened
  time: {
    type: Date,
    required: true,
  },

  // The user who reported it
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // GeoJSON location
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
  },

  // Optional uploaded image filename
  image: {
    type: String,
    default: null,
  },

  // Origin: user / system / admin
  source: {
    type: String,
    default: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Geo index for map features
IncidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", IncidentSchema);
