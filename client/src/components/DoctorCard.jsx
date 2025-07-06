import "../styles/doctorcard.css";
import React, { useState } from "react";
import BookAppointment from "./BookAppointment"; // Simplified import path
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/**
 * DoctorCard - Displays doctor information and handles appointment booking
 *
 * @param {Object} ele - Doctor data object containing user details and professional information
 * @returns {JSX.Element} - Rendered doctor card component
 */
const DoctorCard = ({ ele }) => {
  // Controls visibility of appointment booking modal
  const [modalOpen, setModalOpen] = useState(false);

  // Get authentication token from localStorage
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  /**
   * Handles opening the appointment booking modal
   * Validates user authentication before allowing appointment booking
   */
  const handleModal = () => {
    if (!token) {
      toast.error("You must log in first");
      return;
    }
    setModalOpen(true);
  };

  /**
   * Navigates to the doctor's detailed profile page
   */
  const handleViewProfile = () => {
    const doctorId = ele?.user?.id || ele?.userId || ele?.id;
    navigate(`/doctor/${doctorId}`);
  };

  // Extract user details for cleaner rendering
  const { user, specialization, experience, fees } = ele || {};
  const { firstname, lastname, mobile, pic } = user || {};

  // Default profile image if doctor's picture is not available
  const defaultProfileImg =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  /**
 * Formats currency in Vietnamese Dong style (1.000.000 VNĐ)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0 VNĐ";

    return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
  };

  return (
    <div className="card">
      <div className="card-img flex-center" onClick={handleViewProfile} style={{ cursor: 'pointer' }}>
        <img
          src={pic || defaultProfileImg}
          alt={`Dr. ${firstname} ${lastname}'s profile`}
        />
      </div>

      <h3 className="card-name">
        Bác sĩ {firstname && lastname ? `${firstname} ${lastname}` : "Unknown"}
      </h3>

      <p className="specialization">
        <strong>Chuyên khoa: </strong>
        {specialization || "Không xác định"}
      </p>

      <p className="experience">
        <strong>Số năm kinh nghiệm: </strong>
        {experience || 0} năm
      </p>

      <p className="fees">
        <strong>Phí: </strong> {formatCurrency(fees || 0)}
      </p>

      <p className="phone">
        <strong>Số điện thoại: </strong>
        {mobile || "Not available"}
      </p>

      <button
        className="btn view-profile-btn"
        onClick={handleViewProfile}
        aria-label="View Profile"
      >
        Xem thông tin
      </button>

      <button
        className="btn appointment-btn"
        onClick={handleModal}
        aria-label="Book Appointment"
      >
        Đặt cuộc hẹn
      </button>

      {/* Conditionally render appointment booking modal */}
      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

export default DoctorCard;
