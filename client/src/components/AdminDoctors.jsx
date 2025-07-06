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
 * AdminDoctors - Component for admin to view and manage all doctors
 * Provides functionality to search, filter, and delete doctors
 */
const AdminDoctors = () => {
  // State for storing doctor data and filter options
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all doctors from the API with optional filters
   * Updates the doctors state with the response
   */
  const fetchAllDoctors = async () => {
    try {
      dispatch(setLoading(true));

      // Build URL with filter and search parameters
      let url = "/doctor/getalldoctors";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }

      const doctorsData = await fetchData(url);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error("Failed to fetch doctors");
      console.error("Error fetching doctors:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Deletes a doctor after confirmation
   * @param {string} userId - The ID of the user/doctor to delete
   */
  const deleteDoctor = async (userId) => {
    try {
      const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?");
      if (!confirmed) return;

      // Show toast notification with promise for better UX
      await toast.promise(
        axios.put(
          "/doctor/deletedoctor",
          { userId },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Xóa bác sĩ thành công",
          error: "Không thể xóa bác sĩ",
          loading: "Đang xóa bác sĩ...",
        }
      );

      // Refresh doctors list after deletion
      fetchAllDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchAllDoctors();
  }, []);

  /**
   * Filters doctors based on selected filter and search term
   * This is used when client-side filtering is needed
   */
  const getFilteredDoctors = () => {
    return doctors.filter((doctor) => {
      if (filter === "all") {
        return true;
      } else if (filter === "specialization") {
        return doctor.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      } else if (filter === "firstname") {
        return (
          doctor.user &&
          doctor.user.firstname.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
  };

  const filteredDoctors = getFilteredDoctors();

  /**
 * Formats currency in Vietnamese Dong style (1.000.000 VNĐ)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0 VNĐ";

    return new Intl.NumberFormat('vi-VN').format(amount) + " VNĐ";
  };

  /**
   * Renders a table row for each doctor
   * @param {Object} doctor - The doctor data
   * @param {number} index - The index of the doctor in the array
   * @returns {JSX.Element} - The table row for the doctor
   */
  const renderDoctorRow = (doctor, index) => {
    // Create a unique key using doctor.id, doctor.userId, or fallback to index
    const uniqueKey = doctor?.id || doctor?.userId || `doctor-${index}`;

    return (
      <tr key={uniqueKey}>
        <td>{index + 1}</td>
        <td>
          <img
            className="user-table-pic"
            src={doctor?.user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
            alt={doctor?.user?.firstname || "Doctor"}
            onError={(e) => {
              e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
            }}
          />
        </td>
        <td>{doctor?.user?.firstname || "N/A"}</td>
        <td>{doctor?.user?.lastname || "N/A"}</td>
        <td>{doctor?.user?.email || "N/A"}</td>
        <td>{doctor?.user?.mobile || "N/A"}</td>
        <td>{doctor?.experience || "N/A"}</td>
        <td>{doctor?.specialization || "N/A"}</td>
        <td>{formatCurrency(doctor?.fees)}</td>
        <td className="select">
          <button
            className="btn user-btn"
            onClick={() => deleteDoctor(doctor?.user?.id || doctor?.userId)}
          >
            Xóa
          </button>
        </td>
      </tr>
    );
  };

  /**
   * Renders the filter and search controls
   * @returns {JSX.Element} - Filter and search UI
   */
  const renderFilterControls = () => (
    <div className="ayx">
      <div className="filter">
        <label htmlFor="filter">Lọc theo:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="firstname">Tên</option>
          <option value="specialization">Chuyên khoa</option>
        </select>
      </div>

      <div className="search">
        <label htmlFor="search">Tìm kiếm:</label>
        <input
          type="text"
          className="form-input"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          {renderFilterControls()}
          <h3 className="home-sub-heading">Tất cả bác sĩ</h3>
          {filteredDoctors.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Họ</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Kinh nghiệm</th>
                    <th>Chuyên khoa</th>
                    <th>Phí</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map(renderDoctorRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default AdminDoctors;