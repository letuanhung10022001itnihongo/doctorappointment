import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import jwt_decode from "jwt-decode";

/**
 * Navigation component that adapts based on user authentication status and role
 * Provides different navigation options for admin users, regular users, and non-authenticated visitors
 */
const UserNav = () => {
  // State to track mobile menu toggle
  const [iconActive, setIconActive] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get token from localStorage
  const token = localStorage.getItem("token") || "";
  
  // Parse user information from token if it exists
  const user = token ? jwt_decode(token) : {};

  /**
   * Handles user logout by clearing Redux state and localStorage
   * Redirects to login page after logout
   */
  const handleLogout = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    navigate("/login");
  };

  /**
   * Toggles the mobile menu open/closed
   * @param {boolean} isActive - Whether to open or close the menu
   */
  const toggleMenu = (isActive) => {
    setIconActive(isActive);
  };

  return (
    <header>
      {/* Main navigation container */}
      <nav className={iconActive ? "nav-active" : ""}>
        {/* Site logo/title with link to homepage */}
        <h2 className="nav-logo">
          <NavLink to={"/"}>Doctor's Appointment</NavLink>
        </h2>

        {/* Navigation links */}
        <ul className="nav-links">
          {/* Common links for all users */}
          <li>
            <NavLink to={"/"}>Home</NavLink>
          </li>
          <li>
            <NavLink to={"/doctors"}>Doctors</NavLink>
          </li>

          {/* Admin-specific navigation */}
          {token && user.isAdmin && (
            <li>
              <NavLink to={"/dashboard/users"}>Dashboard</NavLink>
            </li>
          )}

          {/* Regular user navigation */}
          {token && !user.isAdmin && (
            <>
              <li>
                <NavLink to={"/notifications"}>Notifications</NavLink>
              </li>
              <li>
                <HashLink to={"/#contact"}>Contact Us</HashLink>
              </li>
              <li>
                <NavLink to={"/profile"}>Profile</NavLink>
              </li>
              <li>
                <NavLink to={"/ChangePassword"}>Change Password</NavLink>
              </li>
            </>
          )}

          {/* Authentication links - conditionally render based on auth status */}
          {!token ? (
            <>
              <li>
                <NavLink className="btn" to={"/login"}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink className="btn" to={"/register"}>
                  Register
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <span className="btn" onClick={handleLogout}>
                Logout
              </span>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile menu toggle icons */}
      <div className="menu-icons">
        {!iconActive ? (
          <FiMenu
            className="menu-open"
            onClick={() => toggleMenu(true)}
          />
        ) : (
          <RxCross1
            className="menu-close"
            onClick={() => toggleMenu(false)}
          />
        )}
      </div>
    </header>
  );
};

export default UserNav;