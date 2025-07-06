/**
 * Appointments Page Component
 *
 * This component displays a user's appointments with pagination,
 * allowing them to view and manage their medical appointments.
 * Doctors can mark appointments as completed or rejected.
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import jwt_decode from "jwt-decode";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";

// Redux and API
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/user.css";

const Appointments = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const ITEMS_PER_PAGE = 5;

  // Redux
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  // Get user information from JWT token
  const token = localStorage.getItem("token");
  const decodedToken = jwt_decode(token);
  const { userId } = decodedToken;

  // Check if current user is a doctor
  const isDoctor = decodedToken.isDoctor || decodedToken.role === "Doctor";

  /**
   * Fetches all appointments for the current user
   */
  const fetchAppointments = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchData("/appointment/getallappointments");
      setAppointments(result);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Không thể tải danh sách cuộc hẹn. Vui lòng thử lại.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Load appointments when component mounts
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  /**
   * Handles page change in pagination
   * @param {number} page - Page number to navigate to
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Renders pagination buttons
   * @returns {Array} Array of pagination button elements
   */
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? "active" : ""}
          aria-label={`Trang ${i}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // Get appointments for current page
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /**
   * Marks an appointment as completed
   * @param {Object} appointment - The appointment to mark as completed
   */
  const completeAppointment = async (appointment) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn hoàn thành cuộc hẹn này?");
      if (!confirm) return;

      dispatch(setLoading(true));
      await axios.put(
        "/appointment/completed",
        {
          appointid: appointment.id || appointment._id,
          doctorId: appointment.doctorId || appointment.doctor?.id,
          doctorname: appointment.doctor
            ? `${appointment.doctor.firstname} ${appointment.doctor.lastname}`
            : `${appointment.patient?.firstname || "Bác sĩ"} ${appointment.patient?.lastname || ""
            }`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Cuộc hẹn đã được hoàn thành thành công.");
      fetchAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Không thể hoàn thành cuộc hẹn. Vui lòng thử lại.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Confirms an appointment (Doctor only)
   * @param {Object} appointment - The appointment to confirm
   */
  const confirmAppointment = async (appointment) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xác nhận cuộc hẹn này?");
      if (!confirm) return;

      dispatch(setLoading(true));
      await axios.put(
        "/appointment/confirmappointment",
        {
          appointid: appointment.id || appointment._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Cuộc hẹn đã được xác nhận thành công.");
      fetchAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Không thể xác nhận cuộc hẹn. Vui lòng thử lại.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Marks an appointment as rejected
   * @param {Object} appointment - The appointment to reject
   */
  const rejectAppointment = async (appointment) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn từ chối cuộc hẹn này?");
      if (!confirm) return;

      dispatch(setLoading(true));
      await axios.put(
        "/appointment/rejected",
        {
          appointid: appointment.id || appointment._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Cuộc hẹn đã được từ chối thành công.");
      fetchAppointments();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      if (error.response) {
        toast.error(error.response.data || "Không thể từ chối cuộc hẹn. Vui lòng thử lại.");
      } else {
        toast.error("Không thể từ chối cuộc hẹn. Vui lòng thử lại.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Renders action buttons based on appointment status and user type
   * @param {Object} appointment - The appointment object
   * @returns {JSX.Element} - Action buttons
   */
  const renderActionButtons = (appointment) => {
    const isCompleted = appointment.status === "Completed";
    const isRejected = appointment.status === "Rejected";
    const isWaitingForConfirmation = appointment.status === "Waiting_for_confirmation";

    // For patients, only show reject button
    if (!isDoctor) {
      const canReject = !isCompleted && !isRejected;

      return (
        <div className="appointment-actions">
          <button
            className={`btn user-btn ${isRejected
                ? "rejected-btn"
                : isCompleted
                  ? "disabled-btn"
                  : "reject-btn"
              }`}
            onClick={() => canReject && rejectAppointment(appointment)}
            disabled={!canReject}
            style={{
              backgroundColor: isRejected
                ? "#dc3545"
                : isCompleted
                  ? "#6c757d"
                  : "#dc3545",
              cursor: canReject ? "pointer" : "not-allowed",
              opacity: canReject ? 1 : 0.6,
            }}
            aria-label={
              isRejected
                ? "Cuộc hẹn đã từ chối"
                : isCompleted
                  ? "Không thể từ chối cuộc hẹn đã hoàn thành"
                  : "Từ chối cuộc hẹn"
            }
          >
            {isRejected ? "Đã từ chối" : "Từ chối"}
          </button>
        </div>
      );
    }

    // For doctors, show all action buttons
    return (
      <div className="appointment-actions">
        {/* Show confirm button only for doctors when status is waiting for confirmation */}
        {isWaitingForConfirmation && (
          <button
            className="btn user-btn confirm-btn"
            onClick={() => confirmAppointment(appointment)}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              marginRight: "0.5rem",
            }}
            aria-label="Xác nhận cuộc hẹn"
          >
            Xác nhận
          </button>
        )}

        <button
          className={`btn user-btn ${isCompleted
              ? "completed-btn"
              : isRejected
                ? "disabled-btn"
                : "accept-btn"
            }`}
          onClick={() => !isCompleted && !isRejected && !isWaitingForConfirmation && completeAppointment(appointment)}
          disabled={isCompleted || isRejected || isWaitingForConfirmation}
          style={{
            backgroundColor: isCompleted
              ? "#28a745"
              : isRejected
                ? "#6c757d"
                : "",
            cursor: isCompleted || isRejected || isWaitingForConfirmation ? "not-allowed" : "pointer",
            opacity: isRejected || isWaitingForConfirmation ? 0.6 : 1,
          }}
          aria-label={
            isCompleted
              ? "Cuộc hẹn đã hoàn thành"
              : isRejected
                ? "Cuộc hẹn đã từ chối"
                : isWaitingForConfirmation
                  ? "Cần xác nhận trước khi hoàn thành"
                  : "Đánh dấu cuộc hẹn là hoàn thành"
          }
        >
          {isCompleted ? "Đã hoàn thành" : isRejected ? "Hoàn thành" : "Hoàn thành"}
        </button>

        <button
          className={`btn user-btn ${isRejected
              ? "rejected-btn"
              : isCompleted
                ? "disabled-btn"
                : "reject-btn"
            }`}
          onClick={() => !isCompleted && !isRejected && rejectAppointment(appointment)}
          disabled={isCompleted || isRejected}
          style={{
            backgroundColor: isRejected
              ? "#dc3545"
              : isCompleted
                ? "#6c757d"
                : "#dc3545",
            cursor: isCompleted || isRejected ? "not-allowed" : "pointer",
            opacity: isCompleted ? 0.6 : 1,
            marginLeft: "0.5rem",
          }}
          aria-label={
            isRejected
              ? "Cuộc hẹn đã từ chối"
              : isCompleted
                ? "Không thể từ chối cuộc hẹn đã hoàn thành"
                : "Từ chối cuộc hẹn"
          }
        >
          {isRejected ? "Đã từ chối" : isCompleted ? "Từ chối" : "Từ chối"}
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="container appointment-page">
        {loading ? (
          <Loading />
        ) : (
          <section className="container notif-section">
            <h2 className="page-heading">Cuộc hẹn của bạn</h2>

            {appointments.length > 0 ? (
              <div className="appointments">
                <div className="table-responsive">
                  <table className="appointment-table">
                    <thead>
                      <tr>
                        <th scope="col">STT</th>
                        <th scope="col">Bác sĩ</th>
                        <th scope="col">Tên bệnh nhân</th>
                        <th scope="col">Tuổi</th>
                        <th scope="col">Giới tính</th>
                        <th scope="col">Số điện thoại</th>
                        <th scope="col">Nhóm máu</th>
                        <th scope="col">Tiền sử bệnh lý</th>
                        <th scope="col">Ngày</th>
                        <th scope="col">Trạng thái</th>
                        <th scope="col">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAppointments.map((appointment, index) => (
                        <tr key={appointment.id || appointment._id}>
                          <td>
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="doctor-name">
                            {appointment.doctor
                              ? `${appointment.doctor.firstname} ${appointment.doctor.lastname}`
                              : "N/A"}
                          </td>
                          <td>
                            {appointment.patient
                              ? `${appointment.patient.firstname} ${appointment.patient.lastname}`
                              : `${appointment.userId?.firstname || "N/A"} ${appointment.userId?.lastname || ""
                              }`}
                          </td>
                          <td>{appointment.age}</td>
                          <td>{appointment.gender}</td>
                          <td>{appointment.number}</td>
                          <td>{appointment.bloodGroup || "N/A"}</td>
                          <td className="family-diseases">
                            {appointment.familyDiseases || "Không có"}
                          </td>
                          <td>
                            {new Date(appointment.date).toLocaleDateString()}
                          </td>
                          <td
                            className={`status ${appointment.status.toLowerCase()}`}
                          >
                            {appointment.status === "Completed"
                              ? "Đã hoàn thành"
                              : appointment.status === "Rejected"
                                ? "Đã từ chối"
                                : appointment.status === "Pending"
                                  ? "Đang chờ"
                                  : appointment.status === "Waiting_for_confirmation"
                                    ? "Chờ xác nhận"
                                    : appointment.status}
                          </td>
                          <td>
                            {renderActionButtons(appointment)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div
                    className="pagination"
                    role="navigation"
                    aria-label="Điều hướng phân trang"
                  >
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Trang trước"
                    >
                      &laquo; Trước
                    </button>

                    {renderPagination()}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Trang sau"
                    >
                      Sau &raquo;
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Empty message="Không tìm thấy cuộc hẹn nào. Hãy đặt lịch hẹn với bác sĩ." />
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Appointments;