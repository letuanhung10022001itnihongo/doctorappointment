import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; 
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * ForgotPassword Component
 * 
 * Provides functionality for users to request a password reset link
 * by submitting their email address.
 */
function ForgotPassword() {
  // State to track form input
  const [email, setEmail] = useState("");
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handles input field changes
   * @param {Event} e - The input change event
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  /**
   * Handles form submission
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email input
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      // Send password reset request to server
      const response = await axios.post("/user/forgotpassword", { email });
      
      // Handle successful response
      if (response.status === 200) {
        toast.success("Password reset email sent successfully!");
        navigate('/login');
      }
    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        toast.error(error.response.data.message || "Failed to send password reset email");
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please try again later.");
      } else {
        // Error occurred during request setup
        toast.error("An error occurred. Please try again.");
      }
      console.error("Error details:", error);
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Forgot Password</h2>
          
          {/* Password reset request form */}
          <form onSubmit={handleSubmit} className="register-form">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              aria-label="Email address"
            />
            <button 
              type="submit" 
              className="btn form-btn"
              aria-label="Send password reset email"
            >
              Send Reset Email
            </button>
          </form>
          
          {/* Link back to login page */}
          <NavLink className="login-link" to={"/login"}>
            Back to Login
          </NavLink>
        </div>
      </section>
    </>
  );
}

export default ForgotPassword;