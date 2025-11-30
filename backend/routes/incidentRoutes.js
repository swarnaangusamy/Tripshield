const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const incidentController = require('../controllers/incidentController');

router.post('/', protect, incidentController.createIncident);
router.get('/', protect, incidentController.getIncidents);
router.get('/summary', protect, incidentController.getIncidentSummary);

module.exports = router;
