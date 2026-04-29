
import CustomTable from "../Utility/CustomTable";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Box, Typography, Chip, Stack, Tooltip, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect } from "react"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments, updateAppointmentStatus } from "../../store/slices/appointmentSlice";
import { useMemo } from "react";


const transformAppointments = (appointments) => {
  return appointments.map((item, index) => ({
    row: index + 1,
    _id: item._id,
    username: item.userId?.username || "N/A",
    reason: item.reason,
    mode: item.mode,
    date: new Date(item.date).toLocaleDateString(),
    time: `${item.timeSlot.start} - ${item.timeSlot.end}`,
    status: item.status,
  }));
};

export default function AppointmentRequests() {
  const dispatch = useDispatch();
  const { list: rows } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchAppointments({ query: { page: 1, limit: 20 } }));
  }, [dispatch]);

  const transformedRows = useMemo(() => transformAppointments(rows), [rows]);

  const handleStatusChange = async (id, newStatus) => {
   dispatch(updateAppointmentStatus({ id, status: newStatus }));
  };

  const columns = [
    { id: "row", label: "No" },
    { id: "_id", label: "Request ID" },
    { id: "username", label: "User Name" },
    { id: "reason", label: "Reason" },
    { id: "mode", label: "Mode" },
    { id: "date", label: "Date" },
    { id: "time", label: "Time Slot" },
    {
      id: "status",
      label: "Status",
      render: (value) => {
        let color = "default";
        if (value === "pending") color = "warning";
        if (value === "scheduled") color = "success";
        if (value === "rejected") color = "error";

        return <Chip label={value} color={color} />;
      },
    },
    {
      id: "actions",
      label: "Actions",
      render: (_, row) => {
        return (
          <Stack direction="row" spacing={1}>
            {row.status === "pending" && (
              <>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Accept request">
                    <IconButton color="success" onClick={() => handleStatusChange(row._id, "scheduled")}>
                      <CheckCircleOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject request">
                    <IconButton color="error" onClick={() => handleStatusChange(row._id, "rejected")}>
                      <CancelRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </>
            )}

            {row.status === "scheduled" && (
              <>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Mark as completed">
                    <IconButton color="success" onClick={() => handleStatusChange(row._id, "completed")}>
                      <CheckCircleOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel appointment">
                    <IconButton color="warning" onClick={() => handleStatusChange(row._id, "cancelled")}>
                      <ErrorOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </>
            )}
             {(row.status === "completed" || row.status === "cancelled" || row.status === "rejected" ) && (
              <>
               
              </>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h4"
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Appointment Requests
        </Typography>
      </Box>

      <CustomTable data={transformedRows} columns={columns} />
    </Box>
  );
}
