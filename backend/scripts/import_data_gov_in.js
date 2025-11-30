/**
 * Script to import historic incident data from data.gov.in
 * NOTE: data.gov.in APIs may require API key and specific endpoints. This is a template.
 */
const axios = require('axios');
const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const connectDB = require('../config/db');
require('dotenv').config();

const importData = async () => {
  await connectDB();
  try {
    // Example: fetch CSV/JSON from data.gov.in or a public endpoint
    // Replace with actual endpoint & parsing logic
    const apiUrl = 'https://data.gov.in/api/datastore/resource.json?resource_id=YOUR_RESOURCE_ID&api-key=' + process.env.DATA_GOV_API_KEY;
    const res = await axios.get(apiUrl);
    const records = res.data.records || [];
    for (const r of records) {
      // adapt fields to Incident schema
      const coords = r.longitude && r.latitude ? [parseFloat(r.longitude), parseFloat(r.latitude)] : null;
      const inc = new Incident({
        type: r.incident_type || r.type || 'unknown',
        severity: parseInt(r.severity) || 1,
        description: r.description || '',
        time: r.date ? new Date(r.date) : new Date(),
        location: coords ? { type: 'Point', coordinates: coords } : undefined,
        source: 'data.gov.in'
      });
      await inc.save();
    }
    console.log('Import complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();
