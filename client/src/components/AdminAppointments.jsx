import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

// Set base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * AdminAppointments - Component for admin to view and manage all appointments
 * Shows appointments in a table with options to mark them as completed
 */
const AdminAppointments = () => {
  // State for storing all appointments
  const [appointments, setAppointments] = useState([]);
  
  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all appointments from the API
   * Updates the appointments state with the response
   */
  const fetchAllAppointments = async () => {
    try {
      dispatch(setLoading(true));
      const appointmentsData = await fetchData("/appointment/getallappointments");
      console.log("📊 Appointments data:", appointmentsData); // Debug log
      setAppointments(appointmentsData);
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error("Error fetching appointments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAllAppointments();
  }, []);

  /**
   * Marks an appointment as completed
   * @param {Object} appointment - The appointment to mark as completed
   */
  const markAppointmentComplete = async (appointment) => {
    try {
      // Show toast notification with promise for better UX
      await toast.promise(
        axios.put(
          "/appointment/completed",
          {
            appointid: appointment?.id, // Use 'id' instead of '_id'
            doctorId: appointment?.doctorId || appointment?.doctor?.id,
            doctorname: `${appointment?.doctor?.firstname || "Doctor"} ${appointment?.doctor?.lastname || ""}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment marked as completed",
          error: "Unable to update appointment status",
          loading: "Updating appointment status...",
        }
      );

      // Refresh appointment list after updating
      fetchAllAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  /**
   * Renders a table row for each appointment
   * @param {Object} appointment - The appointment data
   * @param {number} index - The index of the appointment in the array
   * @returns {JSX.Element} - The table row for the appointment
   */
  const renderAppointmentRow = (appointment, index) => {
    console.log("🔍 Rendering appointment:", appointment); // Debug log
    
    const isCompleted = appointment?.status === "Completed";
    const isRejected = appointment?.status === "Rejected";
    const isDisabled = isCompleted || isRejected;
    
    return (
      <tr key={appointment?.id}>
        <td>{index + 1}</td>
        <td>
          {appointment?.doctor 
            ? `${appointment.doctor.firstname} ${appointment.doctor.lastname}`
            : "N/A"
          }
        </td>
        <td>
          {appointment?.patient 
            ? `${appointment.patient.firstname} ${appointment.patient.lastname}`
            : "N/A"
          }
        </td>
        <td>{appointment?.age || "N/A"}</td>
        <td>{appointment?.gender || "N/A"}</td>
        <td>{appointment?.number || "N/A"}</td>
        <td>{appointment?.bloodGroup || "N/A"}</td>
        <td>{appointment?.familyDiseases || "None"}</td>
        <td>{appointment?.date || "N/A"}</td>
        <td>
          {appointment?.time || 
           (appointment?.startTime && appointment?.endTime 
             ? `${appointment.startTime} - ${appointment.endTime}` 
             : "N/A")
          }
        </td>
        <td>{appointment?.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : "N/A"}</td>
        <td>{appointment?.updatedAt ? new Date(appointment.updatedAt).toLocaleTimeString() : "N/A"}</td>
        <td>
          <span className={`status ${appointment?.status?.toLowerCase() || 'pending'}`}>
            {appointment?.status || "Đang chờ xử lý"}
          </span>
        </td>
        <td>
          <button
            className={`btn user-btn ${isCompleted ? "completed-btn" : isRejected ? "rejected-btn" : "accept-btn"}`}
            disabled={isDisabled}
            onClick={() => !isDisabled && markAppointmentComplete(appointment)}
            style={{
              backgroundColor: isDisabled ? "#6c757d" : "",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.7 : 1
            }}
          >
            {isCompleted ? "Đã hoàn thành" : isRejected ? "Đã từ chối" : "Hoàn thành"}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">Tất cả cuộc hẹn</h3>
          {appointments && appointments.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Bác sĩ</th>
                    <th>Tên bệnh nhân</th>
                    <th>Tuổi</th>
                    <th>Giới tính</th>
                    <th>Số điện thoại</th>
                    <th>Nhóm máu</th>
                    <th>Bệnh lý gia đình</th>
                    <th>Ngày hẹn</th>
                    <th>Giờ hẹn</th>
                    <th>Ngày đặt</th>
                    <th>Giờ đặt</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(renderAppointmentRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty message="No appointments found" />
          )}
        </section>
      )}
    </>
  );
};

export default AdminAppointments;