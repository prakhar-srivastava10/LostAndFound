const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB ================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch(err => console.log(err));

/* ================= MODELS ================= */

// USER
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

// ITEM
const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  itemName: String,
  description: String,
  type: String, // Lost / Found
  location: String,
  date: { type: Date, default: Date.now },
  contactInfo: String
});
const Item = mongoose.model("Item", itemSchema);

/* ================= AUTH MIDDLEWARE ================= */

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

/* ================= AUTH APIs ================= */

// REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hash });
    res.json("Registered successfully");
  } catch {
    res.status(400).json("Email already exists");
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

/* ================= ITEM APIs ================= */
// SEARCH
app.get("/api/items/search", auth, async (req, res) => {
  try {
    const name = req.query.name;

    if (!name) {
      return res.status(400).json("Search query missing");
    }

    const items = await Item.find({
      $or: [
        { itemName: { $regex: name, $options: "i" } },
        { description: { $regex: name, $options: "i" } },
        { type: { $regex: name, $options: "i" } }
      ]
    });

    res.json(items);

  } catch (err) {
    console.log("Search error FULL:", err); // 👈 full error print
    res.status(500).json("Server error");
  }
});


// ADD ITEM
app.post("/api/items", auth, async (req, res) => {
  const item = await Item.create({
    ...req.body,
    userId: req.user.id
  });
  res.json(item);
});



// GET ALL ITEMS
app.get("/api/items", auth, async (req, res) => {
  const items = await Item.find();
  res.json(items);
});



// GET ITEM BY ID
app.get("/api/items/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ IMPORTANT SAFETY CHECK
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("Invalid ID format");
    }

    const item = await Item.findById(id);
    res.json(item);

  } catch (err) {
    res.status(500).json("Error fetching item");
  }
});

// UPDATE ITEM
app.put("/api/items/:id", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item.userId.toString() !== req.user.id)
    return res.status(403).json("Not allowed");

  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE ITEM
app.delete("/api/items/:id", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (item.userId.toString() !== req.user.id)
    return res.status(403).json("Not allowed");

  await Item.findByIdAndDelete(req.params.id);
  res.json("Deleted");
});



/* ================= SERVER ================= */
app.listen(process.env.PORT, () => console.log("Server running"));