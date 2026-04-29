// components/CustomLoader.jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const LoaderWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 20px rgba(0, 88, 190, 0.04)',

  '& svg polyline': {
    fill: 'none',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },

  '& svg polyline#back': {
    stroke: '#2170e433',
  },

  '& svg polyline#front': {
    stroke: '#2170e4',
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
    <LoaderWrapper
      sx={{
        width: '100%',
        minHeight: 140,
        maxHeight: 180,
        borderRadius: 3,
        p: 2,
      }}
    >
      <svg width="84px" height="54px">
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
