// backend/controllers/mapController.js
const NodeCache = require('node-cache');
const { fetchPlaces } = require('../services/overpassService');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min cache

exports.getNearby = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius || '3000', 10);

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params required' });
    }

    const key = `nearby_${lat}_${lng}_${radius}`;
    const cached = cache.get(key);
    if (cached) {
      return res.json({ fromCache: true, places: cached });
    }

    const places = await fetchPlaces(lat, lng, radius);

    // Basic prioritization: hospitals first, then police, then fire
    places.sort((a,b) => {
      const order = { hospital: 0, police: 1, fire_station: 2 };
      return (order[a.type] ?? 99) - (order[b.type] ?? 99);
    });

    cache.set(key, places);
    return res.json({ fromCache: false, places });
  } catch (err) {
    console.error('MapController.getNearby error', err?.message || err);
    return res.status(500).json({ message: 'Server error fetching places' });
  }
};
