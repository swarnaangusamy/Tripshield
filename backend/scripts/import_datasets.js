const mongoose = require("mongoose");
const csv = require("csvtojson");
const Crime = require("../models/Crime");
const RoadAccident = require("../models/RoadAccident");
require("dotenv").config();

function safeNumber(v) {
  const n = Number(String(v).replace(/[, ]/g, "").trim());
  return isNaN(n) ? null : n;
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");

    /** -------------------------------
     * 1) IMPORT CRIME DATA
     * --------------------------------*/
    const crimeRows = await csv().fromFile("./data/crime.csv");

    const cleanCrime = crimeRows
      .map((row) => ({
        state: row["State/UT"]?.trim(),
        year2020: safeNumber(row["2020"]),
        year2021: safeNumber(row["2021"]),
        year2022: safeNumber(row["2022"]),
        population: safeNumber(row["Mid-Year Projected Population (in Lakhs) (2022)"]),
        rate: safeNumber(row["Rate of Cognizable Crimes (IPC) (2022)"]),
        chargesheetRate: safeNumber(row["Chargesheeting Rate (2022)"])
      }))
      .filter(
        (x) =>
          x.state &&
          x.year2020 !== null &&
          x.year2021 !== null &&
          x.year2022 !== null &&
          x.population !== null
      ); // prevent NaN errors

    await Crime.deleteMany();
    await Crime.insertMany(cleanCrime);
    console.log(`Crime imported: ${cleanCrime.length} records`);


    /** -------------------------------
     * 2) IMPORT ROAD ACCIDENT DATA
     * --------------------------------*/
    const roadRows = await csv().fromFile("./data/road.csv");

    const cleanRoad = roadRows
      .map((row) => ({
        state: row["State/UT/City"]?.trim(),
        roadCases: safeNumber(row["Road Accidents - Cases"]),
        roadInjured: safeNumber(row["Road Accidents - Injured"]),
        roadDied: safeNumber(row["Road Accidents - Died"]),
        railwayCases: safeNumber(row["Railway Accidents - Cases"]),
        totalCases: safeNumber(row["Total Traffic Accidents - Cases"]),
        totalInjured: safeNumber(row["Total Traffic Accidents - Injured"]),
        totalDied: safeNumber(row["Total Traffic Accidents - Died"])
      }))
      .filter((x) => x.state && x.totalCases !== null);

    await RoadAccident.deleteMany();
    await RoadAccident.insertMany(cleanRoad);
    console.log(`Road accident data imported: ${cleanRoad.length} records`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
