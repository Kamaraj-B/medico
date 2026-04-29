import SideNav from "../components/Layouts/SideNav";
import AppointmentsPage from "../pages/Admin/AppointmentsPage";
import FacilityPage from "../pages/Admin/FacilityPage";
import DoctorsPage from "../pages/Admin/DoctorsPage";
import UserPage from "../pages/Admin/UserPage";
import DashboardPage from "../pages/Admin/DashboardPage";
import Login from "../pages/Login";
import { CssBaseline, Box, Avatar, IconButton, Stack, Typography } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useSelector } from "react-redux";

const AdminRoutes = () => {
  const { role, loading } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
  const drawerWidth = 280;

  // If still loading show nothing or loader
  if (loading) return null;

  // If not admin, redirect to login
  if (!role) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#fcf8fa" }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.3s ease",
          }}
        >
          <SideNav />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: `calc(100% - ${drawerWidth}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              height: 64,
              position: "sticky",
              top: 0,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 4,
              backgroundColor: "rgba(255,255,255,0.86)",
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(15,23,42,.04)",
            }}
          >
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em", fontFamily: "Manrope" }}>
              MedAdmin
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton size="small">
                <NotificationsNoneOutlinedIcon />
              </IconButton>
              <IconButton size="small">
                <SettingsOutlinedIcon />
              </IconButton>
              <IconButton size="small">
                <HelpOutlineOutlinedIcon />
              </IconButton>
            
              <Box>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, fontFamily: "Manrope" }}>
                  {user?.username || "Dr. Sarah Smith"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Admin
                </Typography>
              </Box>
              <Avatar src={user?.profileImage || ""} sx={{ width: 40, height: 40 }}>
                {(user?.username || "A").slice(0, 1).toUpperCase()}
              </Avatar>
            </Stack>
          </Box>
          <Box sx={{ p: 4 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/facilities" element={<FacilityPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AdminRoutes;
