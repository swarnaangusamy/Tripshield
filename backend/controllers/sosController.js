// backend/controllers/sosController.js
const User = require("../models/User");
const SOSAlert = require("../models/SOSAlert");
const sendEmail = require("../utils/sendEmail");

// Helper for formatting time
const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString("en-IN", { hour12: true });
};

/* ======================================================
   SEND SOS
====================================================== */
exports.sendSOS = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { emergencyType, latitude, longitude } = req.body;

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location missing" });
    }

    const googleMapURL = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Create SOS entry in DB
    const sos = new SOSAlert({
      user: user._id,
      time: new Date(),
      location: { type: "Point", coordinates: [longitude, latitude] },
      message: emergencyType,
      recipients: user.emergencyContacts
    });

    await sos.save();

    // Email content
    const emailMessage = `
      🚨 <b>SOS ALERT</b> 🚨<br><br>

      <b>Emergency Type:</b> ${emergencyType}<br>
      <b>User:</b> ${user.name}<br>
      <b>Phone:</b> ${user.phoneNumber}<br>
      <b>Email:</b> ${user.email}<br><br>

      Needs help immediately!<br><br>

      <b>Location:</b> <a href="${googleMapURL}">${googleMapURL}</a><br>
      <b>Time:</b> ${formatDateTime()}<br>
    `;

    // Send emails
    for (let c of user.emergencyContacts) {
      if (c.email) {
        await sendEmail(
          c.email,
          `SOS Alert - ${user.name}`,
          emailMessage
        );
      }
    }

    res.json({ message: "SOS sent successfully" });

  } catch (err) {
    console.error("SOS ERROR:", err);
    res.status(500).json({ message: "Failed to send SOS" });
  }
};


/* ======================================================
   GET SOS HISTORY OF A USER (Fixes the crash)
====================================================== */
exports.getUserSOS = async (req, res) => {
  try {
    const userId = req.params.id;

    const history = await SOSAlert.find({ user: userId }).sort({ time: -1 });

    res.json(history);

  } catch (err) {
    console.error("getUserSOS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch SOS history" });
  }
};
