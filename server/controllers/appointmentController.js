const { User, Appointment, Notification } = require("../models");

/**
 * Get all appointments for a specific user or doctor
 * @param {Object} req - Request with user ID
 * @param {Object} res - Response object
 */
const getallappointments = async (req, res) => {
  try {
    // Find the current user
    const user = await User.findByPk(req.locals);

    // If user not found
    if (!user) {
      return res.status(404).send("User not found");
    }

    let appointments;

    // If user is Admin, get ALL appointments
    if (user.dataValues.role === "Admin") {
      appointments = await Appointment.findAll({
        include: [
          {
            model: User,
            as: "patient",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
          {
            model: User,
            as: "doctor",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else if (user.dataValues.role === "Doctor" || user.isDoctor === true) {
      // If user is a doctor, get appointments where doctorId matches user's ID
      appointments = await Appointment.findAll({
        where: { doctorId: req.locals },
        include: [
          {
            model: User,
            as: "patient",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
          {
            model: User,
            as: "doctor",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // If user is a patient, get appointments where userId matches user's ID
      appointments = await Appointment.findAll({
        where: { userId: req.locals },
        include: [
          {
            model: User,
            as: "doctor",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
          {
            model: User,
            as: "patient",
            attributes: ["firstname", "lastname", "email", "mobile", "pic"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    return res.status(200).send(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Unable to get appointments");
  }
};

/**
 * Book a new appointment and send notifications
 * @param {Object} req - Request with appointment details
 * @param {Object} res - Response object
 */
const bookappointment = async (req, res) => {
  try {
    // Find the user and doctor
    const user = await User.findByPk(req.locals);
    const doctor = await User.findByPk(req.body.doctorId);

    if (!user || !doctor) {
      return res.status(404).send("User or doctor not found");
    }

    // Parse time range if provided, otherwise use individual start/end times
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let timeRange = req.body.time;

    // If time range is provided but not individual times, parse it
    if (timeRange && (!startTime || !endTime)) {
      const [parsedStartTime, parsedEndTime] = timeRange.split(' - ');
      startTime = parsedStartTime;
      endTime = parsedEndTime;
    }

    // If individual times are provided but not time range, create it
    if (startTime && endTime && !timeRange) {
      timeRange = `${startTime} - ${endTime}`;
    }

    // Validate that we have both start and end times
    if (!startTime || !endTime) {
      return res.status(400).send("Start time and end time are required");
    }

    // Create the appointment
    const appointment = await Appointment.create({
      userId: req.locals,
      doctorId: req.body.doctorId,
      date: req.body.date,
      startTime: startTime,
      endTime: endTime,
      time: timeRange, // Store the formatted time range for display
      age: req.body.age || user.age,
      email: req.body.email || user.email,
      gender: req.body.gender || user.gender,
      bloodGroup: req.body.bloodGroup || user.bloodGroup,
      number: req.body.number || user.mobile,
      familyDiseases: req.body.familyDiseases || "",
      status: "Pending",
    });

    // Create notifications in parallel
    await Promise.all([
      // Notification for doctor
      Notification.create({
        userId: req.body.doctorId,
        content: `Cuộc hẹn của bạn với ${user.firstname} ${user.lastname} vào ngày ${req.body.date} từ ${startTime} đến ${endTime}. Chi tiết bệnh nhân - Tuổi: ${req.body.age || user.age}, Nhóm máu: ${req.body.bloodGroup || user.bloodGroup || 'Không xác định'}, Giới tính: ${req.body.gender || user.gender}, Số điện thoại: ${req.body.number || user.mobile}, Tiền sử bệnh lý: ${req.body.familyDiseases || 'Không'}`,
      }),

      // Notification for patient
      Notification.create({
        userId: req.locals,
        content: `Cuộc hẹn của bạn với Bác sĩ ${req.body.doctorname} đã được lên lịch vào ngày ${req.body.date} từ ${startTime} đến ${endTime}`,
      }),
    ]);

    return res.status(201).send(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send("Unable to book appointment");
  }
};

/**
 * Mark an appointment as completed and notify participants
 * @param {Object} req - Request with appointment details
 * @param {Object} res - Response object
 */
const completed = async (req, res) => {
  try {
    // Update appointment status to completed
    await Appointment.update(
      { status: "Completed" },
      { where: { id: req.body.appointid } }
    );

    // Get user data for notification
    const user = await User.findByPk(req.locals);

    // Create notifications in parallel
    await Promise.all([
      // Create notification for the user
      Notification.create({
        userId: req.locals,
        content: `Your appointment with ${req.body.doctorname} has been completed`,
      }),

      // Create notification for the doctor
      Notification.create({
        userId: req.body.doctorId,
        content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
      }),
    ]);

    return res.status(201).send("Appointment completed");
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).send("Unable to complete appointment");
  }
};

module.exports = {
  getallappointments,
  bookappointment,
  completed,
};