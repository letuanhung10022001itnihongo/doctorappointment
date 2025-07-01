import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Register Component
 *
 * Handles user registration with profile image upload and role selection.
 * Includes form validation and secure user registration.
 */
function Register() {
  // State for managing the profile picture
  const [profileImage, setProfileImage] = useState("");

  // State for tracking image upload status
  const [isUploading, setIsUploading] = useState(false);

  // State for form fields
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confpassword: "",
  });

  // State for selected role (separate from form details for better control)
  const [selectedRole, setSelectedRole] = useState("");

  // Navigation hook for redirecting after registration
  const navigate = useNavigate();

  /**
   * Handles input field changes
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Handles file upload to Cloudinary
   * @param {File} file - The file to upload
   */
  const handleImageUpload = useCallback(async (file) => {
    // If no file is selected, return early
    if (!file) return;

    setIsUploading(true);

    try {
      // Validate file type
      if (
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg"
      ) {
        // Create form data for upload
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
        data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

        // Upload to Cloudinary
        const response = await fetch(
          process.env.REACT_APP_CLOUDINARY_BASE_URL,
          {
            method: "POST",
            body: data,
          }
        );

        // Process response
        const responseData = await response.json();

        if (responseData.url) {
          setProfileImage(responseData.url.toString());
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Image upload failed");
        }
      } else {
        toast.error("Please select an image in JPEG or PNG format");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Validates form data before submission
   * @returns {boolean} Whether the form data is valid
   */
  const validateForm = () => {
    const { firstname, lastname, email, password, confpassword } = formDetails;

    // Check for empty fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confpassword ||
      !selectedRole
    ) {
      toast.error("All fields are required");
      return false;
    }

    // Check for profile image
    if (!profileImage) {
      toast.error("Please upload a profile picture");
      return false;
    }

    // Validate first name
    if (firstname.length < 3) {
      toast.error("First name must be at least 3 characters long");
      return false;
    }

    // Validate last name
    if (lastname.length < 3) {
      toast.error("Last name must be at least 3 characters long");
      return false;
    }

    // Validate password
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters long");
      return false;
    }

    // Check if passwords match
    if (password !== confpassword) {
      toast.error("Passwords do not match");
      return false;
    }

    // Check if role is selected
    if (!selectedRole) {
      toast.error("Please select a role");
      return false;
    }

    return true;
  };

  /**
   * Handles form submission for user registration
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit if image is still uploading
    if (isUploading) {
      toast.error("Please wait for image upload to complete");
      return;
    }

    // Validate form before proceeding
    if (!validateForm()) return;

    try {
      const { firstname, lastname, email, password } = formDetails;

      // Register user with toast notifications for different states
      await toast.promise(
        axios.post("/user/register", {
          firstname,
          lastname,
          email,
          password,
          pic: profileImage,
          role: selectedRole,
        }),
        {
          pending: "Đang tạo tài khoản của bạn...",
          success: "Đăng ký thành công! Hãy đăng nhập.",
          error: "Đăng ký thất bại! Hãy thử lại.",
        }
      );

      // Navigate to login page after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      // Display specific error message if available from server
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again later.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center">
        <div className="register-container flex-center">
          <h2 className="form-heading">Đăng ký</h2>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* First name input */}
            <input
              type="text"
              name="firstname"
              className="form-input"
              placeholder="Tên"
              value={formDetails.firstname}
              onChange={handleInputChange}
              aria-label="First name"
            />

            {/* Last name input */}
            <input
              type="text"
              name="lastname"
              className="form-input"
              placeholder="Họ"
              value={formDetails.lastname}
              onChange={handleInputChange}
              aria-label="Last name"
            />

            {/* Email input */}
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email"
              value={formDetails.email}
              onChange={handleInputChange}
              aria-label="Email address"
            />

            {/* Profile picture upload */}
            <input
              type="file"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              name="profile-pic"
              id="profile-pic"
              className="form-input"
              accept="image/jpeg,image/png,image/jpg"
              aria-label="Profile picture"
            />

            {/* Display upload status */}
            {isUploading && (
              <p className="upload-status">Đang tải ảnh lên, xin hãy đợi...</p>
            )}

            {/* Display uploaded image preview */}
            {profileImage && (
              <div className="image-preview has-image">
                <img
                  src={profileImage}
                  alt="Profile Preview"
                  className="preview-img"
                />
              </div>
            )}

            {!profileImage && (
              <div className="image-preview">
                {/* This will show the placeholder text from CSS */}
              </div>
            )}

            {/* Password input */}
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Mật khẩu"
              value={formDetails.password}
              onChange={handleInputChange}
              aria-label="Password"
            />

            {/* Confirm password input */}
            <input
              type="password"
              name="confpassword"
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              value={formDetails.confpassword}
              onChange={handleInputChange}
              aria-label="Confirm password"
            />

            {/* Role selection */}
            <select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-input"
              aria-label="Select your role"
            >
              <option value="">Chọn vai trò</option>
              {/* <option value="Admin">Admin</option> */}
              <option value="Doctor">Bác sĩ</option>
              <option value="Patient">Bệnh nhân</option>
            </select>

            {/* Submit button */}
            <button
              type="submit"
              className="btn form-btn"
              disabled={isUploading}
              aria-label="Sign up"
            >
              {isUploading ? "Uploading..." : "Sign Up"}
            </button>
          </form>

          {/* Login link */}
          <p>
            Đã có tài khoản?{" "}
            <NavLink className="login-link" to={"/login"}>
              Đăng nhập
            </NavLink>
          </p>
        </div>
      </section>
    </>
  );
}

export default Register;
