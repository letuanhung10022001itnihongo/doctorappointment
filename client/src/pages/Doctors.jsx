import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";
import BookAppointment from "../components/BookAppointment";
import DoctorSearch from "../components/DoctorSearch";
import DoctorCard from "../components/DoctorCard";

// Redux
import { setLoading } from "../redux/reducers/rootSlice";
import fetchData from "../helper/apiCall";

// Styles
import "../styles/doctors.css";
import "../styles/doctorcard.css";

// Configure axios base URL
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Doctors Page - Main component that displays all available doctors
 */
const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]); // Store all doctors for reset
  const [isSearchActive, setIsSearchActive] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches all available doctors from the API
   */
  const fetchAllDoctors = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetchData("/doctor/getalldoctors");
      setDoctors(response || []);
      setAllDoctors(response || []); // Store for reset functionality
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Handles doctor search with filters
   */
  const handleSearch = async (searchFilters) => {
    try {
      dispatch(setLoading(true));
      setIsSearchActive(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchFilters.specifications.length > 0) {
        params.append('specifications', searchFilters.specifications.join(','));
      }
      
      if (searchFilters.minExperience) {
        params.append('minExperience', searchFilters.minExperience);
      }
      
      if (searchFilters.minFees) {
        params.append('minFees', searchFilters.minFees);
      }
      
      if (searchFilters.maxFees) {
        params.append('maxFees', searchFilters.maxFees);
      }

      const response = await fetchData(`/doctor/search?${params.toString()}`);
      
      if (response && response.success) {
        setDoctors(response.data || []);
        toast.success(`Đã tìm thấy ${response.count || 0} bác sĩ phù hợp với tiêu chí của bạn`);
      } else {
        setDoctors([]);
        toast.info("Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc.");
      }
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast.error("Không thể tìm kiếm bác sĩ. Vui lòng thử lại.");
      setDoctors([]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Resets search and shows all doctors
   */
  const handleResetSearch = () => {
    setDoctors(allDoctors);
    setIsSearchActive(false);
    toast.success("Search filters cleared");
  };

  // Fetch doctors when component mounts
  useEffect(() => {
    fetchAllDoctors();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        {loading ? (
          <Loading />
        ) : (
          <section className="container doctors">
            <h2 className="page-heading">Các bác sĩ của chúng tôi</h2>
            
            {/* Search Component */}
            <DoctorSearch onSearch={handleSearch} onReset={handleResetSearch} />
            
            {/* Search Results Info */}
            {isSearchActive && (
              <div className="search-info">
                <p>Kết quả tìm kiếm: {doctors.length} bác sĩ được tìm thấy</p>
              </div>
            )}
            
            {doctors.length > 0 ? (
              <div className="doctors-card-container">
                {doctors.map((doctor, index) => (
                  <DoctorCard key={doctor.id || index} ele={doctor} />
                ))}
              </div>
            ) : (
              <Empty message={
                isSearchActive 
                  ? "Không tìm thấy bác sĩ nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc."
                  : "Hiện tại không có bác sĩ nào. Vui lòng quay lại sau."
              } />
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Doctors;