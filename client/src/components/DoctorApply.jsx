import React, { useState } from "react";
import toast from "react-hot-toast";
import "../styles/doctorapply.css";
import axios from "axios";

/**
 * Configure default axios base URL for API requests
 */
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * DoctorApply - Component for users to apply to become doctors
 * Collects professional information and submits application
 */
function DoctorApply() {
  // State for form fields
  const [formDetails, setFormDetails] = useState({
    specialization: "",
    experience: "",
    fees: "",
    timing: "Timing", // Default placeholder value
  });

  /**
   * Handles input changes for all form fields
   * @param {Object} e - Event object
   */
  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  /**
   * Validates form data before submission
   * @param {Object} formData - Form data to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = (formData) => {
    const { specialization, experience, fees, timing } = formData;
    
    if (!specialization.trim()) {
      toast.error("Specialization is required");
      return false;
    }
    
    if (!experience.trim()) {
      toast.error("Experience is required");
      return false;
    } else if (isNaN(experience) || Number(experience) < 0) {
      toast.error("Experience must be a positive number");
      return false;
    }
    
    if (!fees.trim()) {
      toast.error("Fees are required");
      return false;
    } else if (isNaN(fees) || Number(fees) <= 0) {
      toast.error("Fees must be a positive number");
      return false;
    }
    
    if (!timing || timing === "Timing") {
      toast.error("Please select your availability timing");
      return false;
    }
    
    return true;
  };

  /**
   * Submits doctor application form to the server
   * @param {Object} e - Event object
   */
  const formSubmit = async (e) => {
    try {
      e.preventDefault();
      
      // Validate form before submission
      if (!validateForm(formDetails)) return;
      
      const { specialization, experience, fees, timing } = formDetails;

      // Submit application with progress notification
      await toast.promise(
        axios.post(
          "/doctor/applyfordoctor",
          {
            specialization,
            experience,
            fees,
            timing,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          pending: "Submitting application...",
          success: "Thank you for submitting your application",
          error: "Unable to submit application",
        }
      );
      
      // Reset form after successful submission
      setFormDetails({
        specialization: "",
        experience: "",
        fees: "",
        timing: "Timing",
      });
      
    } catch (error) {
      console.error("Error submitting doctor application:", error);
    }
  };

  /**
   * Renders the doctor application form
   * @returns {JSX.Element} - Form UI
   */
  const renderApplicationForm = () => (
    <form onSubmit={formSubmit} className="register-form">
      <input
        type="text"
        name="specialization"
        className="form-input"
        placeholder="Enter your specialization"
        value={formDetails.specialization}
        onChange={inputChange}
      />
      
      <input
        type="number"
        name="experience"
        className="form-input"
        placeholder="Enter your experience in years"
        value={formDetails.experience}
        onChange={inputChange}
        min="0"
      />
      
      <input
        type="number"
        name="fees"
        className="form-input"
        placeholder="Enter your fees per consultation in rupees"
        value={formDetails.fees}
        onChange={inputChange}
        min="1"
      />
      
      <select
        name="timing"
        value={formDetails.timing}
        className="form-input"
        id="timing"
        onChange={inputChange}
      >
        <option disabled>Timing</option>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
        <option value="night">Night</option>
      </select>
      
      <button type="submit" className="btn form-btn">
        Apply
      </button>
    </form>
  );

  return (
    <section className="apply-doctor-section flex-center">
      <div className="apply-doctor-container flex-center">
        <h2 className="form-heading">Đăng ký bác sĩ</h2>
        {renderApplicationForm()}
      </div>
    </section>
  );
}

export default DoctorApply;