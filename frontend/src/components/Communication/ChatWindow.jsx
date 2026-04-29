import React from 'react';
import { Paper, Typography, Button } from '@mui/material';

const ChatWindow = () => {
  const openPopup = () => {
    window.open('/chat', '_blank', 'width=600,height=600');
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Chat Support</Typography>
      <Typography variant="body2" mb={2}>Connecting to chat...</Typography>
      <Button variant="outlined" onClick={openPopup}>Open in New Window</Button>
    </Paper>
  );
};

export default ChatWindow;
