import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaUserMd } from "react-icons/fa";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import fetchData from "../helper/apiCall";
import axios from "axios";
import "../styles/Home.css";

// Set the base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

/**
 * Home component serves as the dashboard of the application
 * Displays statistics about users, appointments, and doctors
 */
const Home = () => {
  // State variables to store count data
  const [stats, setStats] = useState({
    userCount: 0,
    appointmentCount: 0,
    doctorCount: 0
  });
  
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  /**
   * Fetches count data from the API endpoints
   * Updates the state with the retrieved counts
   */
  const fetchDataCounts = async () => {
    try {
      dispatch(setLoading(true));
      
      // Fetch data in parallel for better performance
      const [userData, appointmentData, doctorData] = await Promise.all([
        fetchData("/user/getallusers"),
        fetchData("/appointment/getallappointments"),
        fetchData("/doctor/getalldoctors")
      ]);
      
      setStats({
        userCount: userData.length,
        appointmentCount: appointmentData.length,
        doctorCount: doctorData.length
      });
      
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching data counts:", error);
      dispatch(setLoading(false));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDataCounts();
  }, []);

  // Format data for charts
  const chartData = [
    { name: "Người dùng", count: stats.userCount },
    { name: "Cuộc hẹn", count: stats.appointmentCount },
    { name: "Bác sĩ", count: stats.doctorCount },
  ];

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <div>
            <h1>Chào mừng đến với Bảng điều khiển!</h1>
            
            {/* Dashboard Cards */}
            <div className="main-cards">
              {/* Users Card */}
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>NGƯỜI DÙNG</h3>
                  <FaUsers />
                </div>
                <h2 style={{ color: "white" }}>{stats.userCount}</h2>
              </div>
              
              {/* Appointments Card */}
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>CUỘC HẸN</h3>
                  <BsFillGrid3X3GapFill className="card_icon" />
                </div>
                <h2 style={{ color: "white" }}>{stats.appointmentCount}</h2>
              </div>
              
              {/* Doctors Card */}
              <div className="card">
                <div className="card-inner">
                  <h3 style={{ color: "white" }}>BÁC SĨ</h3>
                  <FaUserMd />
                </div>
                <h2 style={{ color: "white" }}>{stats.doctorCount}</h2>
              </div>
            </div>
            
            {/* Chart Section */}
            <div className="charts">
              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Line Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;