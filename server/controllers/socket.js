// Import required modules
const express = require("express");
const cors = require("cors");
const path = require("path");
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

// Socket controller
require("./controllers/socket");

// Import route handlers
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const notificationRouter = require("./routes/notificationRoutes");

// Initialize Express application
const app = express();

// Set port from environment variables or use default
const port = process.env.PORT || 5015;

// Middleware setup
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, "./client/build")));

// Handle all other routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });