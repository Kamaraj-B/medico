require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Facility = require('../models/facility.model');
const sendEmail = require('../config/sendMail');
const emailTemplate = require('../utils/mailTemplate');
const { createCalendarEvent } = require("../services/calendar.service");

const statusTitleMap = {
  scheduled: "Appointment Accepted",
  completed: "Appointment Completed",
  cancelled: "Appointment Cancelled",
};

const buildStatusMessage = (status, appointment) => {
  if (status === "scheduled") {
    return `
      <p>Your appointment has been <b>accepted</b>.</p>
      <p><b>Date:</b> ${new Date(appointment.date).toLocaleDateString()}<br>
      <b>Time:</b> ${appointment.timeSlot?.start} - ${appointment.timeSlot?.end}<br>
      <b>Mode:</b> ${appointment.mode}</p>
    `;
  }
  if (status === "completed") {
    return `
      <p>Your appointment has been marked as <b>completed</b>.</p>
      <p>We hope your consultation went well.</p>
    `;
  }
  return `
    <p>Your appointment has been <b>cancelled</b>.</p>
    <p>Please book a new slot if needed.</p>
  `;
};

const STATUS_TRANSITIONS = {
  pending: ["scheduled", "rejected"],
  scheduled: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};

const canTransitionStatus = (fromStatus, toStatus) =>
  Boolean(STATUS_TRANSITIONS[fromStatus]?.includes(toStatus));

exports.getAdminSummary = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const allowedDays = new Set([7, 30, 90]);
    const requestedDays = Number(req.query.days || 30);
    const days = allowedDays.has(requestedDays) ? requestedDays : 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const appointmentDateFilter = { createdAt: { $gte: fromDate } };

    const [appointmentCount, facilityCount, userCount, doctorCount] = await Promise.all([
      Appointment.countDocuments(appointmentDateFilter),
      Facility.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "doctor" }),
    ]);

    const [statusBreakdownRaw, modeBreakdownRaw, monthlyRaw, facilityStatusRaw] = await Promise.all([
      Appointment.aggregate([
        { $match: appointmentDateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: appointmentDateFilter },
        { $group: { _id: "$mode", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: appointmentDateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Facility.aggregate([
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const statusBreakdown = statusBreakdownRaw.reduce((acc, row) => {
      acc[row._id || "unknown"] = row.count;
      return acc;
    }, {});

    const modeBreakdown = modeBreakdownRaw.reduce((acc, row) => {
      acc[row._id || "unknown"] = row.count;
      return acc;
    }, {});

    const facilityStatusBreakdown = facilityStatusRaw.reduce((acc, row) => {
      acc[row._id || "unknown"] = row.count;
      return acc;
    }, {});

    const monthlyAppointments = monthlyRaw.map((row) => ({
      label: `${row._id.year}-${String(row._id.month).padStart(2, "0")}`,
      count: row.count,
    }));

    return res.json({
      counts: {
        appointments: appointmentCount,
        facilities: facilityCount,
        doctors: doctorCount,
        users: userCount,
      },
      days,
      statusBreakdown,
      modeBreakdown,
      facilityStatusBreakdown,
      monthlyAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, facilityId, reason, date, timeSlot, mode } = req.body;

    // Validate request body
    if (!doctorId || !facilityId || !reason || !date || !timeSlot || !mode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create appointment object
    const newAppointment = {
      ...req.body,
      userId: req.user.id,
      status: 'pending',
      calendar: {
        syncStatus: "not_applicable",
      },
    };
    const appointment = new Appointment(newAppointment);
    // Save booking first so network/email failures do not block user flow.
    const savedAppointment = await appointment.save();

    // Get user and doctor details
    const doctor = await User.findById(doctorId).select('username email');
    const user = await User.findById(req.user.id).select('username email');

    // Send confirmation email to user
    const userHtml = emailTemplate.appointmentCardTemplate(
      'Appointment Confirmation',
      `
        <p>Hello <b>${user.username}</b>,</p>
        <p>Your appointment request for <b>${reason}</b> has been received.</p>
        <p>We will notify you once it is confirmed.</p>
      `,
      'Track Appointment',
      `${process.env.FRONTEND_URL}/appointments`
    );

    try {
      if (user?.email) {
        await sendEmail(user.email, 'Appointment Confirmation', '', userHtml);
      }
    } catch (mailError) {
      console.warn('User confirmation email failed:', mailError.message);
    }

    // Send confirmation email to doctor
    const doctorHtml = emailTemplate.appointmentCardTemplate(
      'New Appointment Request',
      `
        <p>Hello Dr. <b>${doctor.username}</b>,</p>
        <p>You have a new appointment from <b>${user.username}</b>.</p>
        <p><b>Date:</b> ${date}<br>
        <b>Time:</b> ${timeSlot.start} - ${timeSlot.end} <br>
        <b>Reason:</b> ${reason}<br>
        <b>Mode:</b> ${mode}</p>
      `
    );

    try {
      if (doctor?.email) {
        await sendEmail(doctor.email, 'New Appointment', '', doctorHtml);
      }
    } catch (mailError) {
      console.warn('Doctor notification email failed:', mailError.message);
    }

    res.status(201).json(savedAppointment);

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

/** Time slots already held for a doctor at a facility on a calendar day (for booking UI). */
exports.getBookedSlots = async (req, res) => {
  try {
    const { doctorId, facilityId, date } = req.query;
    if (!doctorId || !facilityId || !date) {
      return res.status(400).json({ message: 'doctorId, facilityId, and date (YYYY-MM-DD) are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(facilityId)) {
      return res.status(400).json({ message: 'Invalid doctorId or facilityId' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date).trim())) {
      return res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    }

    const dayStart = new Date(`${String(date).trim()}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const rows = await Appointment.find({
      doctorId,
      facilityId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $in: ['pending', 'scheduled'] },
    })
      .select('timeSlot')
      .lean();

    const slots = rows
      .map((a) => ({
        start: a.timeSlot?.start,
        end: a.timeSlot?.end,
      }))
      .filter((s) => s.start && s.end);

    return res.json({ slots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  const {
    facility,
    fromDate,
    toDate,
    userName, // backward compatibility
    doctorName,
    patientName,
    status,
    mode,
    page,
    limit,
  } = req.query;
  const filter = {};
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (pageNumber - 1) * pageLimit;

  try {
    // --- Role-based filter ---
    if (req.user.role === "admin") {
      // Admin can view all appointments
      if (doctorName) {
        const doctors = await User.find(
          { username: new RegExp(doctorName, "i"), role: "doctor" },
          "_id"
        );
        filter.doctorId = { $in: doctors.map((u) => u._id) };
      }
      if (patientName) {
        const patients = await User.find(
          { username: new RegExp(patientName, "i") },
          "_id"
        );
        filter.userId = { $in: patients.map((u) => u._id) };
      }
      if (userName && !doctorName && !patientName) {
        const users = await User.find({ username: new RegExp(userName, "i") }, "_id");
        const ids = users.map((u) => u._id);
        filter.$or = [{ userId: { $in: ids } }, { doctorId: { $in: ids } }];
      }
    } else if (req.user.role === "doctor") {
      filter.doctorId = req.user.id;

      // If doctor searches by patient's username
      const patientQuery = patientName || userName;
      if (patientQuery) {
        const patients = await User.find(
          { username: new RegExp(patientQuery, "i") },
          "_id"
        );
        filter.userId = { $in: patients.map((u) => u._id) };
      }
    } else {
      // role = user
      filter.userId = req.user.id;

      // If user searches by doctor's username
      const doctorQuery = doctorName || userName;
      if (doctorQuery) {
        const doctors = await User.find(
          { username: new RegExp(doctorQuery, "i") },
          "_id"
        );
        filter.doctorId = { $in: doctors.map((d) => d._id) };
      }
    }

    // --- Optional filters ---
    if (fromDate) filter.date = { ...filter.date, $gte: new Date(fromDate) };
    if (toDate) filter.date = { ...filter.date, $lte: new Date(toDate) };
    if (status) filter.status = status;
    if (mode) filter.mode = mode;

    if (facility && facility !== "All") {
      const facilities = await Facility.find(
        { name: new RegExp(facility, "i") },
        "_id"
      );
      filter.facilityId = { $in: facilities.map((f) => f._id) };
    }

    // --- Query ---
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate("doctorId", "username email")
      .populate("userId", "username email")
      .populate("facilityId", "name location")
      .limit(pageLimit)
      .skip(skip),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      items: appointments,
      page: pageNumber,
      limit: pageLimit,
      total,
      totalPages: Math.max(Math.ceil(total / pageLimit), 1),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'username email')
      .populate('userId', 'username email')
      .populate('facilityId', 'name location');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment by ID
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    const previousStatus = appointment.status;

    // Role guard: doctors can only update their own appointment requests.
    if (req.user.role === "doctor" && String(appointment.doctorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Normal users can only update their own appointment records.
    if (req.user.role === "user" && String(appointment.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "user" && req.body?.status) {
      return res.status(403).json({ message: "Users cannot update appointment status" });
    }

    if (req.body?.status) {
      if (!canTransitionStatus(appointment.status, req.body.status)) {
        return res.status(400).json({
          message: `Invalid status transition: ${appointment.status} -> ${req.body.status}`,
        });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("doctorId", "username email")
      .populate("userId", "username email")
      .populate("facilityId", "name");

    if (updatedAppointment?.status !== previousStatus && updatedAppointment?.status === "scheduled") {
      // Calendar sync failure should never block appointment status updates.
      try {
        const calendarResult = await createCalendarEvent(updatedAppointment);
        const calendarUpdate = calendarResult.ok
          ? {
              "calendar.eventId": calendarResult.eventId,
              "calendar.eventLink": calendarResult.eventLink,
              "calendar.syncStatus": "synced",
              "calendar.syncError": "",
            }
          : {
              "calendar.syncStatus":
                calendarResult.reason === "disabled" ? "not_applicable" : "failed",
              "calendar.syncError": calendarResult.reason || "",
            };

        await Appointment.findByIdAndUpdate(updatedAppointment._id, { $set: calendarUpdate });

        updatedAppointment.calendar = {
          ...(updatedAppointment.calendar || {}),
          eventId: calendarResult.ok ? calendarResult.eventId : "",
          eventLink: calendarResult.ok ? calendarResult.eventLink : "",
          syncStatus: calendarResult.ok
            ? "synced"
            : calendarResult.reason === "disabled"
            ? "not_applicable"
            : "failed",
          syncError: calendarResult.ok ? "" : calendarResult.reason || "",
        };
      } catch (calendarError) {
        console.warn("Calendar sync failed:", calendarError.message);
        await Appointment.findByIdAndUpdate(updatedAppointment._id, {
          $set: {
            "calendar.syncStatus": "failed",
            "calendar.syncError": calendarError.message,
          },
        });
        updatedAppointment.calendar = {
          ...(updatedAppointment.calendar || {}),
          syncStatus: "failed",
          syncError: calendarError.message,
        };
      }
    }

    // Notify patient on key status transitions
    if (
      updatedAppointment?.status !== previousStatus &&
      ["scheduled", "completed", "cancelled"].includes(updatedAppointment?.status)
    ) {
      const subject = statusTitleMap[updatedAppointment.status];
      const html = emailTemplate.appointmentCardTemplate(
        subject,
        `
          <p>Hello <b>${updatedAppointment.userId?.username || "User"}</b>,</p>
          ${buildStatusMessage(updatedAppointment.status, updatedAppointment)}
          <p><b>Doctor:</b> ${updatedAppointment.doctorId?.username || "-"}<br>
          <b>Facility:</b> ${updatedAppointment.facilityId?.name || "-"}</p>
        `,
        "View Appointments",
        `${process.env.FRONTEND_URL}/appointments`
      );

      try {
        if (updatedAppointment.userId?.email) {
          await sendEmail(updatedAppointment.userId.email, subject, "", html);
        }
      } catch (mailError) {
        console.warn("Appointment status email failed:", mailError.message);
      }
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete appointment by ID
exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
