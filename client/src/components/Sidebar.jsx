import React from "react";
import {
  FaHome,
  FaList,
  FaUser,
  FaUserMd,
  FaUsers,
  FaEnvelope,
  FaCogs,
} from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import "../styles/sidebar.css";

/**
 * Sidebar component for dashboard navigation
 * Provides links to different sections of the admin dashboard
 * Includes logout functionality
 */
const Sidebar = () => {
  // Redux and routing hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Navigation menu items configuration
   * Each item contains a name, path, and icon
   */
  const sidebarItems = [
    {
      name: "Trang quản trị",
      path: "/dashboard/home",
      icon: <FaHome title="Trang quản trị" />,
    },
    {
      name: "Người dùng",
      path: "/dashboard/users",
      icon: <FaUsers title="Quản lý người dùng" />,
    },
    {
      name: "Bác sĩ",
      path: "/dashboard/doctors",
      icon: <FaUserMd title="Quản lý bác sĩ" />,
    },
    {
      name: "Quản lý cuộc hẹn",
      path: "/dashboard/appointments",
      icon: <FaList title="Xem cuộc hẹn" />,
    },
    {
      name: "Đơn đăng ký bác sĩ",
      path: "/dashboard/applications",
      icon: <FaEnvelope title="Đơn đăng ký bác sĩ" />,
    },
    {
      name: "Chuyên khoa",
      path: "/dashboard/specifications",
      icon: <FaCogs />,
    }, // New line
    {
      name: "Thông tin Admin",
      path: "/dashboard/aprofile",
      icon: <FaUser title="Thông tin Admin" />,
    },
  ];

  /**
   * Handles user logout
   * Clears user data from Redux store and localStorage
   * Redirects to login page
   */
  const handleLogout = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <section className="sidebar-section flex-center">
      <div className="sidebar-container">
        {/* Navigation menu */}
        <ul>
          {sidebarItems.map((item, index) => (
            <li key={index}>
              {item.icon}
              <NavLink to={item.path}>{item.name}</NavLink>
            </li>
          ))}
        </ul>

        {/* Logout button */}
        <div
          className="logout-container"
          onClick={handleLogout}
          role="button"
          aria-label="Logout"
        >
          <MdLogout title="Logout" />
          <p>Đăng xuất</p>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;