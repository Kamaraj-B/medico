// components/CustomLoader.jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const LoaderWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg polyline': {
    fill: 'none',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },

  '& svg polyline#back': {
    stroke: '#ff4d5033',
  },

  '& svg polyline#front': {
    stroke: '#ff4d4f',
    strokeDasharray: '48, 144',
    strokeDashoffset: 192,
    animation: 'dash_682 1.4s linear infinite',
  },

  '@keyframes dash_682': {
    '72.5%': {
      opacity: 0,
    },
    to: {
      strokeDashoffset: 0,
    },
  },
}));

const CustomLoader = () => {
  return (
    <LoaderWrapper sx={{ width: '100%', height: '50vh',borderRadius: 50,padding:'30px' }}>
      <svg width="90px" height="60px">
        <polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          id="back"
        />
        <polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          id="front"
        />
      </svg>
    </LoaderWrapper>
  );
};

export default CustomLoader;
