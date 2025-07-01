/**
 * Doctor Application Form Component
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";

// Styles
import "../styles/applydoctor.css";

// Configure axios base URL from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const ApplyDoctor = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [formDetails, setFormDetails] = useState({
    specializations: [],
    experience: "",
    fees: "",
  });

  const [availableSpecifications, setAvailableSpecifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Temporary fallback data for testing
  const fallbackSpecifications = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Dermatology" },
    { id: 3, name: "Neurology" },
    { id: 4, name: "Orthopedics" },
    { id: 5, name: "Pediatrics" }
  ];

  useEffect(() => {
    fetchSpecifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching specifications...");
      console.log("📍 Base URL:", axios.defaults.baseURL);

      const response = await axios.get("/specification/getallspecifications");
      console.log("✅ API Response received:", response);
      console.log("📊 Response data:", response.data);

      if (response.data && response.data.success && response.data.data) {
        console.log("✅ Setting specifications to state:", response.data.data);
        setAvailableSpecifications(response.data.data);
      } else {
        console.log("⚠️ API response format issue, using fallback data");
        setAvailableSpecifications(fallbackSpecifications);
        toast.error("Using fallback data - please check API");
      }
    } catch (error) {
      console.error("❌ Error fetching specifications:", error);
      console.log("🔄 Using fallback data due to API error");
      setAvailableSpecifications(fallbackSpecifications);
      toast.error("Failed to load from API - using sample data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formDetails.specializations || formDetails.specializations.length === 0) {
      toast.error("Please select at least one specialization");
      return false;
    }
    
    if (!formDetails.experience || Number(formDetails.experience) <= 0) {
      toast.error("Please enter valid years of experience");
      return false;
    }
    
    if (!formDetails.fees || Number(formDetails.fees) <= 0) {
      toast.error("Please enter valid consultation fees");
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const toggleSpecialization = (specId) => {
    console.log("🔄 Toggling specialization:", specId);
    const isSelected = formDetails.specializations.includes(specId);

    if (isSelected) {
      setFormDetails({
        ...formDetails,
        specializations: formDetails.specializations.filter(id => id !== specId),
      });
    } else {
      setFormDetails({
        ...formDetails,
        specializations: [...formDetails.specializations, specId],
      });
    }
    
    // Close dropdown after selection
    setIsDropdownOpen(false);
  };

  const removeSpecialization = (specId) => {
    setFormDetails({
      ...formDetails,
      specializations: formDetails.specializations.filter(id => id !== specId),
    });
  };

  const getSelectedSpecNames = () => {
    return formDetails.specializations
      .map((id) => {
        const spec = availableSpecifications.find((s) => s.id === id);
        return spec ? spec.name : "";
      })
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await toast.promise(
        axios.post(
          "/doctor/applyfordoctor",
          { formDetails },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          loading: "Submitting your application...",
          success: "Application submitted successfully",
          error: "Failed to submit application. Please try again.",
        }
      );

      navigate("/");
    } catch (error) {
      console.error("Application submission error:", error);
    }
  };

  const handleDropdownToggle = () => {
    console.log("🔄 Toggling dropdown. Current state:", isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (loading) {
    return <Loading />;
  }

  const selectedSpecNames = getSelectedSpecNames();
  console.log("🔍 Current state:", {
    availableSpecifications,
    selectedSpecifications: formDetails.specializations,
    selectedSpecNames,
    isDropdownOpen
  });

  return (
    <>
      <Navbar />
      <section className="register-section flex-center apply-doctor" id="contact">
        <div className="register-container flex-center contact">
          <h2 className="form-heading">Đăng ký để trở thành bác sĩ của chúng tôi</h2>
          
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Specializations Field */}
            <div className="form-group">
              <label htmlFor="specializations">Chuyên khoa y tế</label>

              {/* Selected Specializations Display */}
              <div className="selected-specializations">
                {selectedSpecNames.length > 0 ? (
                  selectedSpecNames.map((name, index) => {
                    const specId = formDetails.specializations[index];
                    return (
                      <span key={specId} className="specialization-tag">
                        {name}
                        <button
                          type="button"
                          className="remove-spec-btn"
                          onClick={() => removeSpecialization(specId)}
                          aria-label={`Remove ${name}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="placeholder-text">
                    Chưa có chuyên khoa được chọn
                  </span>
                )}
              </div>

              {/* Custom Dropdown */}
              <div className="custom-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="dropdown-button"
                  onClick={handleDropdownToggle}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  Thêm chuyên khoa
                  <span className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
                    ▼
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    {console.log("🎨 Rendering dropdown menu with:", availableSpecifications)}
                    {availableSpecifications.length === 0 ? (
                      <div className="dropdown-item" style={{ color: "#999", cursor: "default" }}>
                        Đang tải chuyên khoa...
                      </div>
                    ) : (
                      availableSpecifications.map((spec) => {
                        const isSelected = formDetails.specializations.includes(spec.id);
                        console.log(`🎯 Rendering spec: ${spec.name} (ID: ${spec.id}, Selected: ${isSelected})`);
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            className={`dropdown-item ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleSpecialization(spec.id)}
                            disabled={isSelected}
                          >
                            {spec.name}
                            {isSelected && <span className="checkmark">✓</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Experience Field */}
            <div className="form-group">
              <label htmlFor="experience">Số năm kinh nghiệm</label>
              <input
                type="number"
                id="experience"
                name="experience"
                className="form-input"
                placeholder="Years of professional experience"
                min="0"
                value={formDetails.experience}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Fees Field */}
            <div className="form-group">
              <label htmlFor="fees">Phí (VNĐ)</label>
              <input
                type="number"
                id="fees"
                name="fees"
                className="form-input"
                placeholder="Your consultation fee in USD"
                min="0"
                step="0.01"
                value={formDetails.fees}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn form-btn">
              Đăng ký
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ApplyDoctor;