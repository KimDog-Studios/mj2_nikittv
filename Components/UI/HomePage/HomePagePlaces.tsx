import React from 'react';
import { useRouter } from 'next/navigation';
import { Place } from './types';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { TheaterComedy } from '@mui/icons-material';

interface Props {
  places: Place[];
  selectedLocation: string;
  onToggleLocation: (name: string) => void;
}

export default function HomePagePlaces({ places, selectedLocation, onToggleLocation }: Props) {
  const router = useRouter();

  const handleAddPlace = (placeName: string) => {
    // Navigate to booking page with location pre-selected
    router.push(`/pages/booking?location=${encodeURIComponent(placeName)}`);
  };

  return (
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
          <Card key={idx} className="sparkle glitter" sx={{
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
              transform: 'perspective(1000px) translateY(-8px) scale(1.03) rotateX(5deg) rotateY(5deg)',
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
              <Image
                src={place.image}
                alt={place.name}
                fill
                objectFit="cover"
                style={{
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
                  onClick={() => selectedLocation === place.name ? onToggleLocation(place.name) : handleAddPlace(place.name)}
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
  );
}