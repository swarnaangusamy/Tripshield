const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const createToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/* ========================================================
    REGISTER
======================================================== */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    name,
    phoneNumber,
    email,
    dateOfBirth,
    bloodGroup,
    password,
    emergencyContacts
  } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phoneNumber,
      email,
      dateOfBirth,
      bloodGroup,
      password: hashed,
      emergencyContacts
    });

    await user.save();

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========================================================
    LOGIN
======================================================== */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ========================================================
    REQUEST PASSWORD RESET (send email)
======================================================== */
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent" });
    }

    // 2. Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash it before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // 3. Create reset link (Frontend URL)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // 4. Setup email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    // 5. HTML brand email template
    const htmlContent = `
      <div style="font-family:Arial;padding:20px;border-radius:10px;background:#f6f9fc;color:#333">
        <h2>TripShield Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below. This link is valid for <strong>10 minutes</strong>.</p>
        <a href="${resetURL}" 
           style="padding:10px 20px;background:#0E9AA7;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">
           Reset Password
        </a>
        <br/><br/>
        <p>If you didn't request this, ignore this email.</p>
        <p>– TripShield Support</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "TripShield Password Reset",
      html: htmlContent
    });

    res.json({ message: "Reset link sent. Check your email." });
  } catch (err) {
    console.error("Reset Email Error:", err);
    res.status(500).json({ message: "Server error sending reset email" });
  }
};

/* ========================================================
    RESET PASSWORD (verify token)
======================================================== */
exports.resetPassword = async (req, res) => {
  const { email, newPassword, token } = req.body;

  try {
    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 1. Find user with this token and check expiry
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 2. Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 3. Remove token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
};

/* ========================================================
    USER PROFILE
======================================================== */

// UPDATE PROFILE (includes emergency contacts)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;  // ← FIXED

    const { name, phoneNumber, bloodGroup, emergencyContacts } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;

    if (Array.isArray(emergencyContacts)) {
      user.emergencyContacts = emergencyContacts; 
    }

    await user.save();

    res.json({ message: "Profile updated", user });

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
