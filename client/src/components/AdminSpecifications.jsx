import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";
import "../styles/adminspecifications.css";

// Configure axios base URL from environment variables
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * AdminSpecifications Component
 *
 * Displays and manages medical specifications for admin.
 * Allows administrators to view, add, and delete specifications.
 *
 * @returns {JSX.Element} The rendered AdminSpecifications component
 */
const AdminSpecifications = () => {
  // State to store specifications
  const [specifications, setSpecifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSpecName, setNewSpecName] = useState("");

  // Redux state and dispatch
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all specifications from the server
   */
  const fetchSpecifications = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchData(`/specification/getallspecifications`);
      setSpecifications(result.data || []);
    } catch (error) {
      toast.error("Failed to load specifications");
      console.error("Error fetching specifications:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Adds a new specification
   */
  const addSpecification = async (e) => {
    e.preventDefault();

    if (!newSpecName.trim()) {
      toast.error("Please enter a specification name");
      return;
    }

    try {
      await toast.promise(
        axios.post(
          "/specification/create",
          { name: newSpecName.trim() },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Specification added successfully",
          error: "Unable to add specification",
          loading: "Adding specification...",
        }
      );

      // Reset form and close modal
      setNewSpecName("");
      setShowModal(false);

      // Refresh the specifications list
      fetchSpecifications();
    } catch (error) {
      console.error("Error adding specification:", error);
    }
  };

  /**
   * Deletes a specification (soft delete)
   * @param {number} specId - ID of the specification to delete
   * @param {string} specName - Name of the specification for confirmation
   */
  const deleteSpecification = async (specId, specName) => {
    try {
      const confirm = window.confirm(
        `Are you sure you want to delete "${specName}"?`
      );
      if (!confirm) return;

      await toast.promise(
        axios.delete(`/specification/delete/${specId}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        {
          success: "Specification deleted successfully",
          error: "Unable to delete specification",
          loading: "Deleting specification...",
        }
      );

      // Refresh the specifications list
      fetchSpecifications();
    } catch (error) {
      console.error("Error deleting specification:", error);
    }
  };

  // Fetch specifications when component mounts
  useEffect(() => {
    fetchSpecifications();
  }, []);

  /**
   * Renders the add specification modal
   */
  const renderAddModal = () => (
    <div
      className="modal flex-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
      }}
    >
      <div
        className="modal__content"
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "10px",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h2 style={{ color: "#1e375a", marginBottom: "1rem" }}>
          Add New Specification
        </h2>

        <form onSubmit={addSpecification}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter specification name"
            value={newSpecName}
            onChange={(e) => setNewSpecName(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "1rem",
              padding: "0.8rem",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
            autoFocus
          />

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setNewSpecName("");
              }}
              className="btn"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  /**
   * Formats date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          {/* Title */}
          <h3 className="home-sub-heading">Các chuyên khoa</h3>

          {/* Add Button - positioned below title, above table */}
          <div className="add-specification-container">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-success add-specification-btn"
              aria-label="Add new specification"
            >
              Thêm chuyên khoa
            </button>
          </div>

          {specifications.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên chuyên khoa</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {specifications.map((specification) => (
                    <tr key={specification.id}>
                      <td>{specification.id}</td>
                      <td>{specification.name}</td>
                      <td>{formatDate(specification.createdAt)}</td>
                      <td className="select">
                        <button
                          className="btn user-btn"
                          onClick={() =>
                            deleteSpecification(
                              specification.id,
                              specification.name
                            )
                          }
                          aria-label={`Delete ${specification.name}`}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}

      {/* Add Modal */}
      {showModal && renderAddModal()}
    </>
  );
};

export default AdminSpecifications;
