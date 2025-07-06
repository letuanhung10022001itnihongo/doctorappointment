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
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success"); // "success" or "error"
  
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
      
      // Handle successful password change based on status code
      if (response.status === 200) {
        // Show success modal
        setModalType("success");
        setModalMessage("Mật khẩu đã được cập nhật thành công!");
        setShowModal(true);
        
        // Clear form fields after successful update
        setFormDetails({
          password: "",
          newpassword: "",
          confnewpassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      
      // Show error modal
      setModalType("error");
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data;
      }
      
      setModalMessage(errorMessage);
      setShowModal(true);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Renders the result modal
   */
  const renderResultModal = () => (
    <div
      className="modal flex-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="modal__content"
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "20px",
          width: "400px",
          maxWidth: "90%",
          textAlign: "center",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Modal Icon */}
        <div style={{ marginBottom: "1rem" }}>
          {modalType === "success" ? (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#28a745",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                fontSize: "24px",
                color: "white",
              }}
            >
              ✓
            </div>
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#dc3545",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                fontSize: "24px",
                color: "white",
              }}
            >
              ✕
            </div>
          )}
        </div>

        {/* Modal Title */}
        <h2
          style={{
            color: modalType === "success" ? "#28a745" : "#dc3545",
            marginBottom: "1rem",
            fontSize: "1.5rem",
          }}
        >
          {modalType === "success" ? "Thành công!" : "Lỗi!"}
        </h2>

        {/* Modal Message */}
        <p
          style={{
            color: "#666",
            marginBottom: "2rem",
            fontSize: "1rem",
            lineHeight: "1.5",
          }}
        >
          {modalMessage}
        </p>

        {/* Modal Button */}
        <button
          onClick={() => setShowModal(false)}
          className="btn"
          style={{
            backgroundColor: modalType === "success" ? "#28a745" : "#dc3545",
            color: "white",
            padding: "0.75rem 2rem",
            borderRadius: "25px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="register-section flex-center">
          <div className="register-container">
            {/* Card-like container */}
            <div className="profile-container" style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              textAlign: 'center'
            }}>
              {/* Centered title */}
              <h2 className="form-heading" style={{ 
                marginBottom: '1.5rem',
                color: 'var(--bold-text-color)',
                textAlign: 'center'
              }}>
                Đổi mật khẩu
              </h2>
              
              {/* User profile picture centered */}
              {profileImage && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '2rem' 
                }}>
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="profile-pic"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--light-blue)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                </div>
              )}
              
              {/* Password change form */}
              <form onSubmit={handleSubmit} className="register-form">
                {/* Current password field */}
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={formDetails.password}
                  onChange={handleInputChange}
                  aria-label="Current password"
                  style={{ textAlign: 'left' }}
                />
                
                {/* New password fields */}
                <div className="form-same-row">
                  <input
                    type="password"
                    name="newpassword"
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                    value={formDetails.newpassword}
                    onChange={handleInputChange}
                    minLength="6"
                    aria-label="New password"
                    style={{ textAlign: 'left' }}
                  />
                  
                  <input
                    type="password"
                    name="confnewpassword"
                    className="form-input"
                    placeholder="Xác nhận mật khẩu mới"
                    value={formDetails.confnewpassword}
                    onChange={handleInputChange}
                    minLength="6"
                    aria-label="Confirm new password"
                    style={{ textAlign: 'left' }}
                  />
                </div>
                
                {/* Submit button */}
                <button type="submit" className="btn form-btn">
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
      
      {/* Result Modal */}
      {showModal && renderResultModal()}
      
      <Footer />
    </>
  );
}

export default ChangePassword;