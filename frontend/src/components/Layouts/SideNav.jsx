import React, {  useContext } from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

const expandedWidth = 240;
const collapsedWidth = 60;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, route: "/" },
  { label: "Facilities", icon: <LocalHospitalIcon />, route: "/facilities" },
  { label: "Appointments", icon: <EventNoteIcon />, route: "/appointments" },
  { label: "Doctors", icon: <MedicalServicesIcon />, route: "/doctors" },
  { label: "Users", icon: <PeopleIcon />, route: "/users" },
  { label: "Logout", icon: <Logout />, route: "/login" },
];

export default function SideNav({open, setOpen}) {
 // const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: open ? expandedWidth : collapsedWidth,
            transition: "width 0.3s",
            overflowX: "hidden",
            boxSizing: "border-box",
            bgcolor: "#e9eff5",
          },
        }}
      >
        {/* Toggle Button */}
        <Box display="flex" justifyContent={open ? "flex-end" : "center"} p={1}>
          <IconButton onClick={toggleDrawer}>
            {open ? <ArrowBackIosRoundedIcon /> : <ArrowForwardIosRoundedIcon />}
          </IconButton>
        </Box>

        {/* Logo */}
        {open && (
          <Box display="flex" justifyContent="center" p={2}>
            <img src="/logo.png" alt="logo" width={150} height={150} />
          </Box>
        )}

        <Divider />

        {/* Nav Items */}
        <List>
          {navItems.map(({ label, icon, route }) => (
            <Tooltip key={label} title={!open ? label : ""} placement="right">
              <ListItemButton
                onClick={label === "Logout" ? logout : () => navigate(route)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </ListItemIcon>
                {open && <ListItemText primary={label} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Drawer>
    </>
  );
}
