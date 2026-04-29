import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { useContext } from "react";

const NavWrapper = styled(Paper)(() => ({
  borderRadius: "20px 20px 0 0",
  padding: "0 24px",
  backgroundColor: "#f8f9fc",
  boxShadow: "none",
  overflow: "hidden",
}));

const navItems = [
  { text: "Home", to: "/" },
  { text: "Appointments", to: "/appointments" },
  { text: "Profile", to: "/profile" },
  { text: "Logout" },
];

const NavBar = () => {
    const { logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useSelector((state) => state.auth.user);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#e6e7ed", overflowX: "hidden" }}
      >
        <NavWrapper>
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* Logo */}
            <Box display="flex" alignItems="center" gap={1}>
              <img src="/logo.png" alt="logo" width={100} height={90} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {/* Optional Title */}
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box display="flex" alignItems="center" gap={3}>
                {navItems.map(({ text, to }) => (
                  <Button
                    key={text}
                    component={Link}
                    to={to}
                    sx={{
                      color: "#1a1a1a",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.9rem",
                    }}
                    onClick={text === "Logout" && logout}
                  >
                    {user.role === "doctor" && text==="Appointments" ? "Patient history" : text}
                  </Button>
                ))}

                <Avatar
                  src={user?.profileImage}
                  alt="User Avatar"
                  sx={{ ml: 1 }}
                />
              </Box>
            )}

            {/* Mobile Navigation Toggle */}
            {isMobile && (
              <>
                <IconButton
                  onClick={toggleDrawer}
                  sx={{ backgroundColor: "#edeef2" }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
                  <Box width={220} p={2}>
                    <List>
                      {navItems.map(({ text, to }) => (
                        <ListItem
                          button
                          key={text}
                          component={Link}
                          to={to}
                          onClick={toggleDrawer}
                        >
                          <ListItemText primary={text} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Drawer>
              </>
            )}
          </Toolbar>
        </NavWrapper>
      </AppBar>

      {/* Global CSS override to hide horizontal scroll */}
      <style>{`
        body {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
};

export default NavBar;
