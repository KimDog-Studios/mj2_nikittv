import React from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';

function BookingStatusPage() {
  const theme = useTheme();
  const router = useRouter();
  const { bookingId } = router.query;

  return (
    <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative' }}>
      <style>{`
        body {
          background: linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%);
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        animation: 'fadeInUp 1s ease-out',
      }}>
        <Card sx={{
          maxWidth: 600,
          width: '100%',
          bgcolor: 'rgba(24,26,27,0.9)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          textAlign: 'center',
        }}>
          <CardContent sx={{ p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4rem', color: '#4caf50', mb: 2 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Booking Submitted Successfully!
            </Typography>
            <Typography variant="body1" sx={{ color: '#bbb', mb: 3 }}>
              Thank you for your booking. Your request has been received and is being processed.
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
                Booking ID
              </Typography>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace', bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                {bookingId || 'Loading...'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              Status: <strong style={{ color: '#ffd700' }}>Pending Confirmation</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mt: 2 }}>
              You will receive an email confirmation shortly. Our team will contact you within 24-48 hours to finalize the details.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default BookingStatusPage;