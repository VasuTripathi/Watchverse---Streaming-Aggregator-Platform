const express = require("express");
const router = express.Router();

const { saveActivity } = require("../controllers/activityController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, saveActivity);

module.exports = router;