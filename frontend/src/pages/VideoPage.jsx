import React from 'react';
import { Typography, Box } from '@mui/material';

const VideoPage = () => {
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Video Consultation
      </Typography>
      <Typography variant="body1">
        This is the video consultation page. Video call features will be added here.
      </Typography>
    </Box>
  );
};

export default VideoPage;
