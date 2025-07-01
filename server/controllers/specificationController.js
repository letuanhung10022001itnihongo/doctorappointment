const { Specification } = require("../models");
const { Op } = require('sequelize');

/**
 * Get all specifications (excluding deleted ones by default)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllSpecifications = async (req, res) => {
  try {
    const { includeDeleted } = req.query;
    
    const whereClause = includeDeleted === 'true' ? {} : { isDeleted: false };
    
    const specifications = await Specification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: specifications
    });
  } catch (error) {
    console.error("Error fetching specifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving specifications",
      error: error.message
    });
  }
};

/**
 * Create a new specification
 * @param {Object} req - Request with specification data
 * @param {Object} res - Response object
 */
const createSpecification = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specification name is required"
      });
    }
    
    // Check if specification already exists (including deleted ones)
    const existingSpec = await Specification.findOne({
      where: { name: name.trim() }
    });
    
    if (existingSpec) {
      if (existingSpec.isDeleted) {
        // Restore deleted specification
        await existingSpec.update({ isDeleted: false });
        return res.status(200).json({
          success: true,
          message: "Specification restored successfully",
          data: existingSpec
        });
      } else {
        return res.status(409).json({
          success: false,
          message: "Specification already exists"
        });
      }
    }
    
    // Create new specification
    const specification = await Specification.create({
      name: name.trim()
    });
    
    return res.status(201).json({
      success: true,
      message: "Specification created successfully",
      data: specification
    });
  } catch (error) {
    console.error("Error creating specification:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating specification",
      error: error.message
    });
  }
};

/**
 * Soft delete a specification
 * @param {Object} req - Request with specification ID
 * @param {Object} res - Response object
 */
const deleteSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Specification ID is required"
      });
    }
    
    const specification = await Specification.findByPk(id);
    
    if (!specification) {
      return res.status(404).json({
        success: false,
        message: "Specification not found"
      });
    }
    
    if (specification.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Specification is already deleted"
      });
    }
    
    // Soft delete
    await specification.update({ isDeleted: true });
    
    return res.status(200).json({
      success: true,
      message: "Specification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting specification:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting specification",
      error: error.message
    });
  }
};

/**
 * Update a specification
 * @param {Object} req - Request with specification data
 * @param {Object} res - Response object
 */
const updateSpecification = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Specification ID is required"
      });
    }
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Specification name is required"
      });
    }
    
    const specification = await Specification.findByPk(id);
    
    if (!specification) {
      return res.status(404).json({
        success: false,
        message: "Specification not found"
      });
    }
    
    // Check if another specification with the same name exists
    const existingSpec = await Specification.findOne({
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id }
      }
    });
    
    if (existingSpec) {
      return res.status(409).json({
        success: false,
        message: "Specification with this name already exists"
      });
    }
    
    await specification.update({ name: name.trim() });
    
    return res.status(200).json({
      success: true,
      message: "Specification updated successfully",
      data: specification
    });
  } catch (error) {
    console.error("Error updating specification:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating specification",
      error: error.message
    });
  }
};

module.exports = {
  getAllSpecifications,
  createSpecification,
  deleteSpecification,
  updateSpecification
};