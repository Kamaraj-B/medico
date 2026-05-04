import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

const navItems = [
  { text: "Appointments", to: "/appointments" },
  { text: "Records", to: "/profile" },
  { text: "Messages", to: "/chat" },
  { text: "Find Care", to: "/" },
];

const NavBar = () => {
  const { logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0",
        color: "#0f172a",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: "64px !important",
          px: { xs: 1.5, sm: 2.5, md: 4 },
          maxWidth: 1280,
          width: "100%",
          mx: "auto",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 5 }}>
          <Typography sx={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 27, color: "#131b2e", letterSpacing: "-0.01em" }}>
            MedConnect
          </Typography>
          {!isMobile ? (
            <Stack direction="row" spacing={1.8}>
              {navItems.map(({ text, to }) => {
                const active = location.pathname === to;
                return (
                  <Button
                    key={text}
                    component={Link}
                    to={to}
                    sx={{
                      textTransform: "none",
                      fontWeight: active ? 700 : 600,
                      fontSize: 13.5,
                      color: active ? "#2563eb" : "#475569",
                      borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                      borderRadius: 0,
                      px: 0.6,
                      minWidth: "auto",
                    }}
                  >
                    {text}
                  </Button>
                );
              })}
            </Stack>
          ) : null}
        </Stack>

        {!isMobile ? (
          <Stack direction="row" alignItems="center" spacing={1.6}>
            <Button
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: 999,
                px: 1.8,
                fontSize: 12.5,
                minWidth: "auto",
              }}
            >
              Emergency
            </Button>
            <IconButton sx={{ width: 40, height: 40 }}>
              <NotificationsNoneOutlinedIcon />
            </IconButton>
            <IconButton component={Link} to="/profile" sx={{ width: 40, height: 40 }}>
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Stack>
        ) : (
          <>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box width={260} p={2}>
                <List>
                  {navItems.map(({ text, to }) => (
                    <ListItemButton key={text} component={Link} to={to} onClick={() => setDrawerOpen(false)}>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                  <ListItemButton component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                  <ListItemButton onClick={logout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </List>
              </Box>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
