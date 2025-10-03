import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import Link from 'next/link';

function Footer() {
  return (
    <footer style={{
      width: '100%',
      padding: '40px 20px',
      background: 'rgba(24,26,27,0.85)',
      backdropFilter: 'blur(15px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    }}>
      <style>{`
        @keyframes bounceHover {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) translateY(-2px); }
        }
        .social-icon {
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          animation: bounceHover 0.6s ease;
        }
      `}</style>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h5" sx={{ color: '#ffd700', fontWeight: 700, mb: 2 }}>
            MJ2 Studios
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>
            Professional tribute acts and live shows across South Wales.
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            © 2025 MJ2 Studios. All rights reserved.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'center' } }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            Quick Links
          </Typography>
          <Link href="/" passHref>
            <Typography variant="body2" sx={{ color: '#bbb', '&:hover': { color: '#ffd700' }, cursor: 'pointer' }}>
              Home
            </Typography>
          </Link>
          <Link href="/pages/about-us" passHref>
            <Typography variant="body2" sx={{ color: '#bbb', '&:hover': { color: '#ffd700' }, cursor: 'pointer' }}>
              About Us
            </Typography>
          </Link>
          <Link href="/pages/booking" passHref>
            <Typography variant="body2" sx={{ color: '#bbb', '&:hover': { color: '#ffd700' }, cursor: 'pointer' }}>
              Book Now
            </Typography>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'right' } }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            Contact Us
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#bbb' }}>
            <EmailIcon />
            <Typography variant="body2">coming soon</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#bbb' }}>
            <PhoneIcon />
            <Typography variant="body2">+44 7368 119079</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#bbb' }}>
            <LocationOnIcon />
            <Typography variant="body2">Bridgend, Pontycymer, UK</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'right' } }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            Follow Us
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="https://www.facebook.com/profile.php?id=61581338027108" passHref>
              <FacebookIcon className="social-icon" sx={{ color: '#4267B2', '&:hover': { color: '#fff' }, cursor: 'pointer' }} />
            </Link>
            <Link href="https://www.tiktok.com/@mj_the_2nd_shows?lang=en" passHref>
              <Typography variant="body2" className="social-icon" sx={{ color: '#000', background: '#fff', px: 1, py: 0.5, borderRadius: 1, fontWeight: 600, '&:hover': { background: '#f0f0f0' }, cursor: 'pointer' }}>
                TikTok
              </Typography>
            </Link>
          </Box>
          <Typography variant="body2" sx={{ color: '#bbb', mt: 1, fontStyle: 'italic' }}>
            Made with ❤️ by KimDog
          </Typography>
        </Box>
      </Box>
    </footer>
  );
}

export default Footer;