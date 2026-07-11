const nodemailer = require("nodemailer");

module.exports = async function sendEmail(to, subject, htmlMessage) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `TripShield SOS <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlMessage
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};
