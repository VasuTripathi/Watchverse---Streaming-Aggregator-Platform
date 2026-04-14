const express = require("express");
const router = express.Router();

const { getAISearchSuggestions } = require("../controllers/searchController");

router.get("/ai-suggestions", getAISearchSuggestions);

module.exports = router;
