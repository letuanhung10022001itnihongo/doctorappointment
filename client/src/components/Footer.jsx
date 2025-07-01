import React from "react";
import "../styles/footer.css";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";
import { NavLink } from "react-router-dom";

/**
 * Footer - Application footer component with navigation links and social media icons
 * 
 * Displays:
 * - Main site navigation links
 * - Social media links
 * - Copyright information
 * 
 * @returns {JSX.Element} - Rendered footer component
 */
const Footer = () => {
  // Navigation links configuration for easy management and updates
  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/doctors", label: "Bác sĩ" },
    { path: "/appointments", label: "Cuộc hẹn" },
    { path: "/notifications", label: "Thông báo" },
    { path: "/#contact", label: "Liên lạc với chúng tôi", isHashLink: true },
    { path: "/profile", label: "Thông tin cá nhân" }
  ];

  // Social media links configuration
  const socialLinks = [
    { platform: "facebook", icon: <FaFacebookF />, url: "https://www.facebook.com/" },
    { platform: "youtube", icon: <FaYoutube />, url: "https://www.youtube.com/" },
    { platform: "instagram", icon: <FaInstagram />, url: "https://www.instagram.com/" }
  ];

  // Current year for copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer">
        {/* Navigation links section */}
        <div className="footer-links">
          <h3>Đường dẫn</h3>
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                {link.isHashLink ? (
                  <HashLink to={link.path}>{link.label}</HashLink>
                ) : (
                  <NavLink to={link.path}>{link.label}</NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Social media links section */}
        <div className="social">
          <h3>Mạng xã hội</h3>
          <ul>
            {socialLinks.map((social) => (
              <li key={social.platform} className={social.platform}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visit our ${social.platform} page`}
                >
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright section */}
      <div className="footer-bottom">
        Bản quyền &copy; {currentYear}
      </div>
    </footer>
  );
};

export default Footer;