import React from "react";

/**
 * Empty - A reusable component that displays a message when no content is available
 * 
 * Used as a placeholder in lists, tables, or content areas when there's no data to display
 * Styled with the 'nothing' and 'flex-center' CSS classes for consistent empty state presentation
 * 
 * @returns {JSX.Element} - "Nothing to show" message with appropriate styling
 */
const Empty = () => {
  return (
    <h2 className="nothing flex-center" aria-live="polite">
      Danh sách trống
    </h2>
  );
};

export default Empty;