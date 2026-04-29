import React from "react";
import { Button, Typography, styled, Box } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Styled Button using MUI's styled API
const StyledButton = styled(Button)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "45px",
  height: "45px",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition: "0.3s",
  boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.199)",
  backgroundColor: "rgb(255, 65, 65)",
  padding: 0,
  "&:hover": {
    width: "125px",
    borderRadius: "40px",
  },
  "&:active": {
    transform: "translate(2px, 2px)",
  },
}));

const SignIcon = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.3s",
  "& svg": {
    width: "17px",
    height: "17px",
    fill: "#fff",
  },
  [`${StyledButton}:hover &`]: {
    width: "30%",
    paddingLeft: "20px",
  },
}));

const Text = styled(Typography)(() => ({
  position: "absolute",
  right: "0%",
  width: "0%",
  opacity: 0,
  color: "white",
  fontSize: "1.2em",
  fontWeight: 600,
  transition: "0.3s",
  [`${StyledButton}:hover &`]: {
    opacity: 1,
    width: "70%",
    paddingRight: "10px",
  },
}));

const NotVerifiedButton = ({ onClick }) => {
  return (
    <StyledButton onClick={onClick}>
      <SignIcon>
        <ErrorOutlineIcon />
      </SignIcon>
      <Text className="text">Not Verified</Text>
    </StyledButton>
  );
};

export default NotVerifiedButton;
