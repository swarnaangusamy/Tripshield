// backend/scripts/import_data_gov_in.js
/**
 * Script to import datasets from data.gov.in into Incident collection.
 *
 * Usage:
 *   NODE_ENV=production DATA_GOV_API_KEY=xxxx node scripts/import_data_gov_in.js
 *
 * Notes:
 * - Replace RESOURCE_ID with a specific dataset resource id from data.gov.in
 * - This script is a template and may need mapping adjustments per dataset.
 */

const axios = require('axios');
const csv = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const connectDB = require('../config/db');
require('dotenv').config();

const RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID || ''; // set in .env
const API_KEY = process.env.DATA_GOV_API_KEY || '';
const OUTPATH = path.join(__dirname, 'last_import.json');

(async function main() {
  await connectDB();

  try {
    if (!RESOURCE_ID) {
      console.error('Please set DATA_GOV_RESOURCE_ID in .env');
      process.exit(1);
    }

    const apiUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000`;

    console.log('Fetching data.gov.in resource:', apiUrl);
    const resp = await axios.get(apiUrl, { timeout: 60000 });
    const records = resp.data.records || [];

    if (!records.length) {
      console.log('No records fetched. Exiting.');
      process.exit(0);
    }

    const inserted = [];
    for (const r of records) {
      // Mapping logic — adapt to specific dataset fields
      // try multiple commonly named fields
      const incidentType = r.incident_type || r.type || r.category || 'unknown';
      const severity = r.severity || 'Moderate';
      const description = r.description || r.details || r.note || '';
      // Attempt to find lat/lon fields
      let lat = parseFloat(r.latitude || r.lat || r.LATITUDE || r.y);
      let lon = parseFloat(r.longitude || r.lon || r.LONGITUDE || r.x);

      // If coordinates are missing but address exists, leave undefined (or optionally use Nominatim)
      const region = r.region || r.district || r.city || r.state || 'Unknown';

      const timeVal = r.date || r.incident_date || r.datetime || r.time || null;
      let time = timeVal ? new Date(timeVal) : new Date();

      const doc = {
        type: String(incidentType).slice(0, 100),
        severity: severity || 'Moderate',
        description: description ? String(description).slice(0, 2000) : '',
        time,
        location: (isFinite(lat) && isFinite(lon)) ? { type: 'Point', coordinates: [lon, lat] } : undefined,
        source: 'data.gov.in',
        meta: {
          original: r,
          region
        }
      };

      // skip duplicates roughly (if exact match on time+lat+lon)
      if (doc.location) {
        const exists = await Incident.findOne({
          'location.coordinates': doc.location.coordinates,
          time: doc.time
        }).lean();
        if (exists) continue;
      }

      const created = await Incident.create(doc);
      inserted.push(created._id);
    }

    fs.writeFileSync(OUTPATH, JSON.stringify({ inserted, count: inserted.length }, null, 2));
    console.log('Import complete. Inserted:', inserted.length);
    process.exit(0);
  } catch (err) {
    console.error('Import error:', err);
    process.exit(1);
  }
})();
