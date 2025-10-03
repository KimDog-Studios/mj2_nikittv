"use client";
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

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
  const now = new Date();
  const today = openingTimes[todayIdx];
  const openStatus = getOpenStatus(today, now);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeParts());
    }, 1000);
    setCurrentTime(getCurrentTimeParts());
    return () => clearInterval(timer);
  }, []);

  type OpeningTime = { day: string; open: string; close: string };
type OpenStatus = { status: 'closed' | 'before' | 'open' | 'after'; message: string };

function pad2(n: number) { return String(n).padStart(2, '0'); }

function secsUntil(targetH: number, targetM: number, now: Date) {
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetH, targetM, 0);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h ? h + 'h ' : ''}${pad2(m)}m ${pad2(s)}s`;
}

function getOpenStatus(today: OpeningTime, now: Date): OpenStatus {
  if (today.open === 'Closed') return { status: 'closed', message: 'Closed today' };
  const [openH, openM] = today.open.split(':').map(Number);
  const [closeH, closeM] = today.close.split(':').map(Number);
  const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const openSecs = openH * 3600 + openM * 60;
  const closeSecs = closeH * 3600 + closeM * 60;
  if (nowSecs < openSecs) {
    const secs = openSecs - nowSecs;
    return { status: 'before', message: `Opens in ${formatHMS(secs)}` };
  } else if (nowSecs >= openSecs && nowSecs < closeSecs) {
    const secs = closeSecs - nowSecs;
    return { status: 'open', message: `Open Now, closes in ${formatHMS(secs)}` };
  } else {
    return { status: 'after', message: 'Closed Today' };
  }
}

  return (
    <Box sx={{
      bgcolor: '#181A1B', // dark gray
      color: '#fff',
      borderRadius: 4,
      boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
      p: 2.5,
      maxWidth: 340,
      mx: 'auto',
      my: 4,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1.5,
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
      {/* keyframes moved to global CSS to avoid hydration mismatches */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
        <Typography variant="subtitle1" sx={{ color: '#38ef7d', fontWeight: 700, fontSize: '1.15em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          {mounted && (
            <>
              Current Time:&nbsp;
              <span>{currentTime.hours}</span>
              <span style={{
                display: 'inline-block',
                animation: 'blinkColon 0.85s steps(1) infinite',
                fontWeight: 900,
                minWidth: '0.7em',
              }}>:</span>
              <span>{currentTime.minutes}</span>
              <span style={{
                display: 'inline-block',
                animation: 'blinkColon 0.85s steps(1) infinite',
                fontWeight: 900,
                minWidth: '0.7em',
              }}>:</span>
              <span>{currentTime.seconds}</span>
            </>
          )}
        </Typography>
        <Typography variant="body2" sx={{ color: mounted && openStatus.status === 'open' ? '#38ef7d' : '#ff1744', fontWeight: 700, fontSize: '1.08em', mt: 0.5 }}>
          {mounted ? openStatus.message : 'Calculating availability...'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, width: '100%', mt: 1 }}>
        {openingTimes.map((ot, idx) => (
          <Box key={ot.day} sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: mounted && todayIdx === idx ? 'rgba(255,23,68,0.12)' : 'rgba(255,255,255,0.04)',
            fontWeight: mounted && todayIdx === idx ? 700 : 500,
            border: mounted && todayIdx === idx ? '2px solid #ff1744' : '1px solid #222',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <Typography variant="body1" sx={{ color: todayIdx === idx ? '#ff1744' : '#fff', fontWeight: 'inherit' }}>
              {ot.day}
            </Typography>
            {ot.open === 'Closed' ? (
              <Typography variant="body1" sx={{ color: '#bbb', fontWeight: 700 }}>CLOSED</Typography>
            ) : (
              <Typography variant="body1" sx={{ color: '#38ef7d', fontWeight: 700 }}>{ot.open}:00 - {ot.close}:00</Typography>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={mounted ? (openStatus.status === 'open' ? 'Book now' : openStatus.message) : 'Checking...'} arrow>
          <span>
            <Button
              variant="contained"
              disabled={!mounted || openStatus.status !== 'open'}
              onClick={() => {
                // try to focus booking form or scroll to bottom
                const form = document.querySelector('form');
                if (form) {
                  form.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  // focus first input if available
                  const input = form.querySelector('input, textarea, button');
                  if (input && typeof (input as HTMLElement).focus === 'function') (input as HTMLElement).focus();
                  // add a temporary pulse class to draw attention
                  try {
                    form.classList.add('pulse-highlight');
                    setTimeout(() => form.classList.remove('pulse-highlight'), 1200);
                  } catch (e) {}
                } else {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
              }}
              sx={{ px: 4, py: 1.25, borderRadius: 3, background: mounted && openStatus.status === 'open' ? 'linear-gradient(90deg,#11998e,#38ef7d)' : 'linear-gradient(90deg,#555,#777)' }}
            >
              Book Now
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default HomePageOpeningTimes