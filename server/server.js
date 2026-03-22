const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// 🔥 CREATE APP
const app = express();

// ================= DATABASE =================
connectDB();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true
}));

app.use(express.json()); // parse JSON

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Watchverse Backend Running 🚀");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});