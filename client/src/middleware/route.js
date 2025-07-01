import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

/**
 * Protected Route Component - Ensures user is authenticated
 * Redirects unauthenticated users to home page
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - Child components or redirection
 */
export const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

/**
 * Public Route Component - Only accessible to unauthenticated users
 * Redirects authenticated users to home page
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @returns {React.ReactNode} - Child components or redirection
 */
export const Public = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return children;
  }
  
  return <Navigate to="/" replace />;
};

/**
 * Admin Route Component - Ensures user is authenticated and has admin privileges
 * Redirects non-admin or unauthenticated users to home page
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if user is admin
 * @returns {React.ReactNode} - Child components or redirection
 */
export const Admin = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  try {
    const user = jwtDecode(token);
    
    if (user.role !== "Admin") {
      return <Navigate to="/" replace />;
    }
    
    return children;
  } catch (error) {
    // If token is invalid or cannot be decoded, redirect to home
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return <Navigate to="/" replace />;
  }
};