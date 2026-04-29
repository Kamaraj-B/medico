import {
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Tooltip,
  IconButton,
  TextField,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CustomTable from "../../components/Utility/CustomTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "../../services/api.service";

const statusColor = (status) => {
  if (status === "scheduled") return "success";
  if (status === "pending") return "warning";
  if (status === "completed") return "info";
  return "error";
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    doctorName: "",
    patientName: "",
    status: "All",
    mode: "All",
    fromDate: "",
    toDate: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const loadAppointments = useCallback(async () => {
    try {
      const query = {};
      if (filters.doctorName) query.doctorName = filters.doctorName;
      if (filters.patientName) query.patientName = filters.patientName;
      if (filters.status && filters.status !== "All") query.status = filters.status;
      if (filters.mode && filters.mode !== "All") query.mode = filters.mode;
      if (filters.fromDate) query.fromDate = filters.fromDate;
      if (filters.toDate) query.toDate = filters.toDate;
      query.page = filters.page;
      query.limit = filters.limit;

      const response = await apiService.get("/appointments", { params: query });
      setAppointments(response.data?.items || []);
      setPagination({
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        total: response.data?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load admin appointments:", error);
      setAppointments([]);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const rows = useMemo(
    () =>
      appointments.map((appointment) => ({
        ...appointment,
        patientName: appointment.userId?.username || "-",
        patientEmail: appointment.userId?.email || "-",
        doctorName: appointment.doctorId?.username || "-",
        facilityName: appointment.facilityId?.name || "-",
        dateText: new Date(appointment.date).toLocaleDateString(),
        timeText: `${appointment.timeSlot?.start || "-"} - ${appointment.timeSlot?.end || "-"}`,
      })),
    [appointments]
  );

  const columns = [
    { id: "_id", label: "Request ID" },
    { id: "patientName", label: "Patient" },
    { id: "patientEmail", label: "Email" },
    { id: "doctorName", label: "Doctor" },
    { id: "facilityName", label: "Facility" },
    { id: "dateText", label: "Date" },
    { id: "timeText", label: "Time" },
    {
      id: "status",
      label: "Status",
      render: (value) => <Chip label={value} color={statusColor(value)} size="small" />,
    },
    {
      id: "actions",
      label: "Actions",
      render: (_, row) => (
        <Tooltip title="View full details">
          <IconButton color="primary" onClick={() => setSelected(row)}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", px: 4, py: 2, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      <Typography variant="h5" mb={3}>
        Appointments
      </Typography>
      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Doctor Name"
          value={filters.doctorName}
          onChange={(e) => setFilters((prev) => ({ ...prev, doctorName: e.target.value, page: 1 }))}
        />
        <TextField
          size="small"
          label="Patient Name"
          value={filters.patientName}
          onChange={(e) => setFilters((prev) => ({ ...prev, patientName: e.target.value, page: 1 }))}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="pending">pending</MenuItem>
            <MenuItem value="scheduled">scheduled</MenuItem>
            <MenuItem value="completed">completed</MenuItem>
            <MenuItem value="rejected">rejected</MenuItem>
            <MenuItem value="cancelled">cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={filters.mode}
            onChange={(e) => setFilters((prev) => ({ ...prev, mode: e.target.value, page: 1 }))}
          >
            <MenuItem value="All">All Modes</MenuItem>
            <MenuItem value="in-person">in-person</MenuItem>
            <MenuItem value="video">video</MenuItem>
            <MenuItem value="chat">chat</MenuItem>
            <MenuItem value="audio">audio</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={filters.fromDate}
          onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value, page: 1 }))}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={filters.toDate}
          onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value, page: 1 }))}
        />
      </Stack>
      <Typography variant="body2" mb={1}>
        Total: {pagination.total}
      </Typography>
      <CustomTable data={rows} columns={columns} />
      <Stack direction="row" justifyContent="flex-end" mt={2} spacing={1}>
        <Button
          disabled={pagination.page <= 1}
          onClick={() =>
            setFilters((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }))
          }
        >
          Prev
        </Button>
        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          Page {pagination.page} / {pagination.totalPages}
        </Typography>
        <Button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              page: Math.min((prev.page || 1) + 1, pagination.totalPages),
            }))
          }
        >
          Next
        </Button>
      </Stack>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={1.2}>
              <Typography><b>Request ID:</b> {selected._id}</Typography>
              <Typography><b>Patient:</b> {selected.patientName}</Typography>
              <Typography><b>Patient Email:</b> {selected.patientEmail}</Typography>
              <Typography><b>Doctor:</b> {selected.doctorName}</Typography>
              <Typography><b>Facility:</b> {selected.facilityName}</Typography>
              <Typography><b>Reason:</b> {selected.reason || "-"}</Typography>
              <Typography><b>Mode:</b> {selected.mode || "-"}</Typography>
              <Typography><b>Date:</b> {selected.dateText}</Typography>
              <Typography><b>Time:</b> {selected.timeText}</Typography>
              <Typography>
                <b>Status:</b>{" "}
                <Chip label={selected.status} color={statusColor(selected.status)} size="small" />
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
