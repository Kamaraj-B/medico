import React from 'react';
import { Paper, Typography, Button } from '@mui/material';

const VideoWindow = () => {
  const openPopup = () => {
    window.open('/video', '_blank', 'width=800,height=600');
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Video Consultation</Typography>
      <Typography variant="body2" mb={2}>Loading video session...</Typography>
      <Button variant="outlined" onClick={openPopup}>Open in New Window</Button>
    </Paper>
  );
};

export default VideoWindow;
