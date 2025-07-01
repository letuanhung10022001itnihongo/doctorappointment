const { DataTypes } = require('sequelize');

/**
 * User Model for MySQL using Sequelize
 * Converted from the original MongoDB schema
 * 
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} User model
 */
module.exports = (sequelize) => {
  /**
   * User Model
   * Defines the structure for User records in the database
   */
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Personal information
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100] // Minimum length 3
      }
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100] // Minimum length 3
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: {
          msg: 'Email address is required'
        }
      },
      set(value) {
        // Ensure email is stored in lowercase
        this.setDataValue('email', value.toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [5, 255] // Minimum length 5
      }
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Doctor', 'Patient'),
      allowNull: false
    },
    
    // Optional user details with default values
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other', ''),
      defaultValue: ''
    },
    mobile: {
      type: DataTypes.STRING(20),
      defaultValue: ''
    },
    address: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: ''
    },
    pic: {
      type: DataTypes.STRING(255),
      defaultValue: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    }
  }, {
    // Enable timestamps (createdAt, updatedAt)
    timestamps: true
  });

  // Define associations
  User.associate = (models) => {
    // User can have many appointments as a patient
    User.hasMany(models.Appointment, {
      foreignKey: 'userId',
      as: 'patientAppointments'
    });
    
    // User can have many appointments as a doctor
    User.hasMany(models.Appointment, {
      foreignKey: 'doctorId',
      as: 'doctorAppointments'
    });
    
    // Doctor association
    User.hasOne(models.Doctor, {
      foreignKey: 'userId'
    });
    
    // Notifications received by this user
    User.hasMany(models.Notification, {
      foreignKey: 'userId'
    });
  };

  return User;
};