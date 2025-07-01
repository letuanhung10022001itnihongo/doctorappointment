const express = require("express");
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const notificationRouter = express.Router();

notificationRouter.get(
  "/getallnotifs",
  auth,
  notificationController.getallnotifs
);

// Add new route to mark all notifications as read
notificationRouter.put(
  "/markallread",
  auth,
  notificationController.markAllAsRead
);

// Add route to get unread count
notificationRouter.get(
  "/unreadcount",
  auth,
  notificationController.getUnreadCount
);

module.exports = notificationRouter;