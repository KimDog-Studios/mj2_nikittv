import React from 'react';
import { OpeningTime, OpenStatus } from './types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

interface Props {
  currentTime: { hours: string; minutes: string; seconds: string };
  mounted: boolean;
  openStatus: OpenStatus;
  openingTimes: OpeningTime[];
  todayIdx: number;
  router: any; // Replace with proper type if available
}

export default function HomePageOpeningTimes({ currentTime, mounted, openStatus, openingTimes, todayIdx, router }: Props) {
  return (
    <Box sx={{
      bgcolor: 'rgba(24,26,27,0.85)',
      backdropFilter: 'blur(15px)',
      color: '#fff',
      borderRadius: 5,
      boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
      border: '1px solid rgba(255,255,255,0.1)',
      p: {xs: 2, sm: 3},
      maxWidth: {xs: '100%', sm: 380},
      mx: 'auto',
      my: 4,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 50%, rgba(255,23,68,0.05) 100%)',
        borderRadius: 5,
        pointerEvents: 'none',
      },
    }}>
      <Typography variant="h6" sx={{
        fontWeight: 800,
        mb: 1,
        color: '#ffd700',
        letterSpacing: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        textShadow: '0 0 10px rgba(255,215,0,0.5)',
      }}>
        Booking available at these times
        <span style={{
          display: 'inline-block',
          animation: 'bounce 1.2s infinite',
          fontSize: '1.4em',
          marginLeft: '8px',
          filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.5))',
        }}>📅</span>
      </Typography>
      <Typography variant="body2" sx={{
        color: '#bbb',
        mb: 2,
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        All times are shown in UK Time
      </Typography>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
        p: 1.5,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
      }}>
        <Typography variant="subtitle1" sx={{
          color: '#38ef7d',
          fontWeight: 700,
          fontSize: '1.2em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          textShadow: '0 0 5px rgba(56,239,125,0.5)',
        }}>
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
        <Typography variant="body2" sx={{
          color: mounted && openStatus.status === 'open' ? '#38ef7d' : '#ffd700',
          fontWeight: 700,
          fontSize: '1.1em',
          mt: 0.5,
          textShadow: '0 0 5px ' + (mounted && openStatus.status === 'open' ? 'rgba(56,239,125,0.5)' : 'rgba(255,215,0,0.5)'),
        }}>
          {mounted ? openStatus.message : 'Calculating availability...'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 1 }}>
        {openingTimes.map((ot, idx) => (
          <Box key={ot.day} sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            bgcolor: mounted && todayIdx === idx ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
            fontWeight: mounted && todayIdx === idx ? 700 : 500,
            border: mounted && todayIdx === idx ? '2px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(5px)',
            '&:hover': {
              bgcolor: mounted && todayIdx === idx ? 'rgba(255,23,68,0.2)' : 'rgba(255,255,255,0.08)',
              transform: 'translateX(4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
          }}>
            <Typography variant="body1" sx={{
              color: todayIdx === idx ? '#ffd700' : '#fff',
              fontWeight: 'inherit',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}>
              {ot.day}
            </Typography>
            {ot.open === 'Closed' ? (
              <Typography variant="body1" sx={{
                color: '#bbb',
                fontWeight: 700,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                CLOSED
              </Typography>
            ) : (
              <Typography variant="body1" sx={{
                color: '#38ef7d',
                fontWeight: 700,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                {ot.open}:00 - {ot.close}:00
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ width: '100%', mt: 2.5, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={mounted ? (openStatus.status === 'open' ? 'Book now' : openStatus.message) : 'Checking...'} arrow>
          <span>
            <Button
              variant="contained"
              disabled={!mounted || openStatus.status !== 'open'}
              onClick={() => router.push('/pages/booking')}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 4,
                fontWeight: 600,
                fontSize: '1em',
                textTransform: 'none',
                background: mounted && openStatus.status === 'open'
                  ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                  : 'linear-gradient(135deg, #555, #777)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                '&:hover': mounted && openStatus.status === 'open' ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(56,239,125,0.4)',
                  background: 'linear-gradient(135deg, #38ef7d, #11998e)',
                } : {},
              }}
            >
              Book Now
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}