import React, { useState } from "react";
import "../styles/contact.css";

/**
 * Contact - Component for the website contact form
 * Allows users to send messages via Formspree integration
 */
const Contact = () => {
  // State for form fields
  const [formDetails, setFormDetails] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State for form validation
  const [errors, setErrors] = useState({});

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Validates form before submission
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name field
    if (!formDetails.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    } else if (formDetails.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }
    
    // Validate email field
    if (!formDetails.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^\S+@\S+\.\S+$/.test(formDetails.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate message field
    if (!formDetails.message.trim()) {
      newErrors.message = "Tin nhắn là bắt buộc";
    } else if (formDetails.message.trim().length < 10) {
      newErrors.message = "Tin nhắn phải có ít nhất 10 ký tự";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Let the form submit normally to Formspree
      // You can add additional logic here if needed
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormDetails({
          name: "",
          email: "",
          message: "",
        });
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 3000);
      
    } catch (error) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
    }
  };

  /**
   * Renders an input field with error message if applicable
   * @param {string} type - Input type (text, email, etc.)
   * @param {string} name - Field name
   * @param {string} placeholder - Placeholder text
   * @param {boolean} isTextarea - Whether this is a textarea or regular input
   * @returns {JSX.Element} - The rendered input field
   */
  const renderField = (type, name, placeholder, isTextarea = false) => {
    const commonProps = {
      name,
      className: `form-input ${errors[name] ? "error-input" : ""}`,
      placeholder,
      value: formDetails[name],
      onChange: inputChange,
      required: true,
      disabled: isSubmitting,
    };

    return (
      <div className="form-field">
        {isTextarea ? (
          <textarea
            {...commonProps}
            rows="6"
            cols="12"
          ></textarea>
        ) : (
          <input
            {...commonProps}
            type={type}
          />
        )}
        {errors[name] && <span className="error-message">{errors[name]}</span>}
      </div>
    );
  };

  if (submitSuccess) {
    return (
      <section className="contact-section" id="contact">
        <div className="contact-container">
          <div className="form-success">
            Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <h2 className="form-heading">Liên lạc với chúng tôi</h2>
        
        <form
          method="POST"
          action={`https://formspree.io/f/${process.env.REACT_APP_FORMSPREE_ID || process.env.REACT_FORMIK_SECRET}`}
          className="contact-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {renderField("text", "name", "Nhập tên của bạn")}
          {renderField("email", "email", "Nhập email của bạn")}
          {renderField("text", "message", "Nhập tin nhắn của bạn (tối thiểu 10 ký tự)", true)}

          <button 
            type="submit" 
            className="form-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
          </button>
        </form>

        {/* Optional: Add contact information */}
        <div className="contact-info">
          <div className="contact-info-item">
            <div className="contact-info-icon">📍</div>
            <div className="contact-info-content">
              <h4>Địa chỉ</h4>
              <p>123 Đường ABC, Quận XYZ, TP.HCM</p>
            </div>
          </div>
          
          <div className="contact-info-item">
            <div className="contact-info-icon">📞</div>
            <div className="contact-info-content">
              <h4>Điện thoại</h4>
              <p>+84 123 456 789</p>
            </div>
          </div>
          
          <div className="contact-info-item">
            <div className="contact-info-icon">✉️</div>
            <div className="contact-info-content">
              <h4>Email</h4>
              <p>contact@doctorapp.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;