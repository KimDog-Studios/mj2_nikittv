"use client";
import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const places = [
  {
    name: 'Bridgend',
    area: 'Wales',
    price: '£?? | Per Show',
    image: 'https://cdn.britannica.com/29/144829-050-35D6B000/Bridgend-Wales.jpg',
  },
  {
    name: 'Pontycymer',
    area: 'Wales',
    price: '£?? | Per Show',
    image: 'https://alchetron.com/cdn/pontycymer-f52ca3b6-835b-43b7-95b7-26d697b9633-resize-750.jpeg',
  },
  {
    name: 'Sarn',
    area: 'Wales',
    price: '£?? | Per Show',
    image: 'https://a0.muscache.com/im/pictures/INTERNAL/INTERNAL-Cardiff/original/c6c46195-54f2-49c1-ad61-13d7fb26514c.jpeg',
  },
];

function HomePagePlaces() {
  return (
    <Box sx={{
      width: '100%',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#181A1B',
      py: 8,
    }}>
      <Box sx={{ textAlign: 'center', mb: 7 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: 4,
            background: 'linear-gradient(90deg, #ff1744 0%, #fff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 32px #ff1744, 0 4px 24px rgba(255,23,68,0.18), 0 2px 8px #fff',
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
            background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,23,68,0.15) 100%)',
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
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ maxWidth: 900 }}>
        {places.map((place, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
              overflow: 'hidden',
              bgcolor: '#232526',
              color: '#fff',
              minWidth: 220,
              maxWidth: 240,
              mx: 'auto',
              transition: 'transform 0.18s',
              '&:hover': {
                transform: 'scale(1.04)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
              },
            }}>
              <Box sx={{ width: '100%', height: 120, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#222' }}>
                <img
                  src={place.image}
                  alt={place.name}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', filter: 'brightness(0.92) contrast(1.08)', border: 0 }}
                />
              </Box>
              {/* Area below image, outside image container */}
              <Box sx={{ px: 2, py: 1, bgcolor: '#232526', textAlign: 'center', borderBottom: '1px solid #222' }}>
                <Typography variant="caption" sx={{ color: '#38ef7d', fontWeight: 700, fontSize: '1em', letterSpacing: 1 }}>
                  {place.area}
                </Typography>
              </Box>
              <CardContent sx={{ px: 2, py: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.08em', color: '#fff' }}>{place.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#38ef7d', fontSize: '1em' }}>{place.price}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomePagePlaces