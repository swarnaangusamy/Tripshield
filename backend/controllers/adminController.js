// backend/controllers/adminController.js
const Incident = require('../models/Incident');

/**
 * GET /api/admin/incidents
 * Query: page, limit, q, type, severity, from, to
 * Returns: { incidents, total, page, limit }
 */
exports.listIncidents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || 1));
    const limit = Math.min(200, parseInt(req.query.limit || 20));
    const skip = (page - 1) * limit;

    const { q, type, severity, from, to } = req.query;
    const filter = {};

    if (q) {
      // simple regex search on description & type
      filter.$or = [
        { description: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } }
      ];
    }
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (from || to) {
      filter.time = {};
      if (from) filter.time.$gte = new Date(from);
      if (to) filter.time.$lte = new Date(to);
    }

    const [incidents, total] = await Promise.all([
      Incident.find(filter).sort({ time: -1 }).skip(skip).limit(limit).lean(),
      Incident.countDocuments(filter)
    ]);

    res.json({ incidents, total, page, limit });
  } catch (err) {
    console.error('admin.listIncidents', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/analytics/type
 * Returns counts grouped by incident type
 */
// GET /api/admin/analytics/type
// Combines: Crime + RoadAccident + User Incident
exports.incidentsByType = async (req, res) => {
  try {
    const userIncidents = await Incident.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Convert user incidents → { name, count }
    const userMapped = userIncidents.map(x => ({
      name: x._id || "Unknown",
      count: x.count
    }));

    // Crime dataset → treat as incidentType = "Crime"
    const totalCrime = await Crime.countDocuments();
    const crimeMapped = [{
      name: "Crime Cases",
      count: totalCrime
    }];

    // Road accidents dataset → treat as incidentType = "Road Accident"
    const totalRoad = await RoadAccident.countDocuments();
    const roadMapped = [{
      name: "Road Accidents",
      count: totalRoad
    }];

    // Combine all three
    const combined = [
      ...userMapped,
      ...crimeMapped,
      ...roadMapped
    ];

    res.json(combined);
  } catch (err) {
    console.error("Analytics Type Error", err);
    res.status(500).json({ message: "Server Error" });
  }
};


/**
 * GET /api/admin/analytics/trend
 * Last 30 days trend
 */
exports.trendLast30Days = async (req, res) => {
  try {
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 29); // 30 days including today
    since.setHours(0,0,0,0);

    const data = await Incident.aggregate([
      { $match: { time: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$time' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    // ensure continuous 30-day series on frontend if needed
    res.json(data);
  } catch (err) {
    console.error('admin.trendLast30Days', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/analytics/regions
 * Aggregates by meta.region (if present), computes safest/unsafe
 */
exports.regionSafety = async (req, res) => {
  try {
    // If meta.region not available for many records, results may be sparse.
    const data = await Incident.aggregate([
      { $group: { _id: '$meta.region', count: { $sum: 1 } } },
      { $sort: { count: 1 } } // ascending (fewest incidents => safest)
    ]);

    // compute simple score (0..100): invert and normalize counts
    const counts = data.map(d => d.count).filter(c => c != null);
    const max = counts.length ? Math.max(...counts) : 0;
    const min = counts.length ? Math.min(...counts) : 0;

    const normalize = (c) => {
      if (max === min) return 50;
      return Math.round(((max - c) / (max - min)) * 100);
    };

    const mapped = data.map(d => ({
      region: d._id || 'Unknown',
      incidents: d.count,
      score: normalize(d.count)
    }));

    const safest = mapped.slice(0, 5);
    const mostUnsafe = mapped.slice(-5).reverse();

    res.json({ safest, mostUnsafe });
  } catch (err) {
    console.error('admin.regionSafety', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const Crime = require("../models/Crime");
const RoadAccident = require("../models/RoadAccident");

// Combined region analytics
exports.regionSafety = async (req, res) => {
  try {
    const crime = await Crime.find().lean();
    const road = await RoadAccident.find().lean();
    const incidents = await Incident.find().lean();

    // merge by state
    const regionMap = {};

    crime.forEach((c) => {
      regionMap[c.state] = {
        region: c.state,
        crimeRate: c.rate || 0,
        trafficDeaths: 0,
        userReports: 0
      };
    });

    road.forEach((r) => {
      if (!regionMap[r.state]) {
        regionMap[r.state] = {
          region: r.state,
          crimeRate: 0,
          trafficDeaths: 0,
          userReports: 0
        };
      }
      regionMap[r.state].trafficDeaths = r.totalDied || 0;
    });

    incidents.forEach((i) => {
      const region = i.meta?.region || "Unknown";
      if (!regionMap[region]) {
        regionMap[region] = {
          region,
          crimeRate: 0,
          trafficDeaths: 0,
          userReports: 0
        };
      }
      regionMap[region].userReports += 1;
    });

    // compute safety score
    const list = Object.values(regionMap).map((r) => {
      const danger = r.crimeRate + r.trafficDeaths + r.userReports * 2;
      return {
        region: r.region,
        incidents: danger,
        score: 100 - Math.min(100, danger / 10)
      };
    });

    // sort
    const sorted = list.sort((a, b) => a.incidents - b.incidents);

    const safest = sorted.slice(0, 5);
    const mostUnsafe = sorted.slice(-5).reverse();

    res.json({ safest, mostUnsafe });

  } catch (err) {
    console.error("REGION ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

