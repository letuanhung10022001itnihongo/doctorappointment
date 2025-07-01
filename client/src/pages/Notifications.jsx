import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/notification.css";
import "../styles/user.css";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";

/**
 * Notifications Component
 *
 * Displays user notifications with pagination functionality.
 * Fetches notifications from the API and handles pagination client-side.
 */
const Notifications = () => {
  // State for storing notification data
  const [notifications, setNotifications] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const notificationsPerPage = 8;

  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      // Fix: Use the correct API endpoint with notification prefix
      const response = await fetchData("/notification/markallread", "PUT");
      console.log("All notifications marked as read:", response);
      
      // Update local state to reflect read status
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      
      // Trigger a custom event to notify navbar to update count
      window.dispatchEvent(new CustomEvent('notificationsRead'));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, []);

  /**
   * Fetches notifications from the API
   * Uses server-side pagination for better performance
   */
  const fetchNotifications = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Fetch data with pagination parameters
      const response = await fetchData(
        `/notification/getallnotifs?page=${
          currentPage - 1
        }&limit=${notificationsPerPage}`
      );

      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
        setTotalCount(response.totalCount || response.data.length);
      } else {
        // Handle unexpected response format
        console.error("Unexpected API response format:", response);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      dispatch(setLoading(false));
    }
  }, [currentPage, dispatch]);

  // Fetch notifications when component mounts or page changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all notifications as read when component first mounts
  useEffect(() => {
    // Add a small delay to ensure notifications are fetched first
    const timer = setTimeout(() => {
      markAllNotificationsAsRead();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Remove markAllNotificationsAsRead from dependencies to prevent infinite loop

  // Calculate total pages based on item count
  const totalPages = Math.ceil(totalCount / notificationsPerPage);

  /**
   * Handles page change in pagination
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = (page) => {
    // Validate page number
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Renders pagination buttons
   * @returns {JSX.Element[]} Array of pagination button elements
   */
  const renderPagination = () => {
    const pages = [];

    // Display previous page button if not on first page
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)} // Fixed: was currentPage + 1
          aria-label="Previous page"
          className="pagination-btn"
        >
          &laquo;
        </button>
      );
    }

    // Generate page number buttons
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? "active" : ""}`}
          aria-label={`Page ${i}`}
        >
          {i}
        </button>
      );
    }

    // Display next page button if not on last page
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
          className="pagination-btn"
        >
          &raquo;
        </button>
      );
    }

    return pages;
  };

  /**
   * Formats date from timestamp
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted date string
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  /**
   * Formats time from timestamp
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted time string
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Invalid Time";
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Thông báo của bạn</h2>

          {notifications.length > 0 ? (
            <div className="notifications-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Nội dung</th>
                    <th>Ngày</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, index) => {
                    return (
                      <tr 
                        key={notification?.id || notification?._id || index}
                        className={notification?.isRead ? 'read' : 'unread'} // Add visual indicator for read status
                      >
                        <td>
                          {(currentPage - 1) * notificationsPerPage + index + 1}
                        </td>
                        <td>{notification?.content || "No content"}</td>
                        <td>
                          {formatDate(
                            notification?.updatedAt || notification?.createdAt
                          )}
                        </td>
                        <td>
                          {formatTime(
                            notification?.updatedAt || notification?.createdAt
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination" aria-label="Pagination navigation">
                  {renderPagination()}
                </div>
              )}
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Notifications;