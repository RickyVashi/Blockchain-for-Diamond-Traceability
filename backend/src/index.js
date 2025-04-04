const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Local Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/diamonds", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected on localhost"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Diamond Schema
const DiamondSchema = new mongoose.Schema({
  diamondId: { type: String, required: true, unique: true },
  certificationHash: { type: String, required: true },
  owner: { type: String, required: true },
  history: [
    {
      previousOwner: String,
      newOwner: String,
      status: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Diamond = mongoose.model("Diamond", DiamondSchema);

// ✅ Register Diamond
app.post("/register", async (req, res) => {
  const { diamondId, certificationHash, owner } = req.body;
  try {
    const newDiamond = new Diamond({ diamondId, certificationHash, owner, history: [] });
    await newDiamond.save();
    res.json({ success: true, message: "Diamond Registered Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Transfer Diamond Ownership
app.post("/transfer", async (req, res) => {
  const { diamondId, newOwner, status } = req.body;
  try {
    const diamond = await Diamond.findOne({ diamondId });
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond Not Found" });

    const transferRecord = {
      previousOwner: diamond.owner,
      newOwner,
      status,
      timestamp: new Date(),
    };

    diamond.owner = newOwner;
    diamond.history.push(transferRecord);
    await diamond.save();

    res.json({ success: true, message: "Diamond Ownership Transferred" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get Diamond History
app.get("/history/:diamondId", async (req, res) => {
  try {
    const diamond = await Diamond.findOne({ diamondId: req.params.diamondId });
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond Not Found" });

    res.json({ success: true, history: diamond.history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Verify Certification Hash
app.get("/verify/:diamondId", async (req, res) => {
  try {
    const diamond = await Diamond.findOne({ diamondId: req.params.diamondId });
    if (!diamond) return res.status(404).json({ success: false, message: "Diamond Not Found" });

    res.json({ success: true, certificationHash: diamond.certificationHash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server on localhost
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
