import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserProfile,
  uploadUserProfileImage,
} from "../store/slices/authSlice";

import {
  Person as PersonIcon,
  NotificationsNone as NotificationsIcon,
  Payment as PaymentRoundedIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Box, Tabs, Tab, Paper } from "@mui/material";

import ProfileInfo from "../components/Profile/PersonalInfo";
import PaymentDetails from "../components/Profile/PaymentDetails";
import AppointmentRequests from "../components/Profile/AppointmentRequests";

const ProfilePage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  // Update user details (form submit)
  const handleFormSubmit = (formData) => {
    if (!user?._id) return;
    dispatch(updateUserProfile({ userId: user._id, formData }));
  };

  // Upload profile image
  const handleImageUpload = (file) => {
    if (!user?._id) return;
    dispatch(uploadUserProfileImage({ userId: user._id, file }));
  };

  return (
    <Box
      sx={{
        height: "70vh",
        display: "flex",
        fontFamily: '"Public Sans", "Noto Sans", sans-serif',
        p: 2,
        margin: "15px",
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
      }}
    >
      {/* Sidebar */}
      <Paper
        sx={{
          width: { xs: "auto", md: 250 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: "1px solid #ddd",
        }}
      >
        <Tabs
          orientation="vertical"
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          sx={{ mt: 5 }}
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab
            label="Payment Details"
            icon={<PaymentRoundedIcon />}
            iconPosition="start"
          />
          {user?.role === "doctor" && (
            <Tab
              label="Appointment Requests"
              icon={<NotificationsIcon />}
              iconPosition="start"
            />
          )}
          <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box
        sx={{ flexGrow: 1, p: 4, overflowY: "auto" }}
        className="hide-scrollbar"
      >
        {tabIndex === 0 && (
          <ProfileInfo
            user={user}
            handleFormSubmit={handleFormSubmit}
            handleImageUploadForm={handleImageUpload}
          />
        )}
        {tabIndex === 1 && <PaymentDetails />}
        {tabIndex === 2 && user?.role === "doctor" && <AppointmentRequests />}
      </Box>
    </Box>
  );
};

export default ProfilePage;
