import React from 'react';
import NavBar from '@/Components/NavBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ManageBookings from '@/Components/ManageBookings';

export default function ManageBookingPage() {
  return (
    <>
      <NavBar />
      <ManageBookings/>
    </>
  );
}
