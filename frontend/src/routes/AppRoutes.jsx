import React, { useContext } from "react";
import NavBar from "../components/Layouts/NavBar";
import HomePage from "../pages/HomePage";
import AppointmentsPage from "../pages/AppointmentsPage";
import BookingPage from "../pages/BookingPage";
import ProfilePage from "../pages/ProfilePage";
import ForcePasswordChangePage from "../pages/ForcePasswordChangePage";
import Login from "../pages/Login";
import { CssBaseline, Box } from "@mui/material";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { useSelector } from "react-redux";

const AppRoutes = () => {
  const { role, loading } = useContext(AuthContext); // Assuming AuthProvider has `loading`
  const requirePasswordChange = useSelector((state) => state.auth.requirePasswordChange);

  if (loading) {
    return <div>Loading...</div>; // show spinner while checking role
  }

  return (
    <Box sx={{ width: "100%" }}>
      <CssBaseline />
      {role ? (
        requirePasswordChange ? (
          <Routes>
            <Route path="/force-password-change" element={<ForcePasswordChangePage />} />
            <Route path="*" element={<Navigate to="/force-password-change" />} />
          </Routes>
        ) : (
        <>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/records" element={<HomePage />} />
            <Route path="/messages" element={<HomePage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
        )
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/force-password-change" element={<ForcePasswordChangePage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Box>
  );
};

export default AppRoutes;
