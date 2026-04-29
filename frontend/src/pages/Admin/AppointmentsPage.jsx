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
  InputLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import CustomTable from "../../components/Utility/CustomTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "../../services/api.service";
import { useSearchParams } from "react-router-dom";

const statusColor = (status) => {
  if (status === "scheduled") return "success";
  if (status === "pending") return "warning";
  if (status === "completed") return "info";
  return "error";
};
const secondaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.3,
  py: 0.9,
  borderColor: "#60a5fa",
  color: "#1d4ed8",
  "&:hover": {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
};
const primaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.4,
  py: 1,
  background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
  "&:hover": {
    background: "linear-gradient(90deg, #0284c7 0%, #1d4ed8 100%)",
  },
};
const touchIconBtnSx = { width: 40, height: 40 };
const statusPillSx = {
  px: 1.5,
  py: 0.5,
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 0.8,
};

export default function AppointmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
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

  useEffect(() => {
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const status = searchParams.get("status") || "All";
    const mode = searchParams.get("mode") || "All";
    const doctorName = searchParams.get("doctorName") || "";
    const patientName = searchParams.get("patientName") || "";

    setFilters((prev) => ({
      ...prev,
      fromDate,
      toDate,
      status,
      mode,
      doctorName,
      patientName,
      page: 1,
    }));
  }, [searchParams]);

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
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.doctorName.trim()) count += 1;
    if (filters.patientName.trim()) count += 1;
    if (filters.status !== "All") count += 1;
    if (filters.mode !== "All") count += 1;
    if (filters.fromDate) count += 1;
    if (filters.toDate) count += 1;
    return count;
  }, [filters]);

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
          <IconButton color="primary" onClick={() => setSelected(row)} sx={touchIconBtnSx}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 1.8, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid #e8edf7",
        boxShadow: "0 8px 24px rgba(16, 24, 40, 0.06)",
        mb: 2,
      }}
    >
      <Typography variant="h5" mb={3}>
        Appointments
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2">Total: {pagination.total}</Typography>
        <Button
          variant="outlined"
          startIcon={<FilterListOutlinedIcon />}
          onClick={() => setFilterDialogOpen(true)}
          sx={{ ...secondaryActionBtnSx, px: 2 }}
        >
          {activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
        </Button>
      </Stack>
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

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2.2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
            <Box>
              <Typography sx={{ fontFamily: "Manrope", fontWeight: 700, fontSize: { xs: 22, sm: 28 } }}>
                Appointment Details
              </Typography>
              <Box
                sx={{
                  ...statusPillSx,
                  mt: 1,
                  bgcolor: selected?.status === "scheduled" ? "#dcfce7" : "#f1f5f9",
                  color: selected?.status === "scheduled" ? "#15803d" : "#334155",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: selected?.status === "scheduled" ? "#22c55e" : "#64748b",
                  }}
                />
                {(selected?.status || "").toUpperCase()}
              </Box>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
              <Button variant="outlined" onClick={() => setSelected(null)} sx={{ ...secondaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
                Close
              </Button>
              <Button variant="contained" sx={{ ...primaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
                Edit Appointment
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f8fafc", p: { xs: 1.5, sm: 2.5 } }}>
          {selected && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
                gap: 2,
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 2, p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2.2}>
                    <EventNoteOutlinedIcon sx={{ color: "#1d4ed8" }} />
                    <Typography sx={{ fontFamily: "Manrope", fontSize: 20, fontWeight: 600 }}>
                      Core Appointment Details
                    </Typography>
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Request ID</Typography>
                      <Typography sx={{ fontWeight: 700, wordBreak: "break-all" }}>{selected._id}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Reason For Visit</Typography>
                      <Typography>{selected.reason || "-"}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                      <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, mb: 1 }}>Schedule</Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <CalendarTodayOutlinedIcon sx={{ color: "#1d4ed8", fontSize: 18 }} />
                        <Typography sx={{ fontWeight: 700 }}>{selected.dateText}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ScheduleOutlinedIcon sx={{ color: "#1d4ed8", fontSize: 18 }} />
                        <Typography sx={{ color: "#334155", fontSize: 13 }}>{selected.timeText}</Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                      <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, mb: 1 }}>Visit Mode</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnOutlinedIcon sx={{ color: "#1d4ed8", fontSize: 18 }} />
                        <Typography sx={{ fontWeight: 700, textTransform: "capitalize" }}>{selected.mode || "-"}</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 2, p: { xs: 2, sm: 2.5 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <DescriptionOutlinedIcon sx={{ color: "#1d4ed8" }} />
                    <Typography sx={{ fontFamily: "Manrope", fontSize: 20, fontWeight: 600 }}>
                      Clinical Notes & Preparation
                    </Typography>
                  </Stack>
                  <Box sx={{ p: 1.8, bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 1.5 }}>
                    <Typography sx={{ color: "#1d4ed8", fontWeight: 700, fontSize: 13, mb: 0.7 }}>
                      Staff Instructions
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#334155" }}>
                      Ensure prior records and lab notes are ready before consultation.
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Box sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Patient Name
                  </Typography>
                  <Typography sx={{ fontFamily: "Manrope", fontSize: 22, fontWeight: 700, mb: 1.5 }}>
                    {selected.patientName}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Email Address
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: "#dbeafe", color: "#1d4ed8", display: "grid", placeItems: "center" }}>
                      <MailOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography sx={{ fontSize: 14, mb: 1.2, wordBreak: "break-all" }}>{selected.patientEmail}</Typography>
                  </Stack>
                </Box>

                <Box sx={{ bgcolor: "#0f172a", color: "#fff", borderRadius: 2, p: 2, transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 28px rgba(15,23,42,.35)" } }}>
                  <Typography sx={{ fontSize: 11, color: "#60a5fa", textTransform: "uppercase", fontWeight: 700, mb: 2 }}>
                    Clinical Assignment
                  </Typography>
                  <Box sx={{ mb: 1.8 }}>
                    <Typography sx={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                      Doctor
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MedicalServicesOutlinedIcon sx={{ color: "#60a5fa", fontSize: 18 }} />
                      <Typography sx={{ fontFamily: "Manrope", fontWeight: 700 }}>{selected.doctorName}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                      Facility
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DomainOutlinedIcon sx={{ color: "#60a5fa", fontSize: 18 }} />
                      <Typography sx={{ fontFamily: "Manrope", fontWeight: 700 }}>{selected.facilityName}</Typography>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobile}>
        <DialogTitle>Filter Appointments</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 1.5, mt: 1 }}>
          <TextField
            size="small"
            label="Doctor Name"
            value={filters.doctorName}
            onChange={(e) => setFilters((prev) => ({ ...prev, doctorName: e.target.value, page: 1 }))}
            fullWidth
          />
          <TextField
            size="small"
            label="Patient Name"
            value={filters.patientName}
            onChange={(e) => setFilters((prev) => ({ ...prev, patientName: e.target.value, page: 1 }))}
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
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
          <FormControl size="small" fullWidth>
            <InputLabel>Mode</InputLabel>
            <Select
              label="Mode"
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
            fullWidth
          />
          <TextField
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={filters.toDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value, page: 1 }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1, p: 2 }}>
          <Button variant="outlined" onClick={() => setFilterDialogOpen(false)} sx={{ ...secondaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                doctorName: "",
                patientName: "",
                status: "All",
                mode: "All",
                fromDate: "",
                toDate: "",
                page: 1,
              }));
            }}
            sx={{ ...secondaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => setFilterDialogOpen(false)}
            sx={{ ...primaryActionBtnSx, width: { xs: "100%", sm: "auto" } }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
