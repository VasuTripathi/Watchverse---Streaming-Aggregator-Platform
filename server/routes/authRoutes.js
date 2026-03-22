const express = require("express");
const router = express.Router();

// ✅ IMPORT CONTROLLER FUNCTIONS
const { register, login } = require("../controllers/authController");

// ================= ROUTES =================
router.post("/register", register);
router.post("/login", login);

module.exports = router;