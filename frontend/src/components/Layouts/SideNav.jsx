import React, { useContext } from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

const drawerWidth = 280;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, route: "/" },
  { label: "Facilities", icon: <LocalHospitalIcon />, route: "/facilities" },
  { label: "Appointments", icon: <EventNoteIcon />, route: "/appointments" },
  { label: "Doctors", icon: <MedicalServicesIcon />, route: "/doctors" },
  { label: "Users", icon: <PeopleIcon />, route: "/users" },
];

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#0f172a",
          color: "#94a3b8",
          borderRight: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          py: 3,
        },
      }}
    >
      <Box px={3} mb={4}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "Manrope" }}>
          MedAdmin
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>Health Systems v2.0</Typography>
      </Box>

      <List sx={{ px: 0 }}>
        {navItems.map(({ label, icon, route }) => {
          const active =
            location.pathname === `/admin${route}` || (route === "/" && location.pathname === "/admin");
          return (
            <Tooltip key={label} title={label} placement="right">
              <ListItemButton
                onClick={() => navigate(route)}
                sx={{
                  py: 1.5,
                  px: 2.4,
                  ml: active ? 0 : 1,
                  mr: 1,
                  gap: 1.5,
                  borderLeft: active ? "4px solid #3b82f6" : "4px solid transparent",
                  bgcolor: active ? "rgba(37,99,235,0.10)" : "transparent",
                  color: active ? "#60a5fa" : "#94a3b8",
                  borderRadius: active ? "0 8px 8px 0" : "8px",
                  "&:hover": { bgcolor: "rgba(51,65,85,0.45)", color: "#e2e8f0" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 20, color: "inherit" }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: 14, fontFamily: "Manrope", fontWeight: 600 }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", px: 0 }}>
        <ListItemButton sx={{ py: 1.5, px: 3, mx: 1, borderRadius: 1, color: "#94a3b8", gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 20, color: "inherit" }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{ fontSize: 14, fontFamily: "Manrope", fontWeight: 600 }}
          />
        </ListItemButton>
        <ListItemButton
          onClick={logout}
          sx={{ py: 1.5, px: 3, mx: 1, borderRadius: 1, color: "#94a3b8", gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 20, color: "inherit" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14, fontFamily: "Manrope", fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
