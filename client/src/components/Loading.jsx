import React from "react";
import "../styles/loading.css";

/**
 * Loading component
 * Displays a loading indicator when content is being fetched or processed
 * Used throughout the application during async operations
 * 
 * @returns {JSX.Element} A centered loading spinner with text
 */
const Loading = () => {
  return (
    <div className="loading" role="alert" aria-busy="true">
      <div className="loader">Loading...</div>
    </div>
  );
};

export default Loading;