import React from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Star } from '@mui/icons-material';

export default function HomePageInfo() {
  return (
    <div>
      <Box sx={{
        width: '100%',
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
        background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(26,26,46,0.1) 50%, rgba(255,215,0,0.05) 100%)',
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
        <Box sx={{ display: 'flex', gap: {xs: 1, sm: 2}, mt: 3, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ width: {xs: 120, sm: 160}, height: 120, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative' }}>
            <Image src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Pic1.png" alt="Pic1" fill objectFit="cover" />
          </Box>
          <Box sx={{ width: {xs: 120, sm: 160}, height: 120, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative' }}>
            <Image src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Pic2.png" alt="Pic2" fill objectFit="cover" />
          </Box>
          <Box sx={{ width: {xs: '90%', sm: 360}, height: {xs: 200, sm: 280}, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/tWxn09QgGGg?autoplay=1&mute=1&loop=1&playlist=tWxn09QgGGg&controls=1"
              title="MJ2 Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            ></iframe>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '80%', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #ffd700 50%, transparent 100%)', mx: 'auto', my: 4, boxShadow: '0 0 10px #ffd700' }} />
    </div>
  );
}