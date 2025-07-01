const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Authentication middleware using JSON Web Tokens (JWT)
 * Validates the token from the request Authorization header
 * and attaches the user ID to the request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const auth = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send("Authorization header missing");
    }

    // Split the "Bearer <token>" format and get the token part
    const [bearer, token] = authHeader.split(" ");
    
    if (!token || bearer !== "Bearer") {
      return res.status(401).send("Invalid authorization format");
    }

    try {
      // Verify the token using the secret key
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify that the user exists in the database
      const user = await User.findByPk(decodedToken.userId);
      if (!user) {
        return res.status(401).send("User not found");
      }
      
      // Attach the user ID from the token to the request object
      req.locals = decodedToken.userId;
      
      // Proceed to the next middleware or route handler
      next();
    } catch (jwtError) {
      // Specific handling for JWT verification errors
      return res.status(401).send(`Token verification failed: ${jwtError.message}`);
    }
  } catch (error) {
    // General error handling
    console.error("Authentication error:", error.message);
    return res.status(401).send("Authentication failed");
  }
};

module.exports = auth;