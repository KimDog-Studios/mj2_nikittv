"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { MusicNote, Star, TheaterComedy } from '@mui/icons-material';

const openingTimes = [
  { day: 'Monday', open: '09:00', close: '16:00' },
  { day: 'Tuesday', open: '09:00', close: '16:00' },
  { day: 'Wednesday', open: '09:00', close: '16:00' },
  { day: 'Thursday', open: '09:00', close: '16:00' },
  { day: 'Friday', open: '09:00', close: '16:00' },
  { day: 'Saturday', open: '12:00', close: '16:00' },
  { day: 'Sunday', open: 'Closed', close: '' },
];

const places = [
  {
    name: 'Bridgend',
    area: 'Wales',
    price: '£20 | Per Show',
    image: 'https://cdn.britannica.com/29/144829-050-35D6B000/Bridgend-Wales.jpg',
  },
  {
    name: 'Pontycymer',
    area: 'Wales',
    price: '£10 | Per Show',
    image: 'https://alchetron.com/cdn/pontycymer-f52ca3b6-835b-43b7-95b7-26d697b9633-resize-750.jpeg',
  },
  {
    name: 'Sarn',
    area: 'Wales',
    price: '£15 | Per Show',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/St_Ffraid%27s_Church%2C_Sarn_-_geograph.org.uk_-_4985105.jpg/960px-St_Ffraid%27s_Church%2C_Sarn_-_geograph.org.uk_-_4985105.jpg',
  },
  {
    name: 'Maesteg',
    area: 'Wales',
    price: '£20 | Per Show',
    image: 'https://i2-prod.walesonline.co.uk/incoming/article21622288.ece/ALTERNATES/s298/0_rbp_mai100821maesteg_10825JPG.jpg',
  },
];

function getCurrentTimeParts() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return { hours, minutes, seconds };
}

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

type OpeningTime = { day: string; open: string; close: string };
type OpenStatus = { status: 'closed' | 'before' | 'open' | 'after'; message: string };

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

function HomePage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
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

  // Toggle a place into/out of a selection
  function handleToggleLocation(placeName: string) {
    setSelectedLocation(prev => (prev === placeName ? '' : placeName));
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative' }}>
      <style>{`
        body {
          background: linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%);
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .sparkle::before {
          content: '✨';
          position: absolute;
          top: -10px;
          right: -10px;
          animation: sparkle 2s infinite;
        }
        @keyframes titleGlow {
          0%, 100% { textShadow: '0 0 20px rgba(255,215,0,0.5)'; }
          50% { textShadow: '0 0 40px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.6)'; }
        }
        @keyframes iconDance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.1); }
          50% { transform: rotate(-5deg) scale(1.1); }
          75% { transform: rotate(5deg) scale(1.1); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* HomePageInfo */}
      <Box sx={{
        width: '100%',
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 4,
        mx: 2,
        my: 4,
        animation: 'fadeInUp 1s ease-out',
      }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star sx={{ color: '#ffd700' }} /> MJ2 Studios <Star sx={{ color: '#ffd700' }} />
        </Typography>
        <Typography variant="body1" sx={{ color: '#bbb', maxWidth: 760 }}>
          Professional tribute acts and bookings across South Wales. Browse our areas covered, opening times, and manage your bookings from the navigation above.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <img src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Pic1.png" alt="Pic1" style={{ width: 160, height: 'auto', borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }} />
          <img src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Pic2.png" alt="Pic2" style={{ width: 160, height: 'auto', borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }} />
          <iframe
            width="360"
            height="280"
            src="https://www.youtube.com/embed/yt6zHBd7Xwc?autoplay=1&mute=1&loop=1&playlist=yt6zHBd7Xwc&controls=1"
            title="MJ2 Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}
          ></iframe>
        </Box>
      </Box>

      <Box sx={{ width: '80%', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%)', mx: 'auto', my: 4, boxShadow: '0 0 10px #ffd700' }} />

      {/* Hero */}
      <section style={{
        maxWidth: 1200,
        margin: '40px auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        position: 'relative',
        animation: 'fadeInUp 1.2s ease-out 0.5s both',
        borderRadius: '20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 900, position: 'relative' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            letterSpacing: '3px',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.6), 0 4px 20px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
            animation: 'titleGlow 3s ease-in-out infinite',
          }}>
            <TheaterComedy sx={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              color: '#ffd700',
              animation: 'iconDance 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
            }} />
            MJ2 Tribute — Live Shows & Bookings
            <MusicNote sx={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              color: '#ffd700',
              animation: 'iconDance 2s ease-in-out infinite reverse',
              filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
            }} />
          </h1>
          <p style={{
            marginTop: 20,
            color: '#e0e0e0',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            fontStyle: 'italic',
            lineHeight: 1.6,
            opacity: 0.9,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Authentic performances, high-energy choreography and soulful vocals — available for private events and public shows across South Wales.
          </p>
        </div>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,215,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '20px',
        }} />
        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </section>

      <Box sx={{ width: '60%', height: '3px', background: 'linear-gradient(90deg, #ffd700 0%, #fff 50%, #ffd700 100%)', mx: 'auto', my: 6, borderRadius: 2, boxShadow: '0 0 15px rgba(255,215,0,0.5)' }} />

      {/* Combined opening times + places */}
      <section style={{ maxWidth: 1100, margin: '12px auto 60px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ display: 'flex', gap: 18, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 18, flexDirection: 'column', alignItems: 'stretch' }}>
              {/* HomePageOpeningTimes */}
              <Box sx={{
                bgcolor: 'rgba(24,26,27,0.85)',
                backdropFilter: 'blur(15px)',
                color: '#fff',
                borderRadius: 5,
                boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
                border: '1px solid rgba(255,255,255,0.1)',
                p: 3,
                maxWidth: 380,
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
                  mb: 2,
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
              {/* HomePagePlaces */}
              <Box sx={{
                width: '100%',
                minHeight: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
              }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 4,
                      background: 'linear-gradient(90deg, #ffd700 0%, #fff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 32px #ffd700, 0 4px 24px rgba(255,215,0,0.18), 0 2px 8px #fff',
                      animation: 'pulseRedWhite 1.2s infinite',
                      fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
                      position: 'relative',
                      pb: 2,
                      transition: 'color 0.3s',
                    }}
                  >
                    Areas We Cover
                  </Typography>
                  <Box sx={{
                    width: '220px',
                    height: '6px',
                    mx: 'auto',
                    background: 'linear-gradient(90deg, #ff1744 0%, #fff 100%)',
                    borderRadius: 3,
                    boxShadow: '0 0 16px #ff1744',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,215,0,0.15) 100%)',
                      animation: 'shimmer 2s linear infinite',
                      opacity: 0.7,
                    }} />
                  </Box>
                  <style>{`
                    @keyframes pulseRedWhite {
                      0% { opacity: 1; filter: drop-shadow(0 0 16px #ff1744); }
                      50% { opacity: 0.7; filter: drop-shadow(0 0 32px #fff); }
                      100% { opacity: 1; filter: drop-shadow(0 0 16px #ff1744); }
                    }
                    @keyframes shimmer {
                      0% { left: -100%; }
                      100% { left: 100%; }
                    }
                  `}</style>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                    gap: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxWidth: 900,
                    mx: 'auto',
                    width: '100%',
                  }}
                >
                  {places.map((place, idx) => (
                    <Card key={idx} className="sparkle" sx={{
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
                      overflow: 'hidden',
                      bgcolor: 'rgba(24,26,27,0.85)',
                      backdropFilter: 'blur(15px)',
                      color: '#fff',
                      minWidth: 200,
                      maxWidth: 240,
                      mx: 'auto',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(255,215,0,0.1) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: 4,
                        pointerEvents: 'none',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.03)',
                        boxShadow: '0 20px 60px rgba(255,215,0,0.3), 0 0 30px rgba(255,215,0,0.2)',
                        border: '1px solid rgba(255,215,0,0.3)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}>
                      <Box sx={{
                        width: '100%',
                        height: 140,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
                          pointerEvents: 'none',
                        },
                      }}>
                        <img
                          src={place.image}
                          alt={place.name}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            filter: 'brightness(0.9) contrast(1.1) saturate(1.2)',
                            transition: 'transform 0.3s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      </Box>
                      {/* Area below image */}
                      <Box sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: 'rgba(35,37,38,0.9)',
                        textAlign: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                      }}>
                        <Typography variant="caption" sx={{ color: '#38ef7d', fontWeight: 700, fontSize: '0.9em', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                          {place.area}
                        </Typography>
                      </Box>
                      <CardContent sx={{ px: 2.5, py: 2.5 }}>
                        <Typography variant="subtitle1" sx={{
                          fontWeight: 700,
                          mb: 1,
                          fontSize: '1.1em',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}>
                          <TheaterComedy sx={{ fontSize: '1.3em', color: '#ffd700' }} /> {place.name}
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 600,
                          color: '#38ef7d',
                          fontSize: '1em',
                          mb: 1.5,
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}>
                          {place.price}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                          <Button
                            onClick={() => handleToggleLocation(place.name)}
                            variant="contained"
                            sx={{
                              px: 3,
                              py: 1,
                              borderRadius: 2,
                              fontWeight: 600,
                              fontSize: '0.9em',
                              textTransform: 'none',
                              background: selectedLocation === place.name
                                ? 'linear-gradient(135deg, #ffd700, #b8860b)'
                                : 'linear-gradient(135deg, rgba(35,37,38,0.8), rgba(68,68,68,0.8))',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#fff',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(255,215,0,0.4)',
                                background: selectedLocation === place.name
                                  ? 'linear-gradient(135deg, #b8860b, #ffd700)'
                                  : 'linear-gradient(135deg, rgba(68,68,68,0.9), rgba(35,37,38,0.9))',
                              },
                            }}
                          >
                            {selectedLocation === place.name ? 'Remove' : 'Add'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;