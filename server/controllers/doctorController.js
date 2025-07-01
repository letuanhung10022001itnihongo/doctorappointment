const {
  User,
  Doctor,
  Notification,
  Appointment,
  Specification,
  DoctorSpecification,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const searchDoctors = async (req, res) => {
  try {
    const { specifications, minExperience, minFees, maxFees } = req.query;

    // Base query to find active doctors
    const whereClause = { isDoctor: true };

    // Exclude requesting doctor from results if logged in
    if (req.locals) {
      whereClause.id = { [Op.ne]: req.locals };
    }

    // Add experience filter
    if (minExperience && !isNaN(minExperience)) {
      whereClause.experience = { [Op.gte]: parseInt(minExperience) };
    }

    // Add fees filter
    if (minFees && !isNaN(minFees) && maxFees && !isNaN(maxFees)) {
      whereClause.fees = {
        [Op.between]: [parseFloat(minFees), parseFloat(maxFees)],
      };
    } else if (minFees && !isNaN(minFees)) {
      whereClause.fees = { [Op.gte]: parseFloat(minFees) };
    } else if (maxFees && !isNaN(maxFees)) {
      whereClause.fees = { [Op.lte]: parseFloat(maxFees) };
    }

    const includeOptions = [
      {
        model: User,
        as: "user",
      },
      {
        model: Specification,
        as: "specializations",
        through: { attributes: [] },
        where: { isDeleted: false },
        required: false,
      },
    ];

    // Add specification filter if provided
    if (specifications) {
      const specIds = specifications
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
      if (specIds.length > 0) {
        includeOptions[1].where = {
          ...includeOptions[1].where,
          id: { [Op.in]: specIds },
        };
        includeOptions[1].required = true; // Make it required to filter doctors
      }
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: includeOptions,
    });

    return res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    console.error("Error searching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Unable to search doctors",
      error: error.message,
    });
  }
};

/**
 * Get all doctors with isDoctor status true
 * Excludes the requesting doctor if they are making the request
 */
const getalldoctors = async (req, res) => {
  try {
    // Base query to find active doctors
    const whereClause = { isDoctor: true };

    // Exclude requesting doctor from results if logged in
    if (req.locals) {
      whereClause.id = { [Op.ne]: req.locals };
    }

    const docs = await Doctor.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    return res.status(200).send(docs);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send("Unable to get doctors");
  }
};

/**
 * Get all users who have applied but aren't approved as doctors yet
 */
const getnotdoctors = async (req, res) => {
  try {
    const docs = await Doctor.findAll({
      where: {
        isDoctor: false,
        userId: { [Op.ne]: req.locals },
      },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    return res.status(200).send(docs);
  } catch (error) {
    console.error("Error fetching non-doctors:", error);
    res.status(500).send("Unable to get non doctors");
  }
};

/**
 * Handle doctor application submission
 */
const applyfordoctor = async (req, res) => {
  try {
    // Check if user already has an application
    const existingApplication = await Doctor.findOne({
      where: { userId: req.locals },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Application already exists",
      });
    }

    // Handle both nested and direct data structures
    const formData = req.body.formDetails || req.body;
    const { experience, fees, specializations } = formData;

    // Validate required fields
    if (!experience || !fees) {
      return res.status(400).json({
        success: false,
        message: "Experience and fees are required",
      });
    }

    // Validate specializations
    if (
      !specializations ||
      !Array.isArray(specializations) ||
      specializations.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one specialization is required",
      });
    }

    // Get the first specialization name for the main specialization field
    const primarySpecification = await Specification.findByPk(
      specializations[0]
    );
    if (!primarySpecification) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization selected",
      });
    }

    // Create new doctor application
    const doctor = await Doctor.create({
      experience,
      fees,
      specialization: primarySpecification.name, // Set the primary specialization
      userId: req.locals,
    });

    // Add all specializations to the junction table
    const specificationRecords = specializations.map((specId) => ({
      doctorId: doctor.id,
      specificationId: specId,
    }));

    await DoctorSpecification.bulkCreate(specificationRecords);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      success: false,
      message: "Unable to submit application",
      error: error.message,
    });
  }
};

/**
 * Accept a doctor application and notify the user
 */
const acceptdoctor = async (req, res) => {
  try {
    // Try to get userId from different possible sources
    const userId = req.body.id || req.body.userId || req.params.id;

    // Validate that we have a userId
    if (!userId) {
      console.error("No userId provided in request:", {
        body: req.body,
        params: req.params,
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if doctor application exists
    const doctorApplication = await Doctor.findOne({ where: { userId } });
    if (!doctorApplication) {
      return res.status(404).json({
        success: false,
        message: "Doctor application not found",
      });
    }

    // Update user record
    await User.update(
      { isDoctor: true, status: "accepted" },
      { where: { id: userId } }
    );

    // Update doctor record
    await Doctor.update({ isDoctor: true }, { where: { userId } });

    // Create and send notification
    await Notification.create({
      userId,
      content: `Xin chúc mừng, đơn đăng ký của bạn đã được phê duyệt.`,
    });

    return res.status(200).json({
      success: true,
      message: "Application accepted notification sent",
    });
  } catch (error) {
    console.error("Error accepting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while sending notification",
      error: error.message,
    });
  }
};

/**
 * Reject a doctor application and notify the user
 */
const rejectdoctor = async (req, res) => {
  try {
    // Try to get userId from different possible sources
    const userId = req.body.id || req.body.userId || req.params.id;

    // Validate that we have a userId
    if (!userId) {
      console.error("No userId provided in request:", {
        body: req.body,
        params: req.params,
      });
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the doctor record to get doctorId for cleanup
    const doctor = await Doctor.findOne({ where: { userId } });

    if (doctor) {
      // Clean up doctor specializations first
      await DoctorSpecification.destroy({ where: { doctorId: doctor.id } });
    }

    // Update user status
    await User.update(
      { isDoctor: false, status: "rejected" },
      { where: { id: userId } }
    );

    // Remove doctor application
    await Doctor.destroy({ where: { userId } });

    // Create and send rejection notification
    await Notification.create({
      userId,
      content: `Rất tiếc, đơn đăng ký của bạn đã bị từ chối.`,
    });

    return res.status(200).json({
      success: true,
      message: "Application rejection notification sent",
    });
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error while rejecting application",
      error: error.message,
    });
  }
};

/**
 * Remove doctor status and clean up related records
 */
const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the doctor record first to get the doctorId
    const doctor = await Doctor.findOne({ where: { userId } });

    if (doctor) {
      // Delete doctor specializations, doctor record and appointments in parallel
      await Promise.all([
        DoctorSpecification.destroy({ where: { doctorId: doctor.id } }),
        Doctor.destroy({ where: { userId } }),
        Appointment.destroy({ where: { userId } }),
      ]);
    }

    // Update user record
    await User.update({ isDoctor: false }, { where: { id: userId } });

    return res.status(200).send("Doctor deleted successfully");
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).send("Unable to delete doctor");
  }
};

/**
 * Get top doctors with most booked appointments
 */
const getTopDoctors = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    // First, get appointment counts for all doctors
    const appointmentCounts = await Appointment.findAll({
      attributes: [
        "doctorId",
        [sequelize.fn("COUNT", sequelize.col("id")), "appointmentCount"],
      ],
      group: ["doctorId"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: parseInt(limit),
      raw: true,
    });

    if (appointmentCounts.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Get the doctor IDs and their counts
    const doctorIds = appointmentCounts.map((item) => item.doctorId);
    const countMap = {};
    appointmentCounts.forEach((item) => {
      countMap[item.doctorId] = parseInt(item.appointmentCount);
    });

    // Get full doctor details
    const topDoctors = await Doctor.findAll({
      where: {
        isDoctor: true,
        userId: { [Op.in]: doctorIds },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstname", "lastname", "email", "mobile", "pic"],
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] },
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    // Add appointment counts and format specializations
    const doctorsWithCounts = topDoctors.map((doctor) => {
      const doctorData = doctor.toJSON();

      // Format specializations for consistent frontend usage
      const specializationNames =
        doctorData.specializations && doctorData.specializations.length > 0
          ? doctorData.specializations.map((spec) => spec.name).join(", ")
          : doctorData.specialization || "Không xác định";

      return {
        ...doctorData,
        appointmentCount: countMap[doctor.userId] || 0,
        // Keep both for backward compatibility
        specialization: specializationNames,
        formattedSpecializations: specializationNames,
      };
    });

    // Sort by appointment count (descending)
    doctorsWithCounts.sort((a, b) => b.appointmentCount - a.appointmentCount);

    return res.status(200).json({
      success: true,
      data: doctorsWithCounts.slice(0, parseInt(limit)),
      count: doctorsWithCounts.length,
    });
  } catch (error) {
    console.error("Error fetching top doctors:", error);
    res.status(500).json({
      success: false,
      message: "Unable to get top doctors",
      error: error.message,
    });
  }
};

/**
 * Get detailed information about a specific doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getdoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Find doctor by user ID (since the ID in the URL is the user ID)
    const doctor = await Doctor.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] }, // Exclude password field
        },
        {
          model: Specification,
          as: "specializations",
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isDeleted: false },
          required: false,
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if doctor is approved
    if (!doctor.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor is not approved yet",
      });
    }

    // Format specializations
    const specializationNames = doctor.specializations && doctor.specializations.length > 0
      ? doctor.specializations.map(spec => spec.name).join(", ")
      : doctor.specialization || "Không xác định";

    // Structure the response data
    const doctorData = {
      id: doctor.id,
      userId: doctor.userId,
      user: doctor.user,
      specializations: doctor.specializations,
      specialization: specializationNames, // formatted specializations
      experience: doctor.experience,
      fees: doctor.fees,
      timing: doctor.timing || "Không xác định",
      isDoctor: doctor.isDoctor,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Doctor details retrieved successfully",
      data: doctorData,
    });

  } catch (error) {
    console.error("Error in getdoctor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get statistics for a specific doctor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Check if doctor exists (by user ID)
    const doctor = await Doctor.findOne({ where: { userId: id } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get total appointments for this doctor (using user ID as doctorId in appointments)
    const totalAppointments = await Appointment.count({
      where: { doctorId: id },
    });

    // Get completed appointments
    const completedAppointments = await Appointment.count({
      where: { 
        doctorId: id,
        status: "Completed" 
      },
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.count({
      where: {
        doctorId: id,
        status: "Pending",
      },
    });

    // Get confirmed appointments
    const confirmedAppointments = await Appointment.count({
      where: {
        doctorId: id,
        status: "Confirmed",
      },
    });

    // Get cancelled appointments
    const cancelledAppointments = await Appointment.count({
      where: {
        doctorId: id,
        status: "Cancelled",
      },
    });

    // Calculate average rating (mock calculation for now)
    const mockRating = Math.min(4.0 + (completedAppointments * 0.1), 5.0);
    const rating = Math.round(mockRating * 10) / 10; // Round to 1 decimal place

    // Get recent appointments for additional insights
    const recentAppointments = await Appointment.findAll({
      where: { doctorId: id },
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["firstname", "lastname"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["date", "startTime", "endTime", "status", "createdAt"],
    });

    // Calculate completion rate
    const completionRate = totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0;

    // Get appointments by month for the current year (for charts/analytics)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear + 1}-01-01`);

    const appointmentsByMonth = await Appointment.findAll({
      where: {
        doctorId: id,
        createdAt: {
          [Op.gte]: startOfYear,
          [Op.lt]: endOfYear,
        },
      },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    // Create monthly data array (12 months)
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const monthData = appointmentsByMonth.find(item => parseInt(item.month) === index + 1);
      return {
        month: index + 1,
        count: monthData ? parseInt(monthData.count) : 0,
      };
    });

    // Structure the response
    const statsData = {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      rating,
      completionRate,
      recentAppointments,
      monthlyAppointments: monthlyData,
      lastUpdated: new Date(),
    };

    return res.status(200).json({
      success: true,
      message: "Doctor statistics retrieved successfully",
      data: statsData,
    });

  } catch (error) {
    console.error("Error in getDoctorStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get doctor's appointment schedule for a specific date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Validate doctor ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    // Set default date range if not provided (next 7 days)
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Get appointments for the date range
    const appointments = await Appointment.findAll({
      where: {
        doctorId: id,
        date: {
          [Op.gte]: start.toISOString().split('T')[0],
          [Op.lte]: end.toISOString().split('T')[0],
        },
      },
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["firstname", "lastname", "email", "mobile"],
        },
      ],
      order: [["date", "ASC"], ["startTime", "ASC"]],
    });

    // Group appointments by date
    const scheduleByDate = appointments.reduce((acc, appointment) => {
      const date = appointment.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        patient: appointment.patient,
        createdAt: appointment.createdAt,
      });
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Doctor schedule retrieved successfully",
      data: {
        doctorId: id,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        schedule: scheduleByDate,
        totalAppointments: appointments.length,
      },
    });

  } catch (error) {
    console.error("Error in getDoctorSchedule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getalldoctors,
  getnotdoctors,
  deletedoctor,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
  searchDoctors,
  getTopDoctors,
  getdoctor,
  getDoctorStats,
  getDoctorSchedule
};
