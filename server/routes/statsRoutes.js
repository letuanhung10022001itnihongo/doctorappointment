const express = require("express");
const statsController = require("../controllers/statsController");

const statsRouter = express.Router();

// Public endpoint - no authentication required
statsRouter.get("/public", statsController.getPublicStats);

module.exports = statsRouter;