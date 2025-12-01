require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const sosRoutes = require('./routes/sosRoutes');

const mapRoutes = require('./routes/mapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
connectDB();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/incidents', require('./routes/incidentRoutes'));

app.use('/api/sos', sosRoutes);

app.use('/api/map', mapRoutes);

app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('TripShield Backend is running'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0")
  .on("listening", () => {
    console.log(`✅ Server successfully running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err);
  });

