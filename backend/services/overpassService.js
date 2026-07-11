// backend/services/overpassService.js
const axios = require('axios');

const OVERPASS_URL = process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';

// Build an Overpass QL query for hospitals, police, fire, help centers, etc.
function buildQuery(lat, lon, radius = 3000) {
  const q = `
    [out:json][timeout:25];
    (
      // Hospitals & healthcare
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      relation["amenity"="hospital"](around:${radius},${lat},${lon});

      node["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="healthcare"](around:${radius},${lat},${lon});
      node["healthcare"](around:${radius},${lat},${lon});

      // Police stations
      node["amenity"="police"](around:${radius},${lat},${lon});
      way["amenity"="police"](around:${radius},${lat},${lon});
      relation["amenity"="police"](around:${radius},${lat},${lon});

      // Fire stations
      node["amenity"="fire_station"](around:${radius},${lat},${lon});
      way["amenity"="fire_station"](around:${radius},${lat},${lon});
      relation["amenity"="fire_station"](around:${radius},${lat},${lon});

      // Ambulance & emergency services
      node["emergency"="ambulance_station"](around:${radius},${lat},${lon});
      node["emergency"="yes"](around:${radius},${lat},${lon});
      node["amenity"="first_aid"](around:${radius},${lat},${lon});
      node["amenity"="rescue_station"](around:${radius},${lat},${lon});
    );
    out center;
  `;
  return q;
}

async function fetchPlaces(lat, lon, radius = 3000) {
  const query = buildQuery(lat, lon, radius);
  const res = await axios.post(OVERPASS_URL, query, {
    headers: { 'Content-Type': 'text/plain' },
    timeout: 30000,
  });

  const elements = res.data.elements || [];

  const places = elements
    .map((e) => {
      const tags = e.tags || {};
      const type =
        tags.amenity ||
        tags.healthcare ||
        tags.emergency ||
        "unknown";

      let latv = e.lat;
      let lonv = e.lon;
      if (!latv && e.center) {
        latv = e.center.lat;
        lonv = e.center.lon;
      }

      return {
        id: e.id,
        osmType: e.type,
        name: tags.name || `${type.replace("_", " ")} (${e.id})`,
        type,
        lat: latv,
        lon: lonv,
        tags,
      };
    })
    .filter((p) => p.lat && p.lon);

  return places;
}

module.exports = { fetchPlaces };
