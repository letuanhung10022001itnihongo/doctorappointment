// filepath: d:\DoctorAppointment\client\src\components\HomeCircles.jsx
import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import fetchData from "../helper/apiCall";
import "../styles/homecircles.css";

/**
 * HomeCircles component displays animated counter circles for key statistics
 * Shows real-time statistics from the database
 */
const HomeCircles = () => {
  const [statistics, setStatistics] = useState([
    {
      id: 1,
      value: 0,
      label: "Bệnh nhân"
    },
    {
      id: 2,
      value: 0,
      label: "Bác sĩ"
    },
    {
      id: 3,
      value: 0,
      label: "Cuộc hẹn"
    }
  ]);

  const [loading, setLoading] = useState(true);

  /**
   * Fetches public statistics from the API
   */
  const fetchPublicStats = async () => {
    try {
      setLoading(true);
      const response = await fetchData("/stats/public");
      
      if (response && response.success) {
        setStatistics([
          {
            id: 1,
            value: response.data.patientCount,
            label: "Bệnh nhân"
          },
          {
            id: 2,
            value: response.data.doctorCount,
            label: "Bác sĩ"
          },
          {
            id: 3,
            value: response.data.appointmentCount,
            label: "Cuộc hẹn"
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching public stats:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicStats();
  }, []);

  /**
   * Creates a counter circle with animation
   * @param {number} value - The target number to count up to
   * @param {string} label - The descriptive text below the counter
   * @param {number} key - React key for the component
   * @returns {JSX.Element} A circle with animated counter
   */
  const renderCircle = (value, label, key) => (
    <div className="circle" key={key}>
      <CountUp
        start={0}
        end={value}
        delay={0}
        enableScrollSpy={true}
        scrollSpyDelay={500}
      >
        {({ countUpRef }) => (
          <div className="counter">
            <span ref={countUpRef} />+
          </div>
        )}
      </CountUp>
      <span className="circle-name">
        {/* Split label by newline to create line breaks */}
        {label.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < label.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    </div>
  );

  // Show loading state or placeholder while fetching data
  if (loading) {
    return (
      <section className="container circles">
        {statistics.map(stat => 
          renderCircle(0, stat.label, stat.id)
        )}
      </section>
    );
  }

  return (
    <section className="container circles">
      {/* Map through statistics data to generate circles */}
      {statistics.map(stat => 
        renderCircle(stat.value, stat.label, stat.id)
      )}
    </section>
  );
};

export default HomeCircles;