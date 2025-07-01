/**
 * Admin Dashboard Component
 * 
 * This component serves as the main container for the admin dashboard,
 * dynamically rendering different dashboard views based on the 'type' prop.
 * It provides a consistent layout with sidebar navigation across all dashboard views.
 */
import React from "react";

// Admin dashboard components
import AdminApplications from "../components/AdminApplications";
import AdminAppointments from "../components/AdminAppointments";
import AdminDoctors from "../components/AdminDoctors";
import Sidebar from "../components/Sidebar";
import Users from "../components/Users";
import Home from "../components/Home";
import Aprofile from "../components/Aprofile";
import AdminSpecifications from "../components/AdminSpecifications";

/**
 * Dashboard component that renders different admin views based on the type prop
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Determines which dashboard view to render
 *                             Possible values: "home", "users", "doctors", 
 *                             "applications", "appointments", "aprofile"
 * @returns {JSX.Element} Dashboard view with sidebar and content area
 */
const Dashboard = ({ type }) => {
  /**
   * Renders the appropriate component based on the 'type' prop
   * @returns {JSX.Element} The component to render in the main content area
   */
  const renderDashboardContent = () => {
    switch (type) {
      case "home":
        return <Home />;
      case "users":
        return <Users />;
      case "doctors":
        return <AdminDoctors />;
      case "applications":
        return <AdminApplications />;
      case "appointments":
        return <AdminAppointments />;
      case "specifications":
        return <AdminSpecifications />;
      case "aprofile":
        return <Aprofile />;
      default:
        return null;
    }
  };

  return (
    <section className="layout-section" aria-label="Admin Dashboard">
      <div className="layout-container">
        {/* Sidebar navigation */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="dashboard-content">
          {renderDashboardContent()}
        </main>
      </div>
    </section>
  );
};

export default Dashboard;