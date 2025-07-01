import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Loading from "./Loading";
import BookAppointment from "./BookAppointment";

// Redux
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";
import "../styles/signaturedoctors.css";

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * SignatureDoctorCard - Displays individual signature doctor information
 */
const SignatureDoctorCard = ({ ele, rank }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token") || "";
  const { user } = useSelector((state) => state.root);

  const handleModal = () => {
    if (!token) {
      toast.error("You must log in first");
      return;
    }

    if (!user || user.type !== "patient") {
      toast.error("Only patients can book appointments");
      return;
    }

    setModalOpen(true);
  };

  const {
    user: doctorUser,
    specializations,
    specialization, // Added this - from API response
    experience,
    fees,
    appointmentCount,
  } = ele || {};
  const { firstname, lastname, mobile, pic } = doctorUser || {};

  const defaultProfileImg =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  // Fix specialization names extraction
  const getSpecializationNames = () => {
    console.log("🔍 Specializations data:", specializations);
    console.log("🔍 Specialization (single) data:", specialization);

    // First check if there's a single specialization field (from API)
    if (specialization && typeof specialization === "string") {
      console.log("✅ Using single specialization field:", specialization);
      return specialization;
    }

    // Then check specializations array
    if (!specializations || !Array.isArray(specializations)) {
      return specialization || "Không xác định";
    }

    if (specializations.length === 0) {
      return specialization || "Không xác định";
    }

    // Handle different data structures for array
    const names = specializations
      .map((spec) => {
        if (spec && typeof spec === "object" && spec.name) {
          return spec.name;
        }
        if (typeof spec === "string") {
          return spec;
        }
        if (spec && typeof spec === "object") {
          return spec.specialization || spec.title || spec.type || "Unknown";
        }
        return "Unknown";
      })
      .filter((name) => name && name !== "Unknown");

    console.log("✅ Extracted names from array:", names);
    return names.length > 0
      ? names.join(", ")
      : specialization || "Không xác định";
  };

  const specializationNames = getSpecializationNames();

  // Get rank badge style
  const getRankBadge = () => {
    const badges = {
      1: { text: "🥇 #1 Most Booked", class: "rank-gold" },
      2: { text: "🥈 #2 Most Booked", class: "rank-silver" },
      3: { text: "🥉 #3 Most Booked", class: "rank-bronze" },
    };
    return (
      badges[rank] || { text: `#${rank} Most Booked`, class: "rank-default" }
    );
  };

  const rankBadge = getRankBadge();

  // Check if user is a patient and logged in
  const canBookAppointment = token && user && user.type === "patient";

  return (
    <div className="card signature-doctor-card">
      <div className={`rank-badge ${rankBadge.class}`}>{rankBadge.text}</div>

      <div className="card-img flex-center">
        <img
          src={pic || defaultProfileImg}
          alt={`Dr. ${firstname} ${lastname}'s profile`}
        />
      </div>

      <h3 className="card-name">
        Dr. {firstname && lastname ? `${firstname} ${lastname}` : "Unknown"}
      </h3>

      <p className="specialization">
        <strong>Specializations: </strong>
        {specializationNames}
      </p>

      <p className="experience">
        <strong>Experience: </strong>
        {experience || 0}yrs
      </p>

      <p className="fees">
        <strong>Fees per consultation: </strong>$ {fees || 0}
      </p>

      <p className="appointment-count">
        <strong>Total Appointments: </strong>
        {appointmentCount || 0}
      </p>

      <p className="phone">
        <strong>Phone: </strong>
        {mobile || "Not available"}
      </p>

      {canBookAppointment && (
        <button
          className="btn appointment-btn"
          onClick={handleModal}
          aria-label="Book Appointment"
        >
          Book Appointment
        </button>
      )}

      {!canBookAppointment && token && user && user.type !== "patient" && (
        <div className="appointment-info">
          <p
            style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}
          >
            Only patients can book appointments
          </p>
        </div>
      )}

      {!token && (
        <div className="appointment-info">
          <p
            style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}
          >
            <Link
              to="/login"
              style={{ color: "#007bff", textDecoration: "underline" }}
            >
              Login
            </Link>{" "}
            to book appointments
          </p>
        </div>
      )}

      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

/**
 * SignatureDoctors - Component that displays top doctors with most appointments
 */
const SignatureDoctors = () => {
  const [topDoctors, setTopDoctors] = useState([]);
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.root);

  /**
   * Fetches top doctors with most appointments
   */
  const fetchTopDoctors = async () => {
    try {
      dispatch(setLoading(true));

      const response = await fetchData("/doctor/top-doctors?limit=3");
      console.log("🔍 Top doctors API response:", response);

      if (response && response.success && response.data) {
        console.log(
          "✅ Setting top doctors from response.data:",
          response.data
        );
        setTopDoctors(response.data);
      } else if (Array.isArray(response)) {
        console.log("✅ Setting top doctors from array response:", response);
        setTopDoctors(response);
      } else {
        console.log("❌ No valid data in response");
        setTopDoctors([]);
      }
    } catch (error) {
      console.error("❌ Error fetching top doctors:", error);
      toast.error("Failed to load signature doctors");
      setTopDoctors([]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchTopDoctors();
  }, []);

  if (loading) {
    return (
      <section className="signature-doctors-section">
        <div className="container">
          <Loading />
        </div>
      </section>
    );
  }

  // Inline styles to ensure visibility
  const sectionStyle = {
    padding: "4rem 0",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    margin: "2rem 0",
    minHeight: "200px",
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "3rem",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    color: "#2c3e50",
    marginBottom: "1rem",
    fontWeight: "700",
  };

  const subtitleStyle = {
    fontSize: "1.2rem",
    color: "#7f8c8d",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  };

  const doctorsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "2rem",
    marginBottom: "3rem",
  };

  const cardStyle = {
    position: "relative",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    maxWidth: "350px",
    width: "100%",
    minHeight: "500px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const getRankBadgeStyle = (rank) => {
    const baseStyle = {
      position: "absolute",
      top: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "0.5rem 1rem",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "0.9rem",
      color: "white",
      zIndex: "2",
      whiteSpace: "nowrap",
    };

    switch (rank) {
      case 1:
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #ffd700, #ffed4e)",
          color: "#b8860b",
        };
      case 2:
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #c0c0c0, #e8e8e8)",
          color: "#696969",
        };
      case 3:
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #cd7f32, #daa520)",
          color: "#8b4513",
        };
      default:
        return {
          ...baseStyle,
          background: "linear-gradient(135deg, #6c757d, #adb5bd)",
        };
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Bác sĩ nổi bật</h2>
          <p style={subtitleStyle}>
            Gặp gỡ các bác sĩ uy tín và giàu kinh nghiệm nhất với sự hài lòng cao nhất từ bệnh nhân
          </p>
        </div>

        {topDoctors && topDoctors.length > 0 ? (
          <>
            <div style={doctorsContainerStyle}>
              {topDoctors.map((doctor, index) => {
                const rank = index + 1;
                const {
                  user: doctorUser,
                  specializations,
                  specialization,
                  formattedSpecializations,
                  experience,
                  fees,
                  appointmentCount,
                } = doctor || {};
                const { firstname, lastname, mobile, pic } = doctorUser || {};

                const defaultProfileImg =
                  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

                // Simplified specialization handling for inline rendering
                const getSpecializationNames = () => {
                  if (formattedSpecializations) {
                    return formattedSpecializations;
                  }

                  if (specialization && typeof specialization === "string") {
                    return specialization;
                  }

                  if (
                    specializations &&
                    Array.isArray(specializations) &&
                    specializations.length > 0
                  ) {
                    const names = specializations
                      .map((spec) =>
                        spec && typeof spec === "object" && spec.name
                          ? spec.name
                          : null
                      )
                      .filter(Boolean);
                    return names.length > 0
                      ? names.join(", ")
                      : "Chưa xác định";
                  }

                  return "Chưa xác định";
                };

                const specializationNames = getSpecializationNames();

                const badges = {
                  1: "🥇 #1 Được đặt nhiều nhất",
                  2: "🥈 #2 Được đặt nhiều nhất",
                  3: "🥉 #3 Được đặt nhiều nhất",
                };

                const token = localStorage.getItem("token") || "";
                const canBookAppointment =
                  token && user && user.type === "patient";

                return (
                  <div
                    key={doctor.id || doctor.userId || index}
                    style={cardStyle}
                  >
                    <div style={getRankBadgeStyle(rank)}>
                      {badges[rank] || `#${rank} Được đặt nhiều nhất`}
                    </div>

                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "2rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <img
                        src={pic || defaultProfileImg}
                        alt={`Hồ sơ của Bác sĩ ${firstname} ${lastname}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          border: "4px solid #fff",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <h3
                      style={{
                        fontSize: "1.4rem",
                        color: "#2c3e50",
                        margin: "1rem 0 0.5rem 0",
                        textAlign: "center",
                      }}
                    >
                      Bác sĩ{" "}
                      {firstname && lastname
                        ? `${firstname} ${lastname}`
                        : "Chưa xác định"}
                    </h3>

                    <p
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "0.9rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Chuyên khoa: </strong>
                      {specializationNames}
                    </p>

                    <p
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "0.9rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Kinh nghiệm: </strong>
                      {experience || 0} năm
                    </p>

                    <p
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "0.9rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Phí tư vấn: </strong>$ {fees || 0}
                    </p>

                    <p
                      style={{
                        background: "#e8f5e8",
                        color: "#2e7d32",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        margin: "0.5rem 0",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      <strong>Tổng số lượt đặt: </strong>
                      {appointmentCount || 0}
                    </p>

                    <p
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "0.9rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Điện thoại: </strong>
                      {mobile || "Không có sẵn"}
                    </p>

                    {/* Show book appointment button only for patients */}
                    {canBookAppointment && (
                      <button
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          padding: "1rem 2rem",
                          marginTop: "auto",
                          fontWeight: "600",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (!token) {
                            toast.error("Bạn phải đăng nhập trước");
                            return;
                          }
                          if (!user || user.type !== "patient") {
                            toast.error("Chỉ bệnh nhân mới có thể đặt lịch khám");
                            return;
                          }
                          // Handle modal opening logic here
                        }}
                        aria-label="Đặt lịch khám"
                      >
                        Đặt lịch khám
                      </button>
                    )}

                    {/* Show message for non-patients who are logged in */}
                    {token && user && user.type !== "patient" && (
                      <div
                        style={{
                          marginTop: "auto",
                          padding: "1rem",
                          textAlign: "center",
                          color: "#666",
                          fontStyle: "italic",
                          background: "#f8f9fa",
                          borderRadius: "5px",
                        }}
                      >
                        Chỉ bệnh nhân mới có thể đặt lịch khám
                      </div>
                    )}

                    {/* Show login message for non-logged in users */}
                    {!token && (
                      <div
                        style={{
                          marginTop: "auto",
                          padding: "1rem",
                          textAlign: "center",
                          background: "#f8f9fa",
                          borderRadius: "5px",
                        }}
                      >
                        <Link
                          to="/login"
                          style={{
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          Đăng nhập
                        </Link>{" "}
                        để đặt lịch khám
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <Link
                to="/doctors"
                style={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  color: "white",
                  padding: "1rem 2rem",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 5px 15px rgba(79, 172, 254, 0.3)",
                }}
              >
                Xem tất cả bác sĩ
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Hiện không có bác sĩ nổi bật nào.</p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Điều này có thể do chưa có lịch hẹn nào được đặt.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SignatureDoctors;
