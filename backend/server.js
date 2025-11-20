const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const registerRoute = require("./routes/registerRoute");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// MONGODB CONNECTION
mongoose
  .connect("mongodb://127.0.0.1:27017/tripshieldDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ROUTES
app.use("/api", registerRoute);

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));
