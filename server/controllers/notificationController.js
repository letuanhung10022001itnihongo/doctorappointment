const { Notification } = global.db;
const { Op } = require('sequelize');

/**
 * Get all notifications for a user
 * @param {Object} req - Request with user ID in locals
 * @param {Object} res - Response object
 */
const getAllNotifications = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Get all notifications for the user, ordered by creation date
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).send("Error retrieving notifications");
  }
};

/**
 * Mark a notification as read
 * @param {Object} req - Request with notification ID
 * @param {Object} res - Response object
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.locals;
    
    // Update the notification
    const result = await Notification.update(
      { isRead: true },
      { 
        where: { 
          id: notificationId,
          userId: userId // Ensure the notification belongs to the user
        }
      }
    );
    
    // Check if any row was updated
    if (result[0] === 0) {
      return res.status(404).send("Notification not found or not owned by the user");
    }
    
    return res.status(200).send("Notification marked as read");
  } catch (error) {
    console.error("Mark notification error:", error);
    return res.status(500).send("Error updating notification");
  }
};

/**
 * Mark all notifications as read for a user
 * @param {Object} req - Request with user ID in locals
 * @param {Object} res - Response object
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Update all unread notifications for the user
    await Notification.update(
      { isRead: 1 },
      { 
        where: { 
          userId: userId,
          isRead: 0
        }
      }
    );
    
    return res.status(200).send("All notifications marked as read");
  } catch (error) {
    console.error("Mark all notifications error:", error);
    return res.status(500).send("Error updating notifications");
  }
};

/**
 * Delete a notification
 * @param {Object} req - Request with notification ID
 * @param {Object} res - Response object
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.locals;
    
    // Delete the notification
    const result = await Notification.destroy({
      where: { 
        id: notificationId,
        userId: userId // Ensure the notification belongs to the user
      }
    });
    
    // Check if any row was deleted
    if (result === 0) {
      return res.status(404).send("Notification not found or not owned by the user");
    }
    
    return res.status(200).send("Notification deleted successfully");
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).send("Error deleting notification");
  }
};

/**
 * Delete all notifications for a user
 * @param {Object} req - Request with user ID in locals
 * @param {Object} res - Response object
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Delete all notifications for the user
    await Notification.destroy({
      where: { userId }
    });
    
    return res.status(200).send("All notifications deleted successfully");
  } catch (error) {
    console.error("Delete all notifications error:", error);
    return res.status(500).send("Error deleting notifications");
  }
};

/**
 * Get unread notification count for a user
 * @param {Object} req - Request with user ID in locals
 * @param {Object} res - Response object
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Count unread notifications
    const count = await Notification.count({
      where: { 
        userId,
        isRead: false
      }
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).send("Error counting notifications");
  }
};

const getallnotifs = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    
    // Get notifications with pagination
    const result = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });
    
    return res.status(200).json({
      data: result.rows,
      totalCount: result.count,
      currentPage: page,
      totalPages: Math.ceil(result.count / limit)
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Unable to get all notifications");
  }
};

module.exports = {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getallnotifs
};