// components/GradientButton.jsx
import React from 'react';
import { styled } from '@mui/material/styles';

const StyledButton = styled('button')({
  width: '9em',
  height: '3em',
  borderRadius: '30em',
  fontSize: '15px',
  fontFamily: 'inherit',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1,
  cursor: 'pointer',
  backgroundColor: '#e0e0e0',

  '::before': {
    content: "''",
    width: 0,
    height: '3em',
    borderRadius: '30em',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundImage: 'linear-gradient(to right, #0fd850 0%, #f9f047 100%)',
    transition: '0.5s ease',
    zIndex: -1,
  },

  '&:hover::before': {
    width: '9em',
  },
});

const GradientButton = ({ label, onClick }) => {
  return <StyledButton onClick={onClick}>{label}</StyledButton>;
};

export default GradientButton;
