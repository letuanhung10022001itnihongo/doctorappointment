import React, { useEffect, useState, useCallback } from "react";
import "../styles/profile.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";
import fetchData from "../helper/apiCall";
import jwt_decode from "jwt-decode";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Profile Component
 * 
 * Allows users to view and update their profile information.
 * Includes form validation and secure profile updates.
 */
function Profile() {
  // Get user ID from JWT token
  const { userId } = jwt_decode(localStorage.getItem("token") || "");
  
  // Redux hooks
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  
  // State for profile picture
  const [file, setFile] = useState("");
  
  // State for form fields
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    mobile: "",
    gender: "neither",
    address: "",
    password: "",
    confpassword: "",
  });

  /**
   * Fetches user data from the server
   * Updates the form with current user information
   */
  const getUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      
      // Fetch user data
      const userData = await fetchData(`/user/getuser/${userId}`);
      
      // Update form with user data, handling null values
      setFormDetails({
        ...userData,
        password: "",
        confpassword: "",
        mobile: userData.mobile === null ? "" : userData.mobile,
        age: userData.age === null ? "" : userData.age,
      });
      
      // Set profile picture
      setFile(userData.pic);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile information");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Fetch user data on component mount
  useEffect(() => {
    getUser();
  }, [getUser]);

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
   * Validates form data before submission
   * @returns {boolean} Whether the form data is valid
   */
  const validateForm = () => {
    const { firstname, lastname, email, password, confpassword } = formDetails;
    
    if (!email) {
      toast.error("Email không được để trống");
      return false;
    }
    
    if (firstname.length < 3) {
      toast.error("Tên phải dài ít nhất 3 ký tự");
      return false;
    }
    
    if (lastname.length < 3) {
      toast.error("Họ phải dài ít nhất 3 ký tự");
      return false;
    }
    
    if (password && password.length < 5) {
      toast.error("Mật khẩu ít nhất 5 ký tự");
      return false;
    }
    
    if (password !== confpassword) {
      toast.error("Mật khẩu không khớp");
      return false;
    }
    
    return true;
  };

  /**
   * Handles form submission to update profile
   * @param {Event} e - The form submission event
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before proceeding
    if (!validateForm()) return;
    
    try {
      const {
        firstname,
        lastname,
        email,
        age,
        mobile,
        address,
        gender,
        password,
      } = formDetails;

      // Send update request with toast notifications
      await toast.promise(
        axios.put(
          "/user/updateprofile",
          {
            firstname,
            lastname,
            age,
            mobile,
            address,
            gender,
            email,
            password,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          pending: "Đang cập nhật thông tin...",
          success: "Thông tin cập nhật thành công",
          error: "Không thể cập nhật thông tin",
        }
      );

      // Clear sensitive fields after successful update
      setFormDetails({ 
        ...formDetails, 
        password: "", 
        confpassword: "" 
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Unable to update profile");
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="register-section flex-center">
          <div className="profile-container flex-center">
            <h2 className="form-heading">Thông tin cá nhân</h2>
            
            {/* Profile Picture */}
            <img
              src={file}
              alt="Profile"
              className="profile-pic"
            />
            
            {/* Profile Form */}
            <form
              onSubmit={handleFormSubmit}
              className="register-form"
            >
              {/* Name Fields */}
              <div className="form-same-row">
                <input
                  type="text"
                  name="firstname"
                  className="form-input"
                  placeholder="Tên"
                  value={formDetails.firstname}
                  onChange={handleInputChange}
                  aria-label="First name"
                />
                <input
                  type="text"
                  name="lastname"
                  className="form-input"
                  placeholder="Họ"
                  value={formDetails.lastname}
                  onChange={handleInputChange}
                  aria-label="Last name"
                />
              </div>
              
              {/* Email and Gender Fields */}
              <div className="form-same-row">
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Email"
                  value={formDetails.email}
                  onChange={handleInputChange}
                  aria-label="Email address"
                />
                <select
                  name="gender"
                  value={formDetails.gender}
                  className="form-input"
                  id="gender"
                  onChange={handleInputChange}
                  aria-label="Gender"
                >
                  <option value="neither">Khác</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              
              {/* Age and Mobile Fields */}
              <div className="form-same-row">
                <input
                  type="text"
                  name="age"
                  className="form-input"
                  placeholder="Tuổi"
                  value={formDetails.age}
                  onChange={handleInputChange}
                  aria-label="Age"
                />
                <input
                  type="text"
                  name="mobile"
                  className="form-input"
                  placeholder="Số điện thoại"
                  value={formDetails.mobile}
                  onChange={handleInputChange}
                  aria-label="Mobile number"
                />
              </div>
              
              {/* Address Field */}
              <textarea
                name="address"
                className="form-input"
                placeholder="Địa chỉ"
                value={formDetails.address}
                onChange={handleInputChange}
                rows="2"
                aria-label="Address"
              ></textarea>
              
              {/* Password Fields */}
              <div className="form-same-row">
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Mật khẩu"
                  value={formDetails.password}
                  onChange={handleInputChange}
                  aria-label="Password"
                />
                <input
                  type="password"
                  name="confpassword"
                  className="form-input"
                  placeholder="Xác nhận mật khẩu"
                  value={formDetails.confpassword}
                  onChange={handleInputChange}
                  aria-label="Confirm password"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="btn form-btn"
                aria-label="Update profile"
              >
                Cập nhật thông tin
              </button>
            </form>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
}

export default Profile;