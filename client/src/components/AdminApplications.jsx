import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

// Configure axios base URL from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * AdminApplications Component
 *
 * Displays and manages doctor applications for admin approval.
 * Allows administrators to view, accept, or reject pending doctor applications.
 *
 * @returns {JSX.Element} The rendered AdminApplications component
 */
const AdminApplications = () => {
  // State to store doctor applications
  const [applications, setApplications] = useState([]);

  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all pending doctor applications from the server
   */
  const fetchApplications = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchData(`/doctor/getnotdoctors`);
      setApplications(result);
    } catch (error) {
      toast.error("Failed to load applications");
      console.error("Error fetching applications:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Approves a doctor application
   * @param {string} userId - ID of the user to approve as doctor
   */
  const acceptUser = async (userId) => {
    try {
      const confirm = window.confirm("Are you sure you want to accept?");
      if (!confirm) return;

      // Debug: Log the userId being sent
      console.log("Accepting user with ID:", userId);

      await toast.promise(
        axios.put(
          "/doctor/acceptdoctor",
          { id: userId },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Application accepted",
          error: "Unable to accept application",
          loading: "Accepting application...",
        }
      );

      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      console.error("Error accepting application:", error);
    }
  };

  /**
   * Rejects a doctor application
   * @param {string} userId - ID of the user to reject
   */
  const rejectUser = async (userId) => {
    try {
      const confirm = window.confirm("Are you sure you want to reject?");
      if (!confirm) return;

      // Debug: Log the userId being sent
      console.log("Rejecting user with ID:", userId);

      await toast.promise(
        axios.put(
          "/doctor/rejectdoctor",
          { id: userId },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Application rejected",
          error: "Unable to reject application",
          loading: "Rejecting application...",
        }
      );

      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
    }
  };

  /**
   * Format specializations for display
   * @param {Array} specializations - Array of specialization objects
   * @returns {string} Comma-separated specialization names
   */
  const formatSpecializations = (specializations) => {
    if (!specializations || !Array.isArray(specializations) || specializations.length === 0) {
      return "Không xác định";
    }
    return specializations.map(spec => spec.name).join(", ");
  };

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();
  }, []);

  // Default profile image fallback
  const defaultProfileImage =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="home-sub-heading">All Applications</h3>

          {applications.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Pic</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile No.</th>
                    <th>Experience</th>
                    <th>Specializations</th>
                    <th>Fees</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application, index) => {
                    const user = application?.user || application?.userId || {};

                    return (
                      <tr key={application?.id || application?._id || index}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            className="user-table-pic"
                            src={user?.pic || defaultProfileImage}
                            alt={`${user?.firstname || "Doctor"}'s profile`}
                            loading="lazy"
                          />
                        </td>
                        <td>{user?.firstname}</td>
                        <td>{user?.lastname}</td>
                        <td>{user?.email}</td>
                        <td>{user?.mobile}</td>
                        <td>{application?.experience}</td>
                        <td>{formatSpecializations(application?.specializations)}</td>
                        <td>{application?.fees}</td>
                        <td className="select">
                          <button
                            className="btn user-btn accept-btn"
                            onClick={() => acceptUser(user?.id || user?._id || application?.userId)}
                            aria-label={`Accept ${user?.firstname}'s application`}
                          >
                            Accept
                          </button>
                          <button
                            className="btn user-btn"
                            onClick={() => rejectUser(user?.id || user?._id || application?.userId)}
                            aria-label={`Reject ${user?.firstname}'s application`}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default AdminApplications;