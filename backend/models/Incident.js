const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: Number, default: 1 },
  description: { type: String },
  time: { type: Date, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  images: [{ type: String }],
  source: { type: String } // e.g., 'user', 'data.gov.in'
});

module.exports = mongoose.model('Incident', IncidentSchema);
