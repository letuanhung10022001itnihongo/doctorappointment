/**
 * Database connection module using MySQL and Sequelize
 */
const { Sequelize } = require('sequelize');

// Load environment variables from .env file
require('dotenv').config();

// Database configuration
const DB_NAME = process.env.DB_NAME || 'doctor_appointment';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '123456';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_DIALECT = 'mysql';

/**
 * Initialize Sequelize with database configuration
 * Sets up connection pool and other options for optimal performance
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,              // Maximum number of connection in pool
    min: 0,               // Minimum number of connection in pool
    acquire: 30000,       // Maximum time (ms) to acquire a connection
    idle: 10000           // Maximum time (ms) a connection can be idle
  },
  define: {
    timestamps: true,     // Default timestamps for all models
    underscored: false    // Don't convert camelCase to snake_case
  },
  dialectOptions: {
    // MySQL specific options
    dateStrings: true,
    typeCast: true
  },
  timezone: '+00:00'      // UTC timezone for consistent timestamps
});

/**
 * Test database connection
 */
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

// Export the sequelize instance directly
module.exports = sequelize;