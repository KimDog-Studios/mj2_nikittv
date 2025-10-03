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
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const members = [
  { name: 'Liam Paterson', role: 'Manager/Lead Dancer', bio: 'Founded the company and is the Main Dancer.', avatar: 'https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Pictures/NikiAvatar.png' },
  { name: 'KimDog', role: 'Social Media Manager', bio: 'Handles all the Social Media and Website side of things.', avatar: 'https://raw.githubusercontent.com/KimDog-Studios/KimDog-Studios/main/KimDog.png' },
  { name: 'Joel Girth', role: 'Technician', bio: 'Fixes everything to do with Running and maintaining the shows.', avatar: 'https://raw.githubusercontent.com/KimDog-Studios/KimDog-Studios/main/KimDog.png' },
];

const gallery = [
  'https://cdn.i-scmp.com/sites/default/files/styles/768x768/public/d8/images/canvas/2021/08/27/6aab1fe1-a152-4216-a41e-c3ca9e41fe54_15d28a3f.jpg?itok=0CLKzyFR&v=1630056283',
];

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #181A1B 0%, rgba(255,215,0,0.1) 50%, #181A1B 100%)', color: 'var(--foreground)', minHeight: '72vh', py: 8, px: { xs: 3, md: 8 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MusicNoteIcon sx={{ mr: 1, color: '#FFD700', fontSize: 40 }} />
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: '2.5rem' }}>About MJ2 Tribute</Typography>
          </Box>
          <Box className="hero-accent" sx={{ width: 200, mb: 2, background: 'linear-gradient(90deg,#FFD700 0%, #fff0 100%)' }} />
          <Typography variant="h6" className="fade-in-up" sx={{ color: '#ddd', mb: 3, animation: 'fadeInUp 0.6s ease 0.1s both' }}>We celebrate the music, moves and magic of Michael Jackson — performed with respect, energy and showmanship.</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 440px' }, gap: 3, alignItems: 'start' }}>
          <Box className="fade-in-up" sx={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
            <Paper elevation={8} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD700', mb: 1 }}>Our Mission</Typography>
              <Typography variant="body1" sx={{ color: '#ccc', mb: 2, lineHeight: 1.6 }}>
                MJ2 Tribute is made by lifelong fans and performers who want to bring the experience of the timeless music of Michael Jackson to fans old and new. We combine live vocals, authentic choreography and a tight band to recreate the energy of the classics while keeping the performances fresh.
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }}>
                We treat the music with care and put audience safety and enjoyment first. Our team rehearses extensively and adapts setlists to suit event types — from intimate community halls to club nights and festival stages.
              </Typography>
            </Paper>
          </Box>

          <Box className="fade-in-up" sx={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <ImageList cols={2} gap={8} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {gallery.map((src, i) => (
                <ImageListItem key={i}>
                  <Image src={src} alt={`gallery-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} width={400} height={300} />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>

        </Box>

        <Box sx={{ mt: 3 }} className="fade-in-up" style={{ animation: 'fadeInUp 0.6s ease 0.35s both' }}>
          <Paper elevation={8} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD700', mb: 2, textAlign: 'center' }}>Watch Our Performance</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/"
                title="MJ2 Tribute Performance"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ maxWidth: '100%', borderRadius: 8 }}
              ></iframe>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mt: 3 }} className="fade-in-up" style={{ animation: 'fadeInUp 0.6s ease 0.4s both' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD700', mb: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Meet the Team</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {members.map((m, idx) => (
              <Paper key={idx} elevation={6} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.1)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(255,215,0,0.2)' } }}>
                <Avatar src={m.avatar} alt={m.name} sx={{ width: 64, height: 64, borderRadius: 2, border: '2px solid #FFD700' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff' }}>{m.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 700 }}>{m.role}</Typography>
                  <Typography variant="body2" sx={{ color: '#bbb', mt: 0.5 }}>{m.bio}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 3 }} className="fade-in-up" style={{ animation: 'fadeInUp 0.6s ease 0.5s both' }}>
          <Paper elevation={8} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFD700' }}>Book us for your next event</Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>We perform full tribute shows, themed sets and private bookings. Tell us about your event and we will respond promptly.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Link href="/pages/booking">
                  <Button variant="contained" sx={{ background: 'linear-gradient(90deg,#FFD700,#FFA500)', color: '#000', fontWeight: 800, borderRadius: 2, px: 3, boxShadow: '0 4px 8px rgba(255,215,0,0.3)', '&:hover': { transform: 'scale(1.05)' } }}>Book Now</Button>
                </Link>
                <Link href="/pages/contact">
                  <Button variant="outlined" sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFA500', color: '#FFA500' } }}>Contact Us</Button>
                </Link>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}