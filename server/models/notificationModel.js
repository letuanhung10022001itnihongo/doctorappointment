const { DataTypes } = require('sequelize');

/**
 * Notification Model for MySQL using Sequelize
 * 
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} Notification model
 */
module.exports = (sequelize) => {
  /**
   * Notification Model
   * Represents a notification entity in the system
   */
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Reference to the user who receives this notification
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // The actual message content of the notification
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Tracks whether the notification has been read by the user
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt fields
  });

  // Define associations
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };

  return Notification;
};