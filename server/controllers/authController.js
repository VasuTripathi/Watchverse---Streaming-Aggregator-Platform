const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER REQUEST:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      watchlist: JSON.stringify([])  // initialize empty watchlist on register
    });

    console.log("USER CREATED:", user.email);

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN REQUEST:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(" WRONG PASSWORD");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ FIX: Supabase returns user.id (not user._id)
    // Using user._id was causing the token to embed undefined,
    // making req.user = undefined in authMiddleware → bigint error
    const token = jwt.sign(
      { id: user.id },          // ← was user._id (wrong for Supabase)
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" LOGIN SUCCESS:", user.email, "| userId:", user.id);

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};