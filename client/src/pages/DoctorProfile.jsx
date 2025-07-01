import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import BookAppointment from "../components/BookAppointment";

// Redux
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/doctorprofile.css";

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * DoctorProfile - Detailed doctor profile page
 * Displays comprehensive information about a specific doctor
 */
const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.root);

  const [doctor, setDoctor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [doctorStats, setDoctorStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    rating: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    completionRate: 0,
    recentAppointments: [],
    monthlyAppointments: [],
  });

  const token = localStorage.getItem("token") || "";

  /**
   * Fetches detailed doctor information
   */
  const fetchDoctorDetails = async () => {
    try {
      dispatch(setLoading(true));

      // Fetch doctor details
      const doctorResponse = await fetchData(`/doctor/getdoctor/${doctorId}`);
      console.log("🔍 Doctor data response:", doctorResponse);

      if (doctorResponse && doctorResponse.success) {
        setDoctor(doctorResponse.data);
      } else if (doctorResponse) {
        // Handle case where response doesn't have success flag but has data
        setDoctor(doctorResponse);
      } else {
        throw new Error("No doctor data received");
      }

      // Fetch doctor statistics (appointments, ratings, etc.)
      try {
        const statsResponse = await fetchData(`/doctor/getstats/${doctorId}`);
        console.log("📊 Stats data response:", statsResponse);

        if (statsResponse && statsResponse.success && statsResponse.data) {
          setDoctorStats((prev) => ({
            ...prev,
            ...statsResponse.data,
          }));
        } else if (statsResponse) {
          // Handle case where response doesn't have success flag but has data
          setDoctorStats((prev) => ({
            ...prev,
            ...statsResponse,
          }));
        }
      } catch (statsError) {
        console.warn("Failed to load doctor statistics:", statsError);
        // Don't throw error, just use default stats
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      toast.error("Failed to load doctor information");
      navigate("/doctors");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  /**
   * Handles opening appointment booking modal
   */
  const handleBookAppointment = () => {
    setModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">
            <h2>Doctor not found</h2>
            <p>The doctor profile you're looking for doesn't exist.</p>
            <button className="btn" onClick={() => navigate("/doctors")}>
              Back to Doctors
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const {
    user: doctorUser,
    specializations,
    experience,
    fees,
    timing,
  } = doctor;
  const { firstname, lastname, email, mobile, pic, address, gender } =
    doctorUser || {};

  const defaultProfileImg =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  // Get specialization names with null checks
  const getSpecializationNames = () => {
    if (
      specializations &&
      Array.isArray(specializations) &&
      specializations.length > 0
    ) {
      return specializations.map((spec) => spec.name).join(", ");
    }
    return doctor.specialization || "Không xác định";
  };

  // Safe rating calculation with fallback
  const safeRating = doctorStats?.rating || 0;
  const safeTotalAppointments = doctorStats?.totalAppointments || 0;
  const safeCompletedAppointments = doctorStats?.completedAppointments || 0;

  return (
    <>
      <Navbar />
      <main className="doctor-profile-page">
        <div className="container">
          {/* Hero Section */}
          <section className="doctor-hero">
            <div className="doctor-hero-content">
              <div className="doctor-avatar">
                <img
                  src={pic || defaultProfileImg}
                  alt={`Dr. ${firstname} ${lastname}`}
                  className="doctor-profile-pic"
                />
                <div className="doctor-status online">
                  <span className="status-indicator"></span>
                  Sẵn sàng
                </div>
              </div>

              <div className="doctor-basic-info">
                <h1 className="doctor-name">
                  Dr. {firstname} {lastname}
                </h1>
                <p className="doctor-specialization">
                  {getSpecializationNames()}
                </p>
                <div className="doctor-rating">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${
                          i < Math.floor(safeRating) ? "filled" : ""
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text">
                    {safeRating.toFixed(1)} ({safeTotalAppointments} reviews)
                  </span>
                </div>

                <div className="doctor-quick-stats">
                  <div className="stat-item">
                    <span className="stat-number">{experience || 0}</span>
                    <span className="stat-label">Số năm kinh nghiệm</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{safeTotalAppointments}</span>
                    <span className="stat-label">Tổng số bệnh nhân</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {safeCompletedAppointments}
                    </span>
                    <span className="stat-label">Đã hoàn thành</span>
                  </div>
                </div>
              </div>

              <div className="doctor-actions">
                <button
                  className="btn btn-primary book-appointment-btn"
                  onClick={handleBookAppointment}
                >
                  Đặt lịch hẹn
                </button>
                <div className="consultation-fee">
                  <span className="fee-label">Phí tư vấn</span>
                  <span className="fee-amount">{fees || 0} VNĐ</span>
                </div>
              </div>
            </div>
          </section>

          {/* Doctor Details */}
          <section className="doctor-details">
            <div className="details-grid">
              {/* About Section */}
              <div className="detail-card about-card">
                <h3 className="card-title">
                  Về bác sĩ {firstname} {lastname}
                </h3>
                <div className="about-content">
                  <p className="doctor-description">
                    Bác sĩ {firstname} {lastname} là một chuyên gia{" "}
                    {getSpecializationNames().toLowerCase()}
                    với {experience || 0} năm kinh nghiệm thực hành. Cam kết
                    cung cấp dịch vụ chăm sóc bệnh nhân xuất sắc và luôn cập
                    nhật với những tiến bộ y học mới nhất.
                  </p>

                  <div className="professional-info">
                    {/* <div className="info-row">
                      <span className="info-label">Chuyên khoa:</span>
                      <span className="info-value">
                        {getSpecializationNames()}
                      </span>
                    </div> */}
                    <div className="info-row">
                      <span className="info-label">Kinh nghiệm:</span>
                      <span className="info-value">{experience || 0} năm</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Giới tính:</span>
                      <span className="info-value">
                        {gender || "Chưa xác định"}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Giờ làm việc:</span>
                      <span className="info-value">
                        Từ T2 - T7
                        {/* {timing || "Chưa xác định"} */}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations Card */}
              <div className="detail-card specializations-card">
                <h3 className="card-title">Chuyên khoa</h3>
                <div className="specializations-content">
                  {specializations &&
                  Array.isArray(specializations) &&
                  specializations.length > 0 ? (
                    <div className="specializations-list">
                      {specializations.map((spec, index) => (
                        <div
                          key={spec.id || index}
                          className="specialization-item"
                        >
                          <div className="spec-icon">🏥</div>
                          <div className="spec-details">
                            <h4 className="spec-name">{spec.name}</h4>
                            <p className="spec-description">
                              Chuyên gia trong lĩnh vực{" "}
                              {spec.name.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : doctor.specialization ? (
                    <div className="specializations-list">
                      <div className="specialization-item">
                        <div className="spec-icon">🏥</div>
                        <div className="spec-details">
                          <h4 className="spec-name">{doctor.specialization}</h4>
                          <p className="spec-description">
                            Chuyên gia trong lĩnh vực{" "}
                            {doctor.specialization.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-specializations">
                      <p>Chưa có thông tin chuyên khoa</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="detail-card contact-card">
                <h3 className="card-title">Thông tin liên hệ</h3>
                <div className="contact-content">
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    <div className="contact-details">
                      <span className="contact-label">Email</span>
                      <span className="contact-value">
                        {email || "Không có sẵn"}
                      </span>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon">📱</div>
                    <div className="contact-details">
                      <span className="contact-label">Điện thoại</span>
                      <span className="contact-value">
                        {mobile || "Không có sẵn"}
                      </span>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div className="contact-details">
                      <span className="contact-label">Địa chỉ</span>
                      <span className="contact-value">
                        {address || "Không có sẵn"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              {/* <div className="detail-card availability-card">
                <h3 className="card-title">Lịch làm việc</h3>
                <div className="availability-content">
                  <div className="time-slots">
                    <div className="time-slot available">
                      <span className="slot-time">9:00 AM - 12:00 PM</span>
                      <span className="slot-status">Có sẵn</span>
                    </div>
                    <div className="time-slot available">
                      <span className="slot-time">2:00 PM - 6:00 PM</span>
                      <span className="slot-status">Có sẵn</span>
                    </div>
                    <div className="time-slot unavailable">
                      <span className="slot-time">6:00 PM - 8:00 PM</span>
                      <span className="slot-status">Đã đặt</span>
                    </div>
                  </div>

                  <div className="availability-note">
                    <p>
                      * Thời gian hẹn có thể thay đổi. Vui lòng đặt lịch để xác
                      nhận.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Services */}
              <div className="detail-card services-card">
                <h3 className="card-title">Dịch vụ cung cấp</h3>
                <div className="services-content">
                  <div className="services-list">
                    <div className="service-item">
                      <span className="service-icon">🩺</span>
                      <span className="service-name">Tư vấn tổng quát</span>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">🔬</span>
                      <span className="service-name">Dịch vụ chẩn đoán</span>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">💊</span>
                      <span className="service-name">
                        Lập kế hoạch điều trị
                      </span>
                    </div>
                    <div className="service-item">
                      <span className="service-icon">📋</span>
                      <span className="service-name">Chăm sóc theo dõi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="detail-card stats-card">
                <h3 className="card-title">Thống kê</h3>
                <div className="stats-content">
                  <div className="stat-row">
                    <span className="stat-label">Tổng cuộc hẹn:</span>
                    <span className="stat-value">{safeTotalAppointments}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Đã hoàn thành:</span>
                    <span className="stat-value">
                      {safeCompletedAppointments}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Đang chờ:</span>
                    <span className="stat-value">
                      {doctorStats?.pendingAppointments || 0}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Tỷ lệ hoàn thành:</span>
                    <span className="stat-value">
                      {doctorStats?.completionRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="doctor-cta">
            <div className="cta-content">
              <h2>Sẵn sàng đặt lịch hẹn?</h2>
              <p>
                Nhận được sự chăm sóc bạn cần từ bác sĩ {firstname} {lastname}
              </p>
              <button
                className="btn btn-primary btn-large"
                onClick={handleBookAppointment}
              >
                Đặt lịch hẹn ngay
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Appointment Booking Modal */}
      {modalOpen && (
        <BookAppointment setModalOpen={setModalOpen} ele={doctor} />
      )}
    </>
  );
};

export default DoctorProfile;
