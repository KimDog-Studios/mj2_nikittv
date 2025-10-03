"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// use Box-based CSS grid instead of MUI Grid for simpler typing
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Link from 'next/link';
import Image from 'next/image';

const members = [
  { name: 'Liam Paterson', role: 'Manager/Lead Dancer', bio: 'Founded the company and is the Main Dancer.', avatar: '/Pic1.png' },
  { name: 'KimDog', role: 'Social Media Manager', bio: 'Handles all the Social Media and Website side of things.', avatar: 'https://raw.githubusercontent.com/KimDog-Studios/KimDog-Studios/main/KimDog.png' },
];

const gallery = [
  'https://www.creativefabrica.com/wp-content/uploads/2021/07/16/Work-in-progress-icon-Graphics-14825346-1.jpg',
];

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: 'var(--background)', color: 'var(--foreground)', minHeight: '72vh', py: 8, px: { xs: 3, md: 8 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'var(--accent)', mb: 1 }}>About MJ2 Tribute</Typography>
          <Box className="hero-accent" sx={{ width: 160, mb: 2 }} />
          <Typography variant="h6" className="fade-in-up" sx={{ color: '#ddd', mb: 3 }}>We celebrate the music, moves and magic of Michael Jackson — performed with respect, energy and showmanship.</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 440px' }, gap: 3, alignItems: 'start' }}>
          <Box>
            <Paper elevation={6} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>Our Mission</Typography>
              <Typography variant="body1" sx={{ color: '#ccc', mb: 2, lineHeight: 1.6 }}>
                MJ2 Tribute is made by lifelong fans and performers who want to bring the experience of the timeless music of Michael Jackson to fans old and new. We combine live vocals, authentic choreography and a tight band to recreate the energy of the classics while keeping the performances fresh.
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                We treat the music with care and put audience safety and enjoyment first. Our team rehearses extensively and adapts setlists to suit event types — from intimate community halls to club nights and festival stages.
              </Typography>
            </Paper>
          </Box>

          <Box>
            <ImageList cols={1} gap={8} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {gallery.map((src, i) => (
                <ImageListItem key={i}>
                  <Image src={src} alt={`gallery-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} width={800} height={450} />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>

        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>Meet the Team</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {members.map((m, idx) => (
              <Paper key={idx} elevation={4} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Avatar src={m.avatar} alt={m.name} sx={{ width: 64, height: 64, borderRadius: 2 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{m.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#38ef7d', fontWeight: 700 }}>{m.role}</Typography>
                  <Typography variant="body2" sx={{ color: '#bbb', mt: 0.5 }}>{m.bio}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Paper elevation={6} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Book us for your next event</Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>We perform full tribute shows, themed sets and private bookings. Tell us about your event and we will respond promptly.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Link href="/booking">
                  <Button variant="contained" sx={{ background: 'linear-gradient(90deg,#f7971e,#ffd200)', color: '#232526', fontWeight: 800, borderRadius: 2, px: 3 }}>Book Now</Button>
                </Link>
                <Link href="/contact-us">
                  <Button variant="outlined" sx={{ borderColor: '#444', color: '#fff' }}>Contact Us</Button>
                </Link>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}