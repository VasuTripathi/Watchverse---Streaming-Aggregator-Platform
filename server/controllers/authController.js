const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER REQUEST:", req.body);

    // ❌ Check missing fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ❌ Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
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

    // ❌ Check missing fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ WRONG PASSWORD");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🎟 Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ LOGIN SUCCESS:", user.email);

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};