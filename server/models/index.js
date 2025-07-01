const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const sequelize = require('../db/conn');
const db = {};

// Load all model files in the current directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations between models (from individual model files first)
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// Override/Add specific associations with custom aliases
if (db.User && db.Doctor) {
  db.User.hasOne(db.Doctor, { 
    foreignKey: 'userId',
    as: 'doctor' 
  });
  
  db.Doctor.belongsTo(db.User, { 
    foreignKey: 'userId',
    as: 'user'
  });
}

if (db.Doctor && db.Specification && db.DoctorSpecification) {
  // Many-to-many relationship between Doctor and Specification
  db.Doctor.belongsToMany(db.Specification, {
    through: db.DoctorSpecification,
    foreignKey: 'doctorId',
    otherKey: 'specificationId',
    as: 'specializations'
  });
  
  db.Specification.belongsToMany(db.Doctor, {
    through: db.DoctorSpecification,
    foreignKey: 'specificationId',
    otherKey: 'doctorId',
    as: 'doctors'
  });
}

if (db.User && db.Appointment) {
  db.User.hasMany(db.Appointment, { 
    foreignKey: 'userId', 
    as: 'patientAppointments' 
  });
  
  db.User.hasMany(db.Appointment, { 
    foreignKey: 'doctorId', 
    as: 'doctorAppointments' 
  });
  
  db.Appointment.belongsTo(db.User, { 
    foreignKey: 'userId', 
    as: 'patient' 
  });
  
  db.Appointment.belongsTo(db.User, { 
    foreignKey: 'doctorId', 
    as: 'doctor' 
  });
}

if (db.User && db.Notification) {
  // User-Notification associations
  db.User.hasMany(db.Notification, { 
    foreignKey: 'userId' 
  });
  
  db.Notification.belongsTo(db.User, { 
    foreignKey: 'userId' 
  });
}

if (db.User && db.Chat) {
  // User-Chat associations
  db.User.hasMany(db.Chat, { 
    foreignKey: 'patientId', 
    as: 'patientChats' 
  });
  
  db.User.hasMany(db.Chat, { 
    foreignKey: 'doctorId', 
    as: 'doctorChats' 
  });
  
  db.Chat.belongsTo(db.User, { 
    foreignKey: 'patientId', 
    as: 'patient' 
  });
  
  db.Chat.belongsTo(db.User, { 
    foreignKey: 'doctorId', 
    as: 'doctor' 
  });
}

if (db.Chat && db.Message) {
  // Chat-Message associations
  db.Chat.hasMany(db.Message, { 
    foreignKey: 'chatId' 
  });
  
  db.Message.belongsTo(db.Chat, { 
    foreignKey: 'chatId' 
  });
}

if (db.User && db.Message) {
  // User-Message associations
  db.User.hasMany(db.Message, { 
    foreignKey: 'senderId', 
    as: 'sentMessages' 
  });
  
  db.Message.belongsTo(db.User, { 
    foreignKey: 'senderId', 
    as: 'sender' 
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;