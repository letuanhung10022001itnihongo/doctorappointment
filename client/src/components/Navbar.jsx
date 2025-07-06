import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import jwt_decode from "jwt-decode";
import axios from "axios";
import fetchData from "../helper/apiCall";
import "../styles/navbar.css";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Navbar component for application navigation
 * Displays different links based on user role (Doctor, Patient, or unauthenticated)
 * Includes mobile-responsive menu with toggle functionality
 */
const Navbar = () => {
  // State to manage mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // State to manage unread notification count
  const [unreadCount, setUnreadCount] = useState(0);

  // Redux and routing hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Authentication state
  const token = localStorage.getItem("token") || "";
  const user = token ? jwt_decode(token) : null;

  /**
   * Fetches unread notification count from API
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetchData("/notification/unreadcount");
      if (response && typeof response.count === "number") {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  }, [user]);

  // Fetch unread count when component mounts or user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  // Set up interval to periodically update unread count
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Update every 30 seconds

    // Listen for custom event when notifications are read
    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };

    window.addEventListener("notificationsRead", handleNotificationsRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsRead", handleNotificationsRead);
    };
  }, [user, fetchUnreadCount]);

  /**
   * Handles user logout
   * Clears user data from Redux store and localStorage, then redirects to login
   */
  const handleLogout = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    setUnreadCount(0); // Reset unread count on logout
    navigate("/login");
  };

  /**
   * Toggles the mobile menu state
   */
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  /**
   * Handles notification link click - refresh unread count
   */
  const handleNotificationClick = () => {
    // Reset unread count when user clicks on notifications
    setTimeout(() => {
      fetchUnreadCount();
    }, 1000); // Delay to allow notifications to be marked as read
  };

  /**
   * Renders navigation links based on user role
   * @returns {JSX.Element} Navigation links appropriate for user's role
   */
  const renderRoleBasedLinks = () => {
    if (!user) {
      return (
        <>
          <li>
            <NavLink className="btn" to="/login">
              Đăng nhập
            </NavLink>
          </li>
          <li>
            <NavLink className="btn" to="/register">
              Đăng ký
            </NavLink>
          </li>
        </>
      );
    }

    // Common links for authenticated users
    const commonLinks = (
      <>
        <li className="notification-link">
          <NavLink to="/notifications" onClick={handleNotificationClick}>
            Thông báo
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <HashLink to="/#contact">Liên lạc với chúng tôi</HashLink>
        </li>
        <li>
          <NavLink to="/profile">Thông tin cá nhân</NavLink>
        </li>
        <li>
          <NavLink to="/ChangePassword">Đổi mật khẩu</NavLink>
        </li>
        <li>
          <span className="btn" onClick={handleLogout}>
            Đăng xuất
          </span>
        </li>
      </>
    );

    // Doctor-specific links
    if (user.role === "Doctor") {
      return (
        <>
          <li>
            <NavLink to="/applyfordoctor">Đăng ký bác sĩ</NavLink>
          </li>
          <li>
            <NavLink to="/appointments">Các cuộc hẹn</NavLink>
          </li>
          {commonLinks}
        </>
      );
    }

    // Patient-specific links
    if (user.role === "Patient") {
      return (
        <>
          <li>
            <NavLink to="/doctors">Bác sĩ</NavLink>
          </li>
          <li>
            <NavLink to="/appointments">Các cuộc hẹn</NavLink>
          </li>
          {commonLinks}
        </>
      );
    }

    return commonLinks;
  };

  return (
    <header>
      {/* Main navigation */}
      <nav className={menuOpen ? "nav-active" : ""}>
        {/* Logo */}
        <h2 className="nav-logo">
          <NavLink to="/">Đặt lịch khám bệnh</NavLink>
        </h2>

        {/* Navigation links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/">Trang chủ</NavLink>
          </li>
          {renderRoleBasedLinks()}
        </ul>
      </nav>

      {/* Mobile menu toggle buttons */}
      <div className="menu-icons">
        {!menuOpen ? (
          <FiMenu
            className="menu-open"
            onClick={toggleMenu}
            aria-label="Open menu"
          />
        ) : (
          <RxCross1
            className="menu-close"
            onClick={toggleMenu}
            aria-label="Close menu"
          />
        )}
      </div>
    </header>
  );
};

export default Navbar;
