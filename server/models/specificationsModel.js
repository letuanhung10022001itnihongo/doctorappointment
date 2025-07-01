const { DataTypes } = require("sequelize");

/**
 * Specification Model for MySQL using Sequelize
 *
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} Specification model
 */
module.exports = (sequelize) => {
  /**
   * Specification Model
   * Represents medical specializations available in the system
   */
  const Specification = sequelize.define(
    "Specification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Name of the medical specialization
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Specification name cannot be empty",
          },
          len: {
            args: [2, 255],
            msg: "Specification name must be between 2 and 255 characters",
          },
        },
      },
      // Soft delete flag
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt fields
    }
  );

  // Define associations
  Specification.associate = (models) => {
    // Many-to-many relationship with Doctors
    Specification.belongsToMany(models.Doctor, {
      through: models.DoctorSpecification,
      foreignKey: "specificationId",
      otherKey: "doctorId",
      as: "doctors",
    });
  };

  return Specification;
};
