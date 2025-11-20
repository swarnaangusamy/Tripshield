const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      username,
      phone,
      email,
      dob,
      blood,
      password,
      confirmPassword,
      contacts,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      phone,
      email,
      dob,
      blood,
      password: hashedPassword,
      contacts,
    });

    await newUser.save();

    res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error", error });
  }
});

module.exports = router;
