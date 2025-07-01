import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import jwt_decode from "jwt-decode";
import fetchData from "../helper/apiCall";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Login Component
 * 
 * Handles user authentication with role-based login functionality.
 * Supports different roles: Admin, Doctor, and Patient.
 */
function Login() {
  // Redux dispatch for updating global state
  const dispatch = useDispatch();
  
  // Navigation hook for redirecting after login
  const navigate = useNavigate();
  
  // Form state with validation fields
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
    role: "", 
  });

  /**
   * Updates form state when input values change
   * @param {Object} e - Event object from input change
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Validates form data before submission
   * @returns {boolean} Whether the form data is valid
   */
  const validateForm = () => {
    const { email, password, role } = formDetails;
    
    if (!email || !password) {
      toast.error("Email và mật khẩu bắt buộc nhập!");
      return false;
    } 
    
    if (!role) {
      toast.error("Hãy chọn vai trò!");
      return false;
    } 
    
    if (role !== "Admin" && role !== "Doctor" && role !== "Patient") {
      toast.error("Hãy chọn vai trò!");
      return false;
    } 
    
    if (password.length < 5) {
      toast.error("Password cần ít nhất 5 ký tự!");
      return false;
    }
    
    return true;
  };

  /**
   * Handles form submission and authentication
   * @param {Object} e - Form submission event
   */
  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      
      // Validate form before proceeding
      if (!validateForm()) return;
      
      const { email, password, role } = formDetails;

      // Make API call with toast notifications for different states
      const { data } = await toast.promise(
        axios.post("/user/login", { email, password, role }),
        {
          pending: "Đang đăng nhập...",
          success: "Đăng nhập thành công",
          error: "Không thể đăng nhập",
        }
      );
      
      // Store authentication token
      localStorage.setItem("token", data.token);
      
      // Get user ID from JWT token
      const userId = jwt_decode(data.token).userId;
      
      // Set initial user info in Redux store
      dispatch(setUserInfo(userId));
      
      // Fetch complete user data and handle navigation
      await fetchUserDataAndNavigate(userId, role);
      
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  /**
   * Fetches complete user data and navigates to appropriate page
   * @param {string} id - User ID
   * @param {string} role - User role (Admin, Doctor, or Patient)
   */
  const fetchUserDataAndNavigate = async (id, role) => {
    try {
      // Fetch complete user data
      const userData = await fetchData(`/user/getuser/${id}`);
      
      // Update Redux store with complete user data
      dispatch(setUserInfo(userData));
      
      // Navigate based on user role
      if (role === "Admin") {
        navigate("/dashboard/home");
      } else {
        // Both Doctor and Patient roles navigate to home for now
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error loading user data");
    }
  };

  return (
    <>
      <Navbar /> 
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Sign In</h2>
          
          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="register-form">
            {/* Email Field */}
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email"
              value={formDetails.email}
              onChange={handleInputChange}
              aria-label="Email address"
            />
            
            {/* Password Field */}
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Mật khẩu"
              value={formDetails.password}
              onChange={handleInputChange}
              aria-label="Password"
            />
            
            {/* Role Selection */}
            <select
              name="role"
              className="form-input"
              value={formDetails.role}
              onChange={handleInputChange}
              aria-label="Select your role"
            >
              <option value="">Chọn loại</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Bác sĩ</option>
              <option value="Patient">Bệnh nhân</option>
            </select>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn form-btn"
              aria-label="Sign in"
            >
              Đăng nhập
            </button>
          </form>
          
          {/* Forgot Password Link */}
          <NavLink className="login-link" to={"/forgotpassword"}>
            Quên mật khẩu
          </NavLink>
          
          {/* Registration Link */}
          <p>
            Chưa có tài khoản?{" "}
            <NavLink className="login-link" to={"/register"}>
              Đăng ký
            </NavLink>
          </p>
        </div>
      </section>
    </>
  );
}

export default Login;