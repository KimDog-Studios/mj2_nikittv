"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import HomePageInfo from './HomePageInfo';
import Hero from './Hero';
import HomePageOpeningTimes from './HomePageOpeningTimes';
import HomePagePlaces from './HomePagePlaces';
import { openingTimes, places, getCurrentTimeParts, getOpenStatus } from './utils';

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
        body {
          cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMCIgZmlsbD0iI2ZmZDcwMCIvPjwvc3ZnPg=='), auto;
        }
        .glitter {
          position: relative;
        }
        .glitter::before {
          content: '✨';
          position: absolute;
          top: -10px;
          right: -10px;
          animation: glitter 1s infinite;
          font-size: 1.5em;
        }
        @keyframes glitter {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <HomePageInfo />
      <Hero />
      <Box sx={{ width: '60%', height: '3px', background: 'linear-gradient(90deg, #ffd700 0%, #fff 50%, #ffd700 100%)', mx: 'auto', my: 6, borderRadius: 2, boxShadow: '0 0 15px rgba(255,215,0,0.5)' }} />
      {/* Combined opening times + places */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', my: '12px auto 60px', p: {xs: '10px', sm: '20px'}, display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ display: 'flex', gap: 18, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 18, flexDirection: 'column', alignItems: 'stretch' }}>
              <HomePageOpeningTimes currentTime={currentTime} mounted={mounted} openStatus={openStatus} openingTimes={openingTimes} todayIdx={todayIdx} router={router} />
              <HomePagePlaces places={places} selectedLocation={selectedLocation} onToggleLocation={handleToggleLocation} />
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
}

export default HomePage;