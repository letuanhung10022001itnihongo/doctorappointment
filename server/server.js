// Import required modules
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Database connection
const sequelize = require("./db/conn");

// Import models
const UserModel = require('./models/userModel');
const DoctorModel = require('./models/doctorModel');
const AppointmentModel = require('./models/appointmentModel');
const NotificationModel = require('./models/notificationModel');
const GAuthModel = require('./models/gauth');

// Initialize models
const User = UserModel(sequelize);
const Doctor = DoctorModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const Notification = NotificationModel(sequelize);
const GUser = GAuthModel(sequelize);

// Set up associations
User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Appointment, { foreignKey: 'userId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Make models globally available
global.db = {
  User,
  Doctor,
  Appointment,
  Notification,
  GUser
};

// Initialize Express application
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Set port from environment variables or use default
const port = process.env.PORT || 5015;

// Middleware setup
app.use(cors());
app.use(express.json());

// Import route handlers
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const notificationRouter = require("./routes/notificationRouter");
const specificationRouter = require("./routes/specificationRoutes");
const statsRouter = require("./routes/statsRoutes");

// API Routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/specification", specificationRouter);
app.use("/api/stats", statsRouter);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, "./client/build")));

// Handle all other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Store online users
const onlineUsers = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user login
  socket.on('login', async (userId) => {
    try {
      // Store user connection
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} logged in`);
      
      // Get unread notifications for the user
      const unreadNotifications = await Notification.findAll({
        where: {
          userId: userId,
          isRead: false
        },
        order: [['createdAt', 'DESC']]
      });
      
      // Send unread notifications to the user
      socket.emit('notifications', unreadNotifications);
    } catch (error) {
      console.error('Socket login error:', error);
    }
  });

  // Handle notification marking as read
  socket.on('markAsRead', async (notificationId) => {
    try {
      await Notification.update(
        { isRead: true },
        { where: { id: notificationId } }
      );
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    // Find and remove the disconnected user
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io available globally for other modules
global.io = io;
global.onlineUsers = onlineUsers;

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });