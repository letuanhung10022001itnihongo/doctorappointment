const { User, Doctor, Appointment } = require("../models");

/**
 * Get public statistics for the application
 * Returns counts of patients, doctors, and appointments
 * This is a public endpoint that doesn't require authentication
 */
const getPublicStats = async (req, res) => {
  try {
    // Get all counts in parallel for better performance
    const [patientCount, doctorCount, appointmentCount] = await Promise.all([
      // Count users with type 'patient' or users who are not doctors
      User.count({
        where: {
          role: "Patient"
        }
      }),
      
      // Count approved doctors
      User.count({
        where: {
          role: "Doctor"
        }
      }),
      
      // Count all appointments
      Appointment.count()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        patientCount,
        doctorCount,
        appointmentCount
      }
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch statistics",
      error: error.message
    });
  }
};

module.exports = {
  getPublicStats
};