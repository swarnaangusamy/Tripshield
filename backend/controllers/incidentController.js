const Incident = require('../models/Incident');

exports.createIncident = async (req, res) => {
  try {
    const { type, severity, description, coordinates } = req.body;
    const incident = new Incident({
      type,
      severity,
      description,
      location: { type: 'Point', coordinates } // [lng, lat]
    });
    await incident.save();
    res.status(201).json({ message: 'Incident reported', incident });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const incidents = await Incident.find()
      .sort({ time: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Incident.countDocuments();
    res.json({ incidents, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// aggregation example for incident types
exports.getIncidentSummary = async (req, res) => {
  try {
    const summary = await Incident.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
