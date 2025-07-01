import React, { useState, useEffect, useRef } from "react";
import "../styles/bookappointment.css";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { FaClock } from "react-icons/fa";

/**
 * BookAppointment - Modal component for booking doctor appointments
 * Allows patients to select appointment date/time and provide medical information
 * 
 * @param {Function} setModalOpen - Function to control modal visibility
 * @param {Object} ele - Doctor information object
 */
const BookAppointment = ({ setModalOpen, ele }) => {
  // Form state for appointment details
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    age: "",
    email: "",
    bloodGroup: "",
    gender: "",
    number: "",
    familyDiseases: "",
  });

  // Time dropdown state
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef(null);

  // Generate time slots (30-minute intervals from 8:00 to 18:00)
  const timeSlots = [
    "08:00 - 08:30",
    "08:30 - 09:00",
    "09:00 - 09:30",
    "09:30 - 10:00",
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
    "12:00 - 12:30",
    "12:30 - 13:00",
    "13:00 - 13:30",
    "13:30 - 14:00",
    "14:00 - 14:30",
    "14:30 - 15:00",
    "15:00 - 15:30",
    "15:30 - 16:00",
    "16:00 - 16:30",
    "16:30 - 17:00",
    "17:00 - 17:30",
    "17:30 - 18:00",
  ];

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handles clicking outside the modal to close it
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false);
    }
  };

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
   * Handles time slot selection
   * @param {string} timeSlot - Selected time slot
   */
  const handleTimeSelect = (timeSlot) => {
    setFormDetails({
      ...formDetails,
      time: timeSlot,
    });
    setIsTimeDropdownOpen(false);
  };

  /**
   * Parses time range string and returns start and end times
   * @param {string} timeRange - Time range in format "HH:MM - HH:MM"
   * @returns {Object} Object with startTime and endTime
   */
  const parseTimeRange = (timeRange) => {
    const [startTime, endTime] = timeRange.split(' - ');
    return { startTime, endTime };
  };

  /**
   * Validates form fields before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const { date, time, age, email, gender, number } = formDetails;
    
    if (!date) {
      toast.error("Please select an appointment date");
      return false;
    }
    
    if (!time) {
      toast.error("Please select an appointment time");
      return false;
    }
    
    if (!age) {
      toast.error("Please enter your age");
      return false;
    }

    // Validate email if provided (optional field)
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }
    
    if (!number) {
      toast.error("Please enter your mobile number");
      return false;
    } else if (number.length < 10) {
      toast.error("Please enter a valid mobile number");
      return false;
    }
    
    return true;
  };

  /**
   * Submits the appointment booking request to the server
   * @param {Object} e - Event object
   */
  const bookAppointment = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) return;
    
    // Parse the time range to get start and end times
    const { startTime, endTime } = parseTimeRange(formDetails.time);
    
    try {
      await toast.promise(
        axios.post(
          "/appointment/bookappointment",
          {
            doctorId: ele?.user?.id || ele?.userId,
            date: formDetails.date,
            startTime: startTime,
            endTime: endTime,
            age: formDetails.age,
            email: formDetails.email || null,
            bloodGroup: formDetails.bloodGroup,
            gender: formDetails.gender,
            number: formDetails.number,
            familyDiseases: formDetails.familyDiseases,
            doctorname: `${ele?.user?.firstname || ele?.userId?.firstname} ${ele?.user?.lastname || ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Đặt cuộc hẹn thành công",
          pending: "Đang đặt cuộc hẹn...",
          error: "Không thể đặt cuộc hẹn",
          loading: "Đang đặt cuộc hẹn...",
        }
      );
      
      // Close modal after successful booking
      setModalOpen(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  /**
   * Renders the appointment booking form
   * @returns {JSX.Element} Appointment booking form
   */
  const renderBookingForm = () => (
    <form className="register-form" onSubmit={bookAppointment}>
      <input
        type="date"
        name="date"
        className="form-input"
        value={formDetails.date}
        onChange={inputChange}
        min={new Date().toISOString().split('T')[0]} // Prevent past dates
        required
      />
      
      {/* Custom Time Dropdown */}
      <div className="time-dropdown-container" ref={timeDropdownRef}>
        <div
          className="time-dropdown-button form-input"
          onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
        >
          <span className={formDetails.time ? "selected-time" : "placeholder-time"}>
            {formDetails.time || "Select appointment time"}
          </span>
          <FaClock className={`time-icon ${isTimeDropdownOpen ? "open" : ""}`} />
        </div>
        
        {isTimeDropdownOpen && (
          <div className="time-dropdown-menu">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`time-dropdown-item ${formDetails.time === slot ? "selected" : ""}`}
                onClick={() => handleTimeSelect(slot)}
              >
                {slot}
                {formDetails.time === slot && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <input
        type="number"
        name="age"
        placeholder="Age"
        className="form-input"
        value={formDetails.age}
        onChange={inputChange}
        min="1"
        max="120"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email (Optional)"
        className="form-input"
        value={formDetails.email}
        onChange={inputChange}
      />
      
      <input
        type="text"
        name="bloodGroup"
        placeholder="Blood Group (Optional)"
        className="form-input"
        value={formDetails.bloodGroup}
        onChange={inputChange}
      />
      
      <select
        name="gender"
        className="form-input"
        value={formDetails.gender}
        onChange={inputChange}
        required
      >
        <option value="">Chọn giới tính</option>
        <option value="male">Nam</option>
        <option value="female">Nữ</option>
        <option value="other">Khác</option>
      </select>
      
      <input
        type="number"
        name="number"
        placeholder="Số điện thoại"
        className="form-input"
        value={formDetails.number}
        onChange={inputChange}
        required
      />
      
      <textarea
        name="familyDiseases"
        placeholder="Tiền sử bệnh gia đình (Tùy chọn)"
        className="form-input"
        value={formDetails.familyDiseases}
        onChange={inputChange}
        rows="3"
      ></textarea>

      <button
        type="submit"
        className="btn form-btn"
      >
        Đặt cuộc hẹn
      </button>
    </form>
  );

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal__content">
        <h2 className="page-heading">Đặt cuộc hẹn</h2>
        <IoMdClose
          onClick={() => setModalOpen(false)}
          className="close-btn"
          aria-label="Close modal"
        />
        <div className="register-container flex-center book">
          {renderBookingForm()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;