import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Divider,
  Fab,
  FormControl,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import apiService from "../../services/api.service";
import { useNavigate } from "react-router-dom";

const summaryCards = [
  {
    key: "appointments",
    label: "Total Appointments",
    icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} />,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    badge: "12%",
    badgeColor: "#059669",
  },
  {
    key: "facilities",
    label: "Total Facilities",
    icon: <DomainOutlinedIcon sx={{ fontSize: 22 }} />,
    iconBg: "#f5f3ff",
    iconColor: "#9333ea",
    badge: "Stable",
    badgeColor: "#64748b",
  },
  {
    key: "doctors",
    label: "Total Doctors",
    icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 22 }} />,
    iconBg: "#ecfeff",
    iconColor: "#0f766e",
    badge: "New",
    badgeColor: "#059669",
  },
  {
    key: "users",
    label: "Total Users",
    icon: <GroupOutlinedIcon sx={{ fontSize: 22 }} />,
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    badge: "4%",
    badgeColor: "#e11d48",
  },
];

const containerCardSx = {
  bgcolor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 88, 190, 0.04)",
  p: 3,
};
const FALLBACK_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REFERENCE_BAR_HEIGHTS = [40, 55, 70, 85, 60, 95];
const primaryActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.6,
  py: 1,
  background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
  "&:hover": {
    background: "linear-gradient(90deg, #0284c7 0%, #1d4ed8 100%)",
  },
};
const outlinedActionBtnSx = {
  textTransform: "none",
  fontFamily: "Manrope",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 999,
  px: 2.4,
  py: 1,
  borderColor: "#60a5fa",
  color: "#1d4ed8",
  "&:hover": {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
};

const MonthlyChart = ({ data, height = 430 }) => {
  const visibleData = useMemo(() => {
    if (!data?.length) {
      return FALLBACK_MONTHS.map((label, idx) => ({ label, count: idx + 1 }));
    }
    return data.slice(-6).map((item, idx) => ({
      label: FALLBACK_MONTHS[idx] || item.label,
      count: item.count,
    }));
  }, [data]);

  return (
    <Box sx={{ ...containerCardSx, height }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography sx={{ fontFamily: "Manrope", fontSize: 30, fontWeight: 600 }}>
          Appointments Trend (Monthly)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" sx={{ textTransform: "none", bgcolor: "#f1f5f9", color: "#334155", minWidth: 58 }}>
            Line
          </Button>
          <Button size="small" variant="outlined" sx={{ textTransform: "none", borderColor: "#e2e8f0", color: "#94a3b8", minWidth: 52 }}>
            Bar
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ height: 300, borderBottom: "1px solid #e2e8f0", borderLeft: "1px solid #e2e8f0", px: 2, pb: 1, position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: "auto" }}>
        {[0,1,2,3].map((i)=>(
          <Box key={i} sx={{ position:"absolute", left:0, right:0, bottom:`${(i+1)*25}%`, borderTop:"1px solid rgba(148,163,184,.25)"}}/>
        ))}
        {visibleData.length ? visibleData.map((item, idx) => (
          <Box
            key={item.label}
            sx={{
              width: 48,
              bgcolor:
                idx === 4
                  ? "#0f5dbd"
                  : idx === 5
                  ? "#2170e4"
                  : idx >= 2
                  ? idx === 3
                    ? "#8fb0df"
                    : "#b8cde8"
                  : "#f1f5f9",
              borderRadius: "8px 8px 0 0",
              height: `${(REFERENCE_BAR_HEIGHTS[idx] / 100) * 260}px`,
            }}
          />
        )) : null}
      </Box>
      <Stack direction="row" justifyContent="space-between" mt={1.5} px={1}>
        {visibleData.map((item) => (
          <Typography key={item.label} sx={{ fontSize: 12, color: "#7c839b" }}>
            {item.label}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState({
    counts: { appointments: 0, facilities: 0, doctors: 0, users: 0 },
    statusBreakdown: {},
    modeBreakdown: {},
    facilityStatusBreakdown: {},
    monthlyAppointments: [],
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await apiService.get("/appointments/admin/summary", {
          params: { days },
        });
        setSummary(response.data || {});
      } catch (error) {
        console.error("Failed to load admin summary:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [days]);

  const toYyyyMmDd = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = `${dateObj.getMonth() + 1}`.padStart(2, "0");
    const day = `${dateObj.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDate = new Date();
  const fromDateObj = new Date();
  fromDateObj.setDate(currentDate.getDate() - days);
  const fromDate = toYyyyMmDd(fromDateObj);
  const toDate = toYyyyMmDd(currentDate);

  const handleCardClick = (key) => {
    if (key === "appointments") {
      navigate(`/appointments?fromDate=${fromDate}&toDate=${toDate}`);
      return;
    }
    if (key === "facilities") {
      navigate("/facilities");
      return;
    }
    if (key === "doctors") {
      navigate("/doctors");
      return;
    }
    if (key === "users") {
      navigate("/users");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Range (days)", String(days)],
      ["Total Appointments", String(summary.counts?.appointments ?? 0)],
      ["Total Facilities", String(summary.counts?.facilities ?? 0)],
      ["Total Doctors", String(summary.counts?.doctors ?? 0)],
      ["Total Users", String(summary.counts?.users ?? 0)],
      [""],
      ["Appointment Status Breakdown", ""],
      ...Object.entries(summary.statusBreakdown || {}).map(([k, v]) => [k, String(v)]),
      [""],
      ["Appointment Mode Breakdown", ""],
      ...Object.entries(summary.modeBreakdown || {}).map(([k, v]) => [k, String(v)]),
      [""],
      ["Facility Verification Breakdown", ""],
      ...Object.entries(summary.facilityStatusBreakdown || {}).map(([k, v]) => [k, String(v)]),
      [""],
      ["Monthly Appointments", ""],
      ...((summary.monthlyAppointments || []).map((item) => [item.label, String(item.count)])),
    ];

    const csv = rows.map((r) => r.map((cell = "") => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-dashboard-summary-${days}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    const html = `
      <html>
      <head>
        <title>Admin Dashboard Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2 { margin-bottom: 8px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h1>Admin Dashboard Summary</h1>
        <p>Range: Last ${days} days</p>
        <h2>Counts</h2>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Appointments</td><td>${summary.counts?.appointments ?? 0}</td></tr>
          <tr><td>Total Facilities</td><td>${summary.counts?.facilities ?? 0}</td></tr>
          <tr><td>Total Doctors</td><td>${summary.counts?.doctors ?? 0}</td></tr>
          <tr><td>Total Users</td><td>${summary.counts?.users ?? 0}</td></tr>
        </table>
        <h2>Appointment Status Breakdown</h2>
        <table>
          <tr><th>Status</th><th>Count</th></tr>
          ${Object.entries(summary.statusBreakdown || {}).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
        </table>
        <h2>Appointment Mode Breakdown</h2>
        <table>
          <tr><th>Mode</th><th>Count</th></tr>
          ${Object.entries(summary.modeBreakdown || {}).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const statusEntries = Object.entries(summary.statusBreakdown || {});
  const modeEntries = Object.entries(summary.modeBreakdown || {});
  const totalStatus = statusEntries.reduce((sum, [, count]) => sum + Number(count), 0);

  return (
    <Box sx={{ position: "relative" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography sx={{ fontFamily: "Manrope", fontSize: 34, lineHeight: "40px", fontWeight: 700 }}>
            Dashboard Overview
          </Typography>
         
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FormControl
            size="small"
            sx={{
              minWidth: 170,
              "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 1, boxShadow: "0 1px 3px rgba(15,23,42,.04)" },
            }}
          >
            <Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadOutlinedIcon />}
            onClick={exportCsv}
            sx={primaryActionBtnSx}
          >
            Export
          </Button>
          <Button variant="outlined" onClick={exportPdf} sx={outlinedActionBtnSx}>
            PDF
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
          gap: "24px",
          mb: 3,
          width: "100%",
        }}
      >
        {summaryCards.map((card) => (
          <Box key={card.key}>
            <Card sx={{ p: 3, border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 88, 190, 0.04)" }}>
              <CardActionArea onClick={() => handleCardClick(card.key)} sx={{ minHeight: 156 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ width: 46, height: 46, borderRadius: 1.2, bgcolor: card.iconBg, color: card.iconColor, display: "grid", placeItems: "center" }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ fontSize: 12, px: 1.1, py: 0.4, borderRadius: 10, bgcolor: "#f8fafc", color: card.badgeColor, fontWeight: 600 }}>
                    {card.badge}
                  </Box>
                </Stack>
                <Typography sx={{ mt: 2.5, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "#7c839b", fontWeight: 600 }}>
                  {card.label}
                </Typography>
                <Typography sx={{ mt: 0.8, fontFamily: "Manrope", fontSize: 40, lineHeight: 1, fontWeight: 700 }}>
                  {summary.counts?.[card.key] ?? 0}
                </Typography>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "7fr 3fr" },
          gap: "24px",
          mb: 3,
          alignItems: "stretch",
        }}
      >
        <Box>
          <MonthlyChart data={summary.monthlyAppointments || []} height={430} />
        </Box>
        <Box>
          <Box sx={{ ...containerCardSx, height: 430 }}>
            <Typography sx={{ fontFamily: "Manrope", fontSize: 30, fontWeight: 600, mb: 3 }}>
              Appointment Status
            </Typography>
            <Stack spacing={2.4}>
              {statusEntries.map(([name, count], idx) => {
                const pct = totalStatus ? Math.round((Number(count) / totalStatus) * 100) : 0;
                const color = idx === 0 ? "#10b981" : idx === 1 ? "#3b82f6" : "#f59e0b";
                return (
                  <Box key={name}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography sx={{ fontSize: 14, display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
                        {name[0].toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {count} ({pct}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ height: 8, borderRadius: 10, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: color } }}
                    />
                  </Box>
                );
              })}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, display: "flex", gap: 1.5 }}>
              <InfoOutlinedIcon sx={{ color: "#2563eb", mt: 0.2 }} />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>System Tip</Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Scheduled appointments for next week are up by 15%.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", lg: "70%" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        <Box>
          <Box sx={{ ...containerCardSx, height: 390 }}>
            <Typography sx={{ fontFamily: "Manrope", fontSize: 30, fontWeight: 600, mb: 3 }}>
              Appointment Mode Breakdown
            </Typography>
            <Grid container spacing={2}>
              {modeEntries.slice(0, 2).map(([name, count], idx) => {
                const total = modeEntries.reduce((s, [, c]) => s + Number(c), 0);
                const pct = total ? (Number(count) / total) * 100 : 0;
                return (
                  <Grid item xs={12} sm={6} key={name}>
                    <Box sx={{ border: "1px solid #f1f5f9", borderRadius: 2, p: 2, bgcolor: "#fafbfc" }}>
                      <Stack direction="row" alignItems="center" gap={1.2} mb={1.5}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1.2, bgcolor: idx === 0 ? "#dbeafe" : "#ccfbf1", color: idx === 0 ? "#1d4ed8" : "#0f766e", display: "grid", placeItems: "center" }}>
                          {idx === 0 ? <PersonOutlineOutlinedIcon /> : <VideocamOutlinedIcon />}
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>
                          {name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="baseline" gap={0.8}>
                        <Typography sx={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 36 }}>
                          {count}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                          {Number(count) > 1 ? "visits" : "visit"}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          mt: 1.5,
                          height: 6,
                          borderRadius: 8,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": { bgcolor: idx === 0 ? "#2563eb" : "#0d9488" },
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
        <Box>
          <Box sx={{ ...containerCardSx, height: 390 }}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography sx={{ fontFamily: "Manrope", fontSize: 30, fontWeight: 600 }}>
                Facility Verification
              </Typography>
              <Typography sx={{ color: "#2170e4", fontSize: 14, fontWeight: 600 }}>
                View All
              </Typography>
            </Stack>
            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid #d1fae5", bgcolor: "#ecfdf5", mb: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Approved Facilities</Typography>
                  <Typography sx={{ fontSize: 13, color: "#059669", mt: 0.5 }}>
                    All active locations are currently compliant.
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: "Manrope", fontSize: 32, fontWeight: 700, color: "#047857" }}>
                  {summary.facilityStatusBreakdown?.approved || 0}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 4, textAlign: "center", color: "#94a3b8" }}>
              <DomainOutlinedIcon sx={{ fontSize: 36, mb: 0.5 }} />
              <Typography sx={{ fontSize: 13 }}>
                No facilities pending verification
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Fab
        color="primary"
        sx={{
          position: "fixed",
          right: 32,
          bottom: 32,
          width: 56,
          height: 56,
          bgcolor: "#2170e4",
          boxShadow: "0 12px 24px rgba(33,112,228,.35)",
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
