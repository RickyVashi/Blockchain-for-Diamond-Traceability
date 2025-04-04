const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/blockchainRecords", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const recordSchema = new mongoose.Schema({
  recordId: String,
  name: String,
  license: String,
  violations: Number,
});

const Record = mongoose.model("Record", recordSchema);

app.post("/api/store", async (req, res) => {
  try {
    const { recordId, name, license, violations } = req.body;
    const newRecord = new Record({ recordId, name, license, violations });
    await newRecord.save();
    res.status(201).json({ message: "Record stored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error storing record" });
  }
});

app.get("/api/records", async (req, res) => {
  const records = await Record.find();
  res.json(records);
});

app.listen(5000, () => console.log("Server running on port 5000"));
