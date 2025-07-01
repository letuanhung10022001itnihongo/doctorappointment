const { DataTypes } = require('sequelize');

/**
 * DoctorSpecification Model for MySQL using Sequelize
 * Junction table for Doctor-Specification many-to-many relationship
 * 
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} DoctorSpecification model
 */
module.exports = (sequelize) => {
  const DoctorSpecification = sequelize.define('DoctorSpecification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Doctors',
        key: 'id'
      }
    },
    specificationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Specifications',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['doctorId', 'specificationId']
      }
    ]
  });

  return DoctorSpecification;
};