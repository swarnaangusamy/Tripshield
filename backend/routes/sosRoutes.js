// backend/routes/sosRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const sosController = require("../controllers/sosController");

// Send SOS
router.post("/send", protect, sosController.sendSOS);

// Get past SOS alerts for user
router.get("/user/:id", protect, sosController.getUserSOS);

module.exports = router;
