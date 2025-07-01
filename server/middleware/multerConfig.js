const multer = require('multer');
const path = require('path');

/**
 * Multer configuration for file uploads
 * Handles PDF file uploads with unique filenames
 */

// Set up storage configuration for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store all uploads in the 'uploads/' directory
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp + original extension
    const uniqueSuffix = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

// Define file type restrictions
const fileFilter = (req, file, cb) => {
  // Only accept PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    // Reject non-PDF files with error message
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// Create and configure the multer middleware
const upload = multer({
  storage,
  fileFilter,
  // Could add limits here if needed, e.g., fileSize: 5 * 1024 * 1024 for 5MB limit
});

// Export the configured multer instance
module.exports = upload;