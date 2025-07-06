-- Create database if not exists
CREATE DATABASE IF NOT EXISTS doctor_appointment;
USE doctor_appointment;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Doctor', 'Patient') NOT NULL,
  age INT DEFAULT NULL,
  gender ENUM('Male', 'Female', 'Other', '') DEFAULT '',
  mobile VARCHAR(20) DEFAULT '',
  address TEXT,
  status VARCHAR(50) DEFAULT '',
  pic VARCHAR(255) DEFAULT 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);


-- Google Auth Users table
CREATE TABLE IF NOT EXISTS GUsers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  googleId VARCHAR(100) NOT NULL UNIQUE,
  displayName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_googleId (googleId),
  INDEX idx_email (email)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS Doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  specialization VARCHAR(100) NOT NULL,
  experience INT NOT NULL CHECK (experience >= 0),
  fees DECIMAL(10,2) NOT NULL CHECK (fees >= 0),
  isDoctor BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_specialization (specialization)
);

-- Appointments table
CREATE TABLE Appointments (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Foreign key references
    userId INT NOT NULL,
    doctorId INT NOT NULL,
    
    -- Appointment scheduling fields
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    
    -- Patient information
    age INT NOT NULL,
    email VARCHAR(255) NULL,
    bloodGroup VARCHAR(5) NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    number VARCHAR(15) NOT NULL,
    familyDiseases TEXT NULL,
    
    -- Appointment status
    status VARCHAR(50) DEFAULT 'Waiting_for_confirmation',
    
    -- Timestamps
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_appointments_user 
        FOREIGN KEY (userId) REFERENCES Users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    CONSTRAINT fk_appointments_doctor 
        FOREIGN KEY (doctorId) REFERENCES Users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_appointments_date (date),
    INDEX idx_appointments_doctor_date (doctorId, date),
    INDEX idx_appointments_user_date (userId, date),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_time_range (startTime, endTime),
    
    -- Ensure end time is after start time
    CONSTRAINT chk_time_range CHECK (endTime > startTime),
    
    -- Prevent overlapping appointments for the same doctor on the same date
    UNIQUE KEY unique_doctor_time_slot (doctorId, date, startTime, endTime)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_isRead (isRead)
);

-- 12062025
-- Create Specifications table
CREATE TABLE IF NOT EXISTS Specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  isDeleted BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_isDeleted (isDeleted)
);

-- Junction table for Doctor-Specification many-to-many relationship
CREATE TABLE IF NOT EXISTS DoctorSpecifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  specificationId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES Doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (specificationId) REFERENCES Specifications(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doctor_spec (doctorId, specificationId),
  INDEX idx_doctor (doctorId),
  INDEX idx_specification (specificationId)
);