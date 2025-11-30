const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const sosController = require('../controllers/sosController');

router.post('/send', protect, sosController.sendSOS);
router.get('/user/:userId', protect, sosController.getUserSOS);

module.exports = router;
