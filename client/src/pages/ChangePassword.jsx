/**
 * Change Password Component
 * 
 * This component allows authenticated users to change their account password.
 * It provides a form for entering current password and setting a new password.
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import jwt_decode from "jwt-decode";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";

// Redux and API
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/profile.css";

// Set the base URL for axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function ChangePassword() {
  // Get user ID from JWT token
  const { userId } = jwt_decode(localStorage.getItem("token"));
  
  // Redux hooks
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  
  // State for user profile image
  const [profileImage, setProfileImage] = useState("");
  
  /**
   * Form state for password change
   * @property {string} password - Current password
   * @property {string} newpassword - New password
   * @property {string} confnewpassword - Confirmation of new password
   */
  const [formDetails, setFormDetails] = useState({
    password: "",
    newpassword: "",
    confnewpassword: "",
  });

  /**
   * Fetches user data from the server
   * Only needed to get the profile image for display
   */
  const fetchUserData = async () => {
    try {
      dispatch(setLoading(true));
      const userData = await fetchData(`/user/getuser/${userId}`);
      
      // We only need the profile picture for display
      setProfileImage(userData.pic);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Could not load user profile");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles form input changes
   * @param {Object} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Validates password change form
   * @returns {boolean} True if validation passes, false otherwise
   */
  const validateForm = () => {
    const { password, newpassword, confnewpassword } = formDetails;
    
    // Check if fields are empty
    if (!password || !newpassword || !confnewpassword) {
      toast.error("All fields are required");
      return false;
    }
    
    // Check if new password is too short
    if (newpassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return false;
    }
    
    // Check if passwords match
    if (newpassword !== confnewpassword) {
      toast.error("New passwords do not match");
      return false;
    }
    
    return true;
  };

  /**
   * Submits the password change form
   * @param {Object} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    const { password, newpassword, confnewpassword } = formDetails;
    
    try {
      dispatch(setLoading(true));
      
      // Send password change request
      const response = await axios.put(
        "/user/changepassword",
        {
          userId,
          currentPassword: password,
          newPassword: newpassword,
          confirmNewPassword: confnewpassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Handle successful password change
      if (response.data === "Password changed successfully") {
        toast.success("Password updated successfully");
        
        // Clear form fields after successful update
        setFormDetails({
          password: "",
          newpassword: "",
          confnewpassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      
      // Display appropriate error message
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="register-section flex-center" aria-labelledby="change-password-heading">
          <div className="profile-container flex-center">
            <h2 id="change-password-heading" className="form-heading">Đổi mật khẩu</h2>
            
            {/* User profile picture */}
            {profileImage && (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="profile-pic" 
              />
            )}
            
            {/* Password change form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Current password field */}
              <div className="form-group">
                <label htmlFor="current-password" className="visually-hidden">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  id="current-password"
                  name="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={formDetails.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {/* New password fields */}
              <div className="form-same-row">
                <div className="form-group">
                  <label htmlFor="new-password" className="visually-hidden">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="new-password"
                    name="newpassword"
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                    value={formDetails.newpassword}
                    onChange={handleInputChange}
                    minLength="6"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm-password" className="visually-hidden">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confnewpassword"
                    className="form-input"
                    placeholder="Xác nhận mật khẩu mới"
                    value={formDetails.confnewpassword}
                    onChange={handleInputChange}
                    minLength="6"
                    required
                  />
                </div>
              </div>
              
              {/* Submit button */}
              <button type="submit" className="btn form-btn">
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
}

export default ChangePassword;