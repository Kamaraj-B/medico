import SideNav from "../components/Layouts/SideNav";
import Footer from "../components/Layouts/Footer";
import AppointmentsPage from "../pages/Admin/AppointmentsPage";
import FacilityPage from "../pages/Admin/FacilityPage";
import DoctorsPage from "../pages/Admin/DoctorsPage";
import UserPage from "../pages/Admin/UserPage";
import Login from "../pages/Login";
import { CssBaseline, Box, Toolbar } from "@mui/material";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";

const AdminRoutes = () => {
  const { role, loading } = useContext(AuthContext);
  const [open, setOpen] = useState(true); // controls sidebar state

  const drawerWidth = open ? 240 : 60; // expanded vs collapsed

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
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.3s ease",
          }}
        >
          <SideNav open={open} setOpen={setOpen} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            m: 1,
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/" element={<FacilityPage />} />
            <Route path="/facilities" element={<FacilityPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Box sx={{ mt: "auto" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AdminRoutes;
