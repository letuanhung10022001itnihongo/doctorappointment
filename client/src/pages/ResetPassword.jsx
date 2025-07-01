import React, { useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * ResetPassword component allows users to create a new password after 
 * requesting a password reset.
 * It receives user ID and reset token from URL parameters.
 */
function ResetPassword() {
  // Extract token and user ID from URL parameters
  const { id, token } = useParams();
  // State to store the new password
  const [password, setPassword] = useState("");
  // Navigate hook for redirection after successful password reset
  const navigate = useNavigate();

  /**
   * Handles password change in the input field
   * @param {Event} e - The input change event
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  /**
   * Handles form submission and password reset request
   * @param {Event} e - The form submit event
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password input
    if (!password) {
      return toast.error("Password is required");
    }

    try {
      // Send password reset request to the server
      const response = await axios.post(`/user/resetpassword/${id}/${token}`, { password });

      // Handle successful password reset
      if (response.status === 200) {
        toast.success("Password reset successfully");
        navigate('/login');
      } 
    } catch (error) {
      // Log error and show error message to user
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Reset Password</h2>
          
          <form onSubmit={handleFormSubmit} className="register-form">
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your new password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
            <button type="submit" className="btn form-btn">
              Reset Password
            </button>
          </form>
          
          <NavLink className="login-link" to="/login">
            Back to Login
          </NavLink>
        </div>
      </section>
    </>
  );
}

export default ResetPassword;