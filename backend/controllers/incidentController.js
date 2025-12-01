// backend/controllers/incidentController.js
const Incident = require("../models/Incident");
const User = require("../models/User");

// POST /api/incidents/report
exports.reportIncident = async (req, res) => {
  try {
    const reporterId = req.user ? req.user._id : null; // if protect() active
    const { type, severity, description, date, time, latitude, longitude } = req.body;
    const file = req.file; // multer uploads

    if (!type) return res.status(400).json({ message: "Incident type required" });
    if (!severity) return res.status(400).json({ message: "Severity required" });

    // Build incident datetime
    let incidentTime = new Date();
    if (date && time) {
      incidentTime = new Date(`${date}T${time}:00`);
    } else if (date) {
      incidentTime = new Date(date);
    }

    // Location
    const coords =
      latitude && longitude
        ? [parseFloat(longitude), parseFloat(latitude)]
        : undefined;

    const incident = new Incident({
      type,
      severity,
      description,
      time: incidentTime,
      reporter: reporterId,
      location: coords ? { type: "Point", coordinates: coords } : undefined,
      image: file ? file.filename : undefined,
      source: "user",
    });

    await incident.save();

    res.status(201).json({
      message: "Incident reported successfully",
      incident,
    });
  } catch (err) {
    console.error("REPORT INCIDENT ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/incidents (paginated)
exports.getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 20, q, type, severity } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const incidents = await Incident.find(filter)
      .sort({ time: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Incident.countDocuments(filter);

    res.json({ incidents, total });
  } catch (err) {
    console.error("GET INCIDENTS ERROR", err);
    res.status(500).json({ message: "Server error" });
  }
};
