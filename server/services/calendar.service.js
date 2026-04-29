const { JWT } = require("google-auth-library");

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

const getRequiredEnv = (key) => process.env[key] && String(process.env[key]).trim();

const isCalendarSyncEnabled = () =>
  String(process.env.GOOGLE_CALENDAR_SYNC_ENABLED || "").toLowerCase() === "true";

const parseAppointmentDateTime = (appointmentDate, time) => {
  const dateObj = new Date(appointmentDate);
  const dateOnly = dateObj.toISOString().slice(0, 10);
  return new Date(`${dateOnly}T${time}:00`);
};

const buildEventPayload = (appointment) => {
  const start = parseAppointmentDateTime(appointment.date, appointment.timeSlot.start);
  const end = parseAppointmentDateTime(appointment.date, appointment.timeSlot.end);
  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || "Asia/Kolkata";

  return {
    summary: `Medico Appointment - ${appointment.reason || "Consultation"}`,
    description: [
      `Doctor: ${appointment.doctorId?.username || "-"}`,
      `Patient: ${appointment.userId?.username || "-"}`,
      `Facility: ${appointment.facilityId?.name || "-"}`,
      `Mode: ${appointment.mode || "-"}`,
      `Reason: ${appointment.reason || "-"}`,
    ].join("\n"),
    start: {
      dateTime: start.toISOString(),
      timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone,
    },
    attendees: [
      appointment.doctorId?.email ? { email: appointment.doctorId.email } : null,
      appointment.userId?.email ? { email: appointment.userId.email } : null,
    ].filter(Boolean),
  };
};

const createCalendarEvent = async (appointment) => {
  if (!isCalendarSyncEnabled()) {
    return { ok: false, reason: "disabled" };
  }

  const calendarId = getRequiredEnv("GOOGLE_CALENDAR_ID");
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  if (!calendarId || !clientEmail || !privateKeyRaw) {
    return { ok: false, reason: "missing_credentials" };
  }

  const client = new JWT({
    email: clientEmail,
    key: privateKeyRaw.replace(/\\n/g, "\n"),
    scopes: [CALENDAR_SCOPE],
  });

  const token = await client.getAccessToken();
  if (!token?.token) {
    return { ok: false, reason: "token_unavailable" };
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEventPayload(appointment)),
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      reason: payload?.error?.message || "calendar_create_failed",
    };
  }

  return {
    ok: true,
    eventId: payload.id,
    eventLink: payload.htmlLink,
  };
};

module.exports = {
  createCalendarEvent,
};
