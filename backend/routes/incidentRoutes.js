// backend/routes/incidentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // requires token for reporting (recommended)
const upload = require('../middleware/upload');
const incidentController = require('../controllers/incidentController');

// report incident (protected)
router.post('/report',  upload.single('image'), incidentController.reportIncident);

// list incidents (optional protected)
router.get('/', incidentController.getIncidents);

module.exports = router;
