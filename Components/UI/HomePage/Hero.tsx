import React from 'react';
import Box from '@mui/material/Box';
import { TheaterComedy, MusicNote } from '@mui/icons-material';
import { TypeAnimation } from 'react-type-animation';

export default function Hero() {
  return (
    <Box sx={{
      maxWidth: 1200,
      mx: 'auto',
      p: {xs: '20px 10px', sm: '40px 20px'},
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      position: 'relative',
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
        }}/>
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
              flexWrap: 'nowrap',
              animation: 'titleGlow 3s ease-in-out infinite',
              height: '150px',
            }}
          >
            <TheaterComedy sx={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              color: '#ffd700',
              animation: 'iconDance 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))',
            }} />
            <div style={{ width: '600px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <TypeAnimation sequence={['MJ2 Tribute — Live Shows & Bookings', 2000, 'Authentic MJ Experience', 2000, 'Thrilling Performances Await', 2000, 'Unforgettable MJ Magic', 2000]} wrapper="span" cursor={true} repeat={Infinity} />
            </div>
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
    </Box>
  );
}