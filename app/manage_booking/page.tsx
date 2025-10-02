import React from 'react';
import NavBar from '@/Components/NavBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function ManageBookingPage() {
  return (
    <>
      <NavBar />
      <Box sx={{
        bgcolor: '#181A1B',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#ff1744', mb: 3, letterSpacing: 2 }}>
          Manage Bookings
        </Typography>
        <Typography variant="body1" sx={{ color: '#bbb', maxWidth: 420, textAlign: 'center', mb: 4 }}>
          Here you can view, edit, and manage your bookings. (Feature coming soon!)
        </Typography>
        {/* Add booking management features/components here */}
      </Box>
    </>
  );
}
