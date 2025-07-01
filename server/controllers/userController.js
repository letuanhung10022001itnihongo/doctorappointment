/**
 * User Controller
 *
 * Handles all user-related operations including authentication, profile management,
 * and account operations.
 */
const { User, Doctor, Appointment } = require("../models");
const { Op } = require("sequelize"); // Add this for Op.ne and Op.or operations
const sequelize = require("../db/conn"); // Add this for transaction support
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Constants
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "2 days";
const RESET_TOKEN_EXPIRY = "15m";

/**
 * Get user by ID
 *
 * @param {Object} req - Express request object with user ID in params
 * @param {Object} res - Express response object
 * @returns {Object} User information (excluding password)
 */
const getuser = async (req, res) => {
  try {
    // Find user by ID from URL parameter and exclude password field
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json({ message: "Unable to get user", error: error.message });
  }
};

/**
 * Get all users except the requesting user
 *
 * @param {Object} req - Express request object with authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Array} List of users excluding the authenticated user
 */
const getallusers = async (req, res) => {
  try {
    // Find all users except the requesting user and exclude passwords
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.locals }, // Not equal to the authenticated user's ID
      },
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ message: "Unable to get all users", error: error.message });
  }
};

/**
 * User login - validates credentials and issues JWT token
 *
 * @param {Object} req - Request with email, password and role
 * @param {Object} res - Response object
 * @returns {Object} Authentication token and success message
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate request body
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }

    // Verify role matches
    if (user.role !== role) {
      return res
        .status(404)
        .json({ message: "Role does not exist for this account" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.role === "Admin",
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Return success with token
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        pic: user.pic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Unable to login user", error: error.message });
  }
};

/**
 * Register new user
 *
 * @param {Object} req - Request with user data (firstname, lastname, email, password, role)
 * @param {Object} res - Response object
 * @returns {Object} Success message upon registration
 */
const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstname || !lastname || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    // Generate token for immediate login
    const token = jwt.sign(
      {
        userId: newUser.id,
        isAdmin: newUser.role === "Admin",
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ message: "Unable to register user", error: error.message });
  }
};

/**
 * Update user profile
 *
 * @param {Object} req - Request with updated user data and authenticated user ID
 * @param {Object} res - Response object
 * @returns {Object} Success message upon update
 */
const updateprofile = async (req, res) => {
  try {
    const userId = req.locals; // From auth middleware
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    // Update user by ID
    const [updated] = await User.update(updateData, {
      where: { id: userId },
    });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    // Get updated user data (excluding password)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res
      .status(500)
      .json({ message: "Unable to update user", error: error.message });
  }
};

/**
 * Change user password
 *
 * @param {Object} req - Request with user ID, current password, and new password
 * @param {Object} res - Response object
 * @returns {Object} Success message upon password change
 */
const changepassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user's password
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return res
      .status(500)
      .json({ message: "Unable to change password", error: error.message });
  }
};

/**
 * Delete user account and related data
 *
 * @param {Object} req - Request with user ID to delete
 * @param {Object} res - Response object
 * @returns {Object} Success message upon deletion
 */
const deleteuser = async (req, res) => {
  try {
    // Try to get userId from different possible sources
    const userId = req.body.userId || req.body.id || req.params.id;

    // Validate that we have a userId
    if (!userId) {
      console.error("No userId provided in request:", {
        body: req.body,
        params: req.params,
      });
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    // Check if user exists before deletion
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Transaction to ensure all related data is deleted or none
    const result = await sequelize.transaction(async (t) => {
      // Delete related doctor profile if exists
      await Doctor.destroy({
        where: { userId },
        transaction: t,
      });

      // Delete related appointments
      await Appointment.destroy({
        where: {
          [Op.or]: [{ userId }, { doctorId: userId }],
        },
        transaction: t,
      });

      // Delete the user
      const deletedUser = await User.destroy({
        where: { id: userId },
        transaction: t,
      });

      if (!deletedUser) {
        throw new Error("User not found");
      }

      return deletedUser;
    });

    return res.status(200).json({
      message: "User and related data deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("User deletion error:", error);
    return res.status(500).json({
      message: "Unable to delete user",
      error: error.message,
      success: false,
    });
  }
};

/**
 * Send password reset link via email
 *
 * @param {Object} req - Request with user email
 * @param {Object} res - Response object
 * @returns {Object} Success message upon email sent
 */
const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }

    // Generate reset token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: RESET_TOKEN_EXPIRY,
    });

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "tarun.kumar.csbs25@heritageit.edu.in",
        pass: process.env.EMAIL_PASSWORD || "qfhv wohg gjtf ikvz",
      },
    });

    // Create reset link
    const resetLink = `${
      process.env.FRONTEND_URL || "https://appointmentdoctor.netlify.app"
    }/resetpassword/${user.id}/${token}`;

    // Configure email
    const mailOptions = {
      from: process.env.EMAIL_USER || "tarun.kumar.csbs25@heritageit.edu.in",
      to: email,
      subject: "Password Reset Link",
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your Doctor Appointment account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res
          .status(500)
          .json({ status: "Error sending email", error: error.message });
      } else {
        return res
          .status(200)
          .json({ status: "Password reset email sent successfully" });
      }
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
};

/**
 * Reset password using token from email
 *
 * @param {Object} req - Request with user ID, reset token, and new password
 * @param {Object} res - Response object
 * @returns {Object} Success message upon password reset
 */
const resetpassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    // Verify reset token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      try {
        // Find user by ID
        const user = await User.findByPk(id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Update user's password
        await User.update({ password: hashedPassword }, { where: { id } });

        return res.status(200).json({ success: "Password reset successfully" });
      } catch (updateError) {
        console.error("Password update error:", updateError);
        return res
          .status(500)
          .json({
            error: "Failed to update password",
            details: updateError.message,
          });
      }
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// Export all controller functions
module.exports = {
  getuser,
  getallusers,
  login,
  register,
  updateprofile,
  deleteuser,
  changepassword,
  forgotpassword,
  resetpassword,
};
