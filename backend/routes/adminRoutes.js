// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // use protect; optionally check admin role
const adminController = require('../controllers/adminController');

// existing admin endpoints... keep them

// Incidents table (paginated)
router.get('/incidents', protect, adminController.listIncidents);

// Analytics endpoints
router.get('/analytics/type', adminController.incidentsByType);
router.get('/analytics/trend', adminController.trendLast30Days);
router.get('/analytics/regions', adminController.regionSafety);

module.exports = router;
