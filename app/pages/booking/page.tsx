"use client";
import { BookingForm } from '@/Components/Booking/Form'
import React, { Suspense } from 'react'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Star from '@mui/icons-material/Star';
import MusicNote from '@mui/icons-material/MusicNote';
import TheaterComedy from '@mui/icons-material/TheaterComedy';

function page() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative' }}>
      {/* Floating Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', animation: 'float1 6s ease-in-out infinite', opacity: 0.1 }}>
        <MusicNote sx={{ fontSize: '3rem', color: '#ffd700' }} />
      </div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', animation: 'float2 8s ease-in-out infinite', opacity: 0.1 }}>
        <TheaterComedy sx={{ fontSize: '2.5rem', color: '#ffd700' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '30%', left: '8%', animation: 'float3 10s ease-in-out infinite', opacity: 0.1 }}>
        <Star sx={{ fontSize: '2rem', color: '#ffd700' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '20%', right: '5%', animation: 'float1 7s ease-in-out infinite', opacity: 0.1 }}>
        <MusicNote sx={{ fontSize: '2.5rem', color: '#ffd700' }} />
      </div>
      <style>{`
        body {
          background: linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%);
        }
        @keyframes titleGlow {
          0%, 100% { textShadow: '0 0 20px rgba(255,215,0,0.5)'; }
          50% { textShadow: '0 0 40px rgba(255,215,0,0.8), 0 0 60px rgba(255,215,0,0.6)'; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
      `}</style>
      {/* Header */}
      <Box sx={{
        width: '100%',
        minHeight: '30vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: { xs: 1, sm: 2 },
        background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 4,
        mx: { xs: 1, sm: 2 },
        my: 4,
        animation: 'fadeInUp 1s ease-out',
        position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', top: 20, left: 20, opacity: 0.3, display: { xs: 'none', sm: 'block' } }}>
          <Star sx={{ fontSize: '2rem', color: '#ffd700' }} />
        </Box>
        <Box sx={{ position: 'absolute', top: 40, right: 30, opacity: 0.3, display: { xs: 'none', sm: 'block' } }}>
          <MusicNote sx={{ fontSize: '2.5rem', color: '#ffd700' }} />
        </Box>
        <Box sx={{ position: 'absolute', bottom: 30, left: 30, opacity: 0.3, display: { xs: 'none', sm: 'block' } }}>
          <TheaterComedy sx={{ fontSize: '2rem', color: '#ffd700' }} />
        </Box>
        <Box sx={{ position: 'absolute', bottom: 20, right: 20, opacity: 0.3, display: { xs: 'none', sm: 'block' } }}>
          <Star sx={{ fontSize: '1.5rem', color: '#ffd700' }} />
        </Box>
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1, animation: 'titleGlow 3s ease-in-out infinite' }}>
          <TheaterComedy sx={{ fontSize: '2rem', color: '#ffd700' }} />
          Book Your MJ2 Show
          <MusicNote sx={{ fontSize: '2rem', color: '#ffd700' }} />
        </Typography>
        <Typography variant="body1" sx={{ color: '#bbb', maxWidth: 760 }}>
          Secure your spot for an unforgettable performance. Fill out the form below to get started.
        </Typography>
      </Box>

      {/* Form Section */}
      <Box id="booking-form" sx={{
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
        <Suspense fallback={<div>Loading...</div>}>
          <BookingForm />
        </Suspense>
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
      </Box>

      {/* FAQ Section */}
      <Box sx={{
        maxWidth: 1000,
        margin: '40px auto',
        padding: { xs: '20px 10px', sm: '40px 20px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        position: 'relative',
        animation: 'fadeInUp 1.4s ease-out 1s both',
      }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 2 }}>
          Booking FAQs
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 800 }}>
          <Accordion sx={{ bgcolor: 'rgba(24,26,27,0.85)', backdropFilter: 'blur(15px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd700' }} />} aria-controls="faq1-content" id="faq1-header">
              <Typography sx={{ fontWeight: 600 }}>How long does it take to confirm my booking?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>We aim to confirm bookings within 24-48 hours. You&apos;ll receive an email confirmation once approved.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ bgcolor: 'rgba(24,26,27,0.85)', backdropFilter: 'blur(15px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd700' }} />} aria-controls="faq2-content" id="faq2-header">
              <Typography sx={{ fontWeight: 600 }}>Can I change or cancel my booking?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Yes, please contact us as soon as possible via email or phone to make changes. Cancellations are accepted up to 48 hours before the event for a full refund.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ bgcolor: 'rgba(24,26,27,0.85)', backdropFilter: 'blur(15px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd700' }} />} aria-controls="faq3-content" id="faq3-header">
              <Typography sx={{ fontWeight: 600 }}>What areas do you cover?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>We perform across South Wales, including Bridgend, Pontycymer, Sarn, and Maesteg. If your location isn&apos;t listed, contact us to discuss availability.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ bgcolor: 'rgba(24,26,27,0.85)', backdropFilter: 'blur(15px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd700' }} />} aria-controls="faq4-content" id="faq4-header">
              <Typography sx={{ fontWeight: 600 }}>How do I pay for the booking?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Payment details will be provided upon confirmation. We accept various methods including bank transfer and card payments.</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ bgcolor: 'rgba(24,26,27,0.85)', backdropFilter: 'blur(15px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ffd700' }} />} aria-controls="faq5-content" id="faq5-header">
              <Typography sx={{ fontWeight: 600 }}>What should I prepare for the show?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Ensure the venue is ready with adequate space, sound equipment if needed, and parking. We&apos;ll discuss specifics during confirmation.</Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{
        maxWidth: 1200,
        margin: '40px auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        position: 'relative',
        animation: 'fadeInUp 1.6s ease-out 1.2s both',
      }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 2 }}>
          What Our Clients Say
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          <Box sx={{
            bgcolor: 'rgba(24,26,27,0.85)',
            backdropFilter: 'blur(15px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 3,
            maxWidth: 300,
            textAlign: 'center',
            animation: 'fadeInUp 1.8s ease-out 1.4s both',
            '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' }
          }}>
            <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
              "MJ2's performance was absolutely phenomenal! The energy, the dancing, the voice – it was like Michael Jackson himself was there."
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#ffd700', fontWeight: 600 }}>
              Sarah T., Bridgend
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} sx={{ color: '#ffd700', fontSize: '1rem' }} />
              ))}
            </Box>
          </Box>
          <Box sx={{
            bgcolor: 'rgba(24,26,27,0.85)',
            backdropFilter: 'blur(15px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 3,
            maxWidth: 300,
            textAlign: 'center',
            animation: 'fadeInUp 2s ease-out 1.6s both',
            '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' }
          }}>
            <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
              "Booked for our wedding and it was the highlight of the night! Guests are still talking about it weeks later."
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#ffd700', fontWeight: 600 }}>
              Mike R., Maesteg
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} sx={{ color: '#ffd700', fontSize: '1rem' }} />
              ))}
            </Box>
          </Box>
          <Box sx={{
            bgcolor: 'rgba(24,26,27,0.85)',
            backdropFilter: 'blur(15px)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 3,
            maxWidth: 300,
            textAlign: 'center',
            animation: 'fadeInUp 2.2s ease-out 1.8s both',
            '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' }
          }}>
            <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
              "Incredible attention to detail and professionalism. The kids loved it – definitely recommending to friends!"
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#ffd700', fontWeight: 600 }}>
              Emma L., Pontycymer
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} sx={{ color: '#ffd700', fontSize: '1rem' }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

    </div>
  )
}

export default page