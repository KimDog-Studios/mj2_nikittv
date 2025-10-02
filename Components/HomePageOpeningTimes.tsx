"use client";
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const openingTimes = [
  { day: 'Monday', open: '09:00', close: '16:00' },
  { day: 'Tuesday', open: '09:00', close: '16:00' },
  { day: 'Wednesday', open: '09:00', close: '16:00' },
  { day: 'Thursday', open: '09:00', close: '16:00' },
  { day: 'Friday', open: '09:00', close: '16:00' },
  { day: 'Saturday', open: '12:00', close: '16:00' },
  { day: 'Sunday', open: 'Closed', close: '' },
];

function getCurrentTimeParts() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return { hours, minutes, seconds };
}

function HomePageOpeningTimes() {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeParts());
  const [mounted, setMounted] = useState(false);
  // Map JS getDay() (0=Sunday) to our array (0=Monday)
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeParts());
    }, 1000);
    setCurrentTime(getCurrentTimeParts());
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{
      bgcolor: '#181A1B', // dark gray
      color: '#fff',
      borderRadius: 4,
      boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
      p: 2.5,
      maxWidth: 320,
      mx: 'auto',
      my: 4,
      textAlign: 'center',
    }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#ff1744', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        Booking available at these times
        <span style={{
          display: 'inline-block',
          animation: 'bounce 1.2s infinite',
          fontSize: '1.3em',
          marginLeft: '6px',
        }}>📅</span>
      </Typography>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blinkColon {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
      <Typography variant="subtitle1" sx={{ mb: 3, color: '#38ef7d', fontWeight: 700, fontSize: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {mounted && (
          <>
            Current Time:&nbsp;
            <span>{currentTime.hours}</span>
            <span style={{
              display: 'inline-block',
              animation: 'blinkColon 1s steps(1) infinite',
              fontWeight: 900,
              minWidth: '0.7em',
            }}>:</span>
            <span>{currentTime.minutes}</span>
            <span style={{
              display: 'inline-block',
              animation: 'blinkColon 1s steps(1) infinite',
              fontWeight: 900,
              minWidth: '0.7em',
            }}>:</span>
            <span>{currentTime.seconds}</span>
          </>
        )}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {openingTimes.map((ot, idx) => (
          <Box key={ot.day} sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: todayIdx === idx ? 'rgba(255,23,68,0.12)' : 'rgba(255,255,255,0.04)',
            fontWeight: todayIdx === idx ? 700 : 500,
            border: todayIdx === idx ? '2px solid #ff1744' : '1px solid #222',
          }}>
            <Typography variant="body1" sx={{ color: todayIdx === idx ? '#ff1744' : '#fff', fontWeight: 'inherit' }}>
              {ot.day}
            </Typography>
            {ot.open === 'Closed' ? (
              <Typography variant="body1" sx={{ color: '#bbb', fontWeight: 700 }}>Closed</Typography>
            ) : (
              <Typography variant="body1" sx={{ color: '#38ef7d', fontWeight: 700 }}>{ot.open} - {ot.close}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default HomePageOpeningTimes