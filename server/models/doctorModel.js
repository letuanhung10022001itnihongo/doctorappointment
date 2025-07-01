const { DataTypes } = require("sequelize");

/**
 * Doctor Model for MySQL using Sequelize
 *
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} Doctor model
 */
module.exports = (sequelize) => {
  /**
   * Doctor Model
   * Defines the structure for doctor records
   */
  const Doctor = sequelize.define(
    "Doctor",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Reference to the associated User
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      // Doctor's medical specialization
      specialization: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // Years of professional experience
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0, // Experience cannot be negative
        },
      },
      // Consultation fees
      fees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0, // Fees cannot be negative
        },
      },
      // Flag to identify verified doctors
      isDoctor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Not verified by default
      },
    },
    {
      timestamps: true, // Adds createdAt and updatedAt fields
    }
  );

  // Define associations
  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });

    // Many-to-many relationship with Specifications
    Doctor.belongsToMany(models.Specification, {
      through: models.DoctorSpecification,
      foreignKey: "doctorId",
      otherKey: "specificationId",
      as: "specializations",
    });
  };

  return Doctor;
};
