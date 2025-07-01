import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Users component for admin dashboard
 * Displays a list of all users with search and filter functionality
 * Allows administrators to delete users
 */
const Users = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Redux hooks
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all users from the API with optional filtering and search
   * Updates the users state with the retrieved data
   */
  const getAllUsers = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Build query URL with filter and search params if provided
      let url = "/user/getallusers";
      if (filter !== "all") {
        url += `?filter=${filter}`;
      }
      if (searchTerm.trim() !== "") {
        url += `${filter !== "all" ? "&" : "?"}search=${searchTerm}`;
      }

      const userData = await fetchData(url);
      setUsers(userData);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching users:", error);
      dispatch(setLoading(false));
    }
  }, [dispatch, filter, searchTerm]);

  /**
   * Deletes a user after confirmation
   * Shows toast notifications during the process
   * @param {string} userId - The ID of the user to delete
   */
  const deleteUser = async (userId) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa?");
      if (confirm) {
        // Debug: Log the userId being sent
        console.log("Deleting user with ID:", userId);

        await toast.promise(
          axios.post(
            "/user/deleteuser",
            { userId }, // Send userId in request body
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
          {
            pending: "Đang xóa...",
            success: "Xóa người dùng thành công",
            error: "Không thể xóa người dùng",
            loading: "Đang xóa người dùng...",
          }
        );
        // Refresh the user list after deletion
        getAllUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return error;
    }
  };

  // Fetch all users on component mount
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  /**
   * Filters users based on selected filter and search term
   * Currently supports filtering by first name
   */
  const filteredUsers = users.filter((user) => {
    if (filter === "all") {
      return true;
    } else if (filter === "firstname") {
      return user.firstname.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return true;
    }
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          {/* Filter and Search Controls */}
          <div className="filter-search-container">
            {/* Filter dropdown */}
            <div className="filter">
              <label htmlFor="filter">Lọc theo:</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Lọc người dùng"
              >
                <option value="all">Tất cả</option>
                <option value="firstname">Tên</option>
              </select>
            </div>

            {/* Search input */}
            <div className="search">
              <label htmlFor="search">Tìm:</label>
              <input
                type="text"
                className="form-input"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm"
                aria-label="Tim kiếm người dùng"
              />
            </div>
          </div>

          <h3 className="home-sub-heading">Tất cả người dùng</h3>

          {filteredUsers.length > 0 ? (
            <div className="user-container">
              {/* Users Table */}
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Họ</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Tuổi</th>
                    <th>Giới tính</th>
                    <th>Chuyên khoa</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id || user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={user.pic}
                          alt={`Ảnh đại diện của ${user.firstname}`}
                        />
                      </td>
                      <td>{user.firstname}</td>
                      <td>{user.lastname}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{user.age}</td>
                      <td>{user.gender}</td>
                      <td>{user.isDoctor ? "Có" : "Không"}</td>
                      <td className="select">
                        <button
                          className="btn user-btn"
                          onClick={() => deleteUser(user.id || user._id)}
                          aria-label={`Xóa ${user.firstname}`}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
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

export default Users;
