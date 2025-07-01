/**
 * Error Page Component
 * 
 * Displays a 404 error page when users navigate to a non-existent route.
 * Provides a clear message and a navigation link back to the home page.
 */
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/error.css";

/**
 * Error component that renders a 404 page
 * 
 * @returns {JSX.Element} 404 error page with navigation link to home
 */
const Error = () => {
  return (
    <section className="error container" aria-labelledby="error-heading">
      {/* Error message */}
      <h2 id="error-heading">Error! Page Not Found</h2>
      
      {/* Visual indicator for 404 error */}
      <div className="error-code">404</div>
      
      {/* Descriptive message for users */}
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      
      {/* Navigation link back to home */}
      <NavLink
        to="/"
        className="btn error-btn"
        aria-label="Return to home page"
      >
        Go to Home
      </NavLink>
    </section>
  );
};

export default Error;