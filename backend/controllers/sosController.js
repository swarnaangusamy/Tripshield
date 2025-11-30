const SOSAlert = require('../models/SOSAlert');
const nodemailer = require('nodemailer');
// placeholder for SMS provider, e.g., Twilio
// const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

exports.sendSOS = async (req, res) => {
  try {
    const { userId, message, coordinates, recipients } = req.body;
    const sos = new SOSAlert({
      user: userId,
      message,
      location: { type: 'Point', coordinates },
      recipients
    });
    await sos.save();

    // send emails to recipients (simplified)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const sendPromises = recipients.map(r =>
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: r.email || process.env.SMTP_USER,
        subject: 'SOS Alert from TripShield',
        text: `${message}\nLocation: ${coordinates && coordinates.join(',')}`
      })
    );

    await Promise.all(sendPromises);

    // TODO: SMS via Twilio
    res.json({ message: 'SOS sent', sos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserSOS = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sosList = await SOSAlert.find({ user: userId }).sort({ time: -1 });
    res.json(sosList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
