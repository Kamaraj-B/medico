import StatusTracker from "../Utility/StatusTracker";
import { CalendarMonth } from "@mui/icons-material";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Link,
} from "@mui/material";
import { useMemo } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { useDispatch } from "react-redux";
import { updateAppointmentStatus } from "../../store/slices/appointmentSlice";

const steps = ["pending", "scheduled", "completed", "rejected", "cancelled"];

function stepsBasedOnCurrentStatus(currentStatus) {
  if (currentStatus === "completed") {
    return ["pending", "scheduled", "completed"];
  }

  if (currentStatus === "rejected") {
    return ["pending", "scheduled", "rejected"];
  }

  if (currentStatus === "cancelled") {
    return ["pending", "scheduled", "cancelled"];
  }

  // Default for "pending" or "scheduled"
  return ["pending", "scheduled"];
}

// ⏳ Utility to format time remaining
const getTimeRemaining = (startDateTime) => {
  const now = new Date();
  const diffMs = new Date(startDateTime) - now;

  if (diffMs <= 0) return "Started";

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHrs % 24}h`;
  } else {
    return `${diffHrs}h ${diffMinutes}m`;
  }
};

const statusColor = (status) => {
  if (status === "pending") return "warning";
  if (status === "scheduled") return "success";
  if (status === "completed") return "info";
  return "error";
};

const AppointmentDetails = ({ booking, setSelected }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("tokenInfo");
  const role = token ? JSON.parse(token)?.role : null;
  const calendar = booking?.calendar || {};
  if (!booking) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await dispatch(
        updateAppointmentStatus({ id: booking._id, status: newStatus })
      ).unwrap();
      setSelected(updated);
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const startDateTime = `${booking.date.split("T")[0]}T${
    booking.timeSlot.start
  }:00`;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timeRemaining = useMemo(
    () => getTimeRemaining(startDateTime),
    [startDateTime]
  );

  return (
    <Card sx={{ p: 2 }}>
       <span style={{ display: "flex", justifyContent: "flex-end",  margin: "10px", cursor: "pointer" }} onClick={() => setSelected(null)}>
<CloseIcon/>
          </span>
      <CardMedia
        component="img"
        height="150"
        image={
          booking.image ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA21M8XAvfYNGN5Afl_6laMk2UPCkvHFlYOkyqUOJCM5VNubxQFmLmn5QmXNOHqPh1wZyMcwVIXjlWRToQzDw_v5bJ-37wrIAV22zqo6Hdk6hKAjM3CjyZ7bYujigdC24pFp7p7jXBlmRtVY7c8yR_sXXBmoe9Mh2RlMNNgR1nUJi7Ntn_dzZ0CxlMbfOLd807Cexl4jDni33cfSnOZfu1mO-czEV02apIBq07R-rGsveKPOkwLv3cQeP7H3RM6XQyV0A3NWWzMwWIH"
        }
        alt={booking.place}
        sx={{ borderRadius: 2 }}
      />
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" noWrap>
            {booking.facilityId.name}
          </Typography>

          {/* Calendar metadata + Time Remaining */}
          {booking.status === "scheduled" && (
            <Box display="flex" alignItems="center" gap={1}>
              {calendar.eventLink ? (
                <Tooltip title="Open scheduled calendar event">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => window.open(calendar.eventLink, "_blank")}
                  >
                    <CalendarMonth />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Chip
                label={timeRemaining}
                color={timeRemaining === "Started" ? "error" : "success"}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          )}
        </Box>

        <Typography variant="subtitle1" noWrap>
          Attended By: {booking.doctorId.username}
        </Typography>
        <Typography variant="subtitle2" noWrap>
          When: {booking.date.split("T")[0]} | Time: {booking.timeSlot.start} -{" "}
          {booking.timeSlot.end}
        </Typography>
        <Box mt={1}>
          <Chip label={booking.status} color={statusColor(booking.status)} size="small" />
        </Box>

        {role === "doctor" && (
          <Box mt={2} display="flex" gap={1}>
            {booking.status === "pending" && (
              <>
                <Tooltip title="Accept request">
                  <IconButton color="success" onClick={() => handleStatusChange("scheduled")}>
                    <CheckCircleOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject request">
                  <IconButton color="error" onClick={() => handleStatusChange("rejected")}>
                    <CancelRoundedIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {booking.status === "scheduled" && (
              <>
                <Tooltip title="Mark as completed">
                  <IconButton color="success" onClick={() => handleStatusChange("completed")}>
                    <CheckCircleOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel appointment">
                  <IconButton color="warning" onClick={() => handleStatusChange("cancelled")}>
                    <ErrorOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}

        <Box mt={2}>
          <StatusTracker
            steps={stepsBasedOnCurrentStatus(booking.status)}
            activeStep={steps.indexOf(booking.status)}
          />
        </Box>
        {booking.status === "scheduled" && calendar.syncStatus === "synced" && calendar.eventLink ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Calendar event is created.{" "}
            <Link href={calendar.eventLink} target="_blank" rel="noreferrer">
              Open event
            </Link>
          </Alert>
        ) : null}
        {booking.status === "scheduled" && calendar.syncStatus === "failed" ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Calendar sync failed: {calendar.syncError || "Unknown error"}
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AppointmentDetails;
