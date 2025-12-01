// backend/routes/mapRoutes.js
const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/nearby', mapController.getNearby);

module.exports = router;
