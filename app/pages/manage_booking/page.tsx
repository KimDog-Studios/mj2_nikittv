"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ManageBookings from '@/Components/BookingsForm';
import BookingsAdmin from '@/Components/BookingsAdmin';
import ShowsCalendar from '@/Components/ShowsCalendar';
import { auth } from '@/Components/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

export default function ManageBookingPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        setAuthed(false);
        router.replace('/pages/admin');
      }
    });
    return () => unsub();
  }, [router]);

  if (authed === null) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Checking authentication…</Typography>
      </Box>
    );
  }

  return (
    <>
      <ManageBookings />
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        <BookingsAdmin />
        <ShowsCalendar />
      </Box>
    </>
  );
}
