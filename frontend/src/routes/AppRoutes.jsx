import React, { useContext } from "react";
import FormConfirmation from "../components/FormConfirmation";
import Footer from "../components/Layouts/Footer";
import NavBar from "../components/Layouts/NavBar";
import AppointmentPage from "../pages/AppointmentPage";
import BookingPage from "../pages/BookingPage";
import ProfilePage from "../pages/ProfilePage";
import ChatPage from "../pages/ChatPage";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import VideoPage from "../pages/VideoPage";
import { CssBaseline, Container } from "@mui/material";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const AppRoutes = () => {
  const { role, loading } = useContext(AuthContext); // Assuming AuthProvider has `loading`

  if (loading) {
    return <div>Loading...</div>; // show spinner while checking role
  }

  return (
    <Container maxWidth="lg">
      <CssBaseline />
      {role ? (
        <>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/success/:id" element={<FormConfirmation />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/appointments" element={<AppointmentPage />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Container>
  );
};

export default AppRoutes;
