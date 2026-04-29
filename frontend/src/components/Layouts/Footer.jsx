import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        py: 4,
        borderTop: '1px solid #e0e0e0',
        mt: 'auto',
        borderRadius: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Grid  textAlign={{ xs: 'center', sm: 'left' }}>
            <img src="/logo.png" alt="Medico Logo" style={{ height: 90, width: 90 }} />
          </Grid>

          {/* Navigation */}
          <Grid >
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
              <Link href="#" underline="hover" color="inherit">Home</Link>
              <Link href="#" underline="hover" color="inherit">About</Link>
              <Link href="#" underline="hover" color="inherit">Services</Link>
              <Link href="#" underline="hover" color="inherit">Contact</Link>
            </Box>
          </Grid>

          {/* Copyright */}
          <Grid  textAlign={{ xs: 'center', sm: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Medico. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
