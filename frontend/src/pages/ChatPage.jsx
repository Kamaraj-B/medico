import React from 'react';
import { Typography, Box } from '@mui/material';

const ChatPage = () => {
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat Support
      </Typography>
      <Typography variant="body1">
        This is the chat support page. Real-time chat will be integrated here.
      </Typography>
    </Box>
  );
};

export default ChatPage;
