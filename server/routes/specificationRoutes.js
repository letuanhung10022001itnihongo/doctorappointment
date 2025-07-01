const express = require("express");
const specificationController = require("../controllers/specificationController");
const auth = require("../middleware/auth");

const specificationRouter = express.Router();

// Get all specifications
specificationRouter.get(
  "/getallspecifications",
  specificationController.getAllSpecifications
);

// Create new specification (admin only)
specificationRouter.post(
  "/create",
  auth,
  specificationController.createSpecification
);

// Update specification (admin only)
specificationRouter.put(
  "/update/:id",
  auth,
  specificationController.updateSpecification
);

// Delete specification (admin only)
specificationRouter.delete(
  "/delete/:id",
  auth,
  specificationController.deleteSpecification
);

module.exports = specificationRouter;