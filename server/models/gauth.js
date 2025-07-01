const { DataTypes } = require('sequelize');

/**
 * Google Authentication User Model
 * This module defines the data structure for users authenticated via Google OAuth
 * 
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} GUser model
 */
module.exports = (sequelize) => {
  /**
   * Google User Model
   * Stores information about users who authenticate via Google OAuth
   */
  const GUser = sequelize.define('GUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    googleId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt fields
  });

  return GUser;
};