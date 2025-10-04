"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTheme } from '@mui/material/styles';
import { FormState } from './types';
import { packages, normalizeDateToISO } from './utils';

interface FinalReviewProps {
  form: FormState;
  submitting: boolean;
  recaptchaToken: string | null;
  handleRecaptchaChange: (token: string | null) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const FinalReview: React.FC<FinalReviewProps> = ({
  form,
  submitting,
  recaptchaToken,
  handleRecaptchaChange,
  handleSubmit
}) => {
  const theme = useTheme();

  const selectedPackage = packages.find(p => p.id === form.package);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
        Final Review - Confirm Your Booking
      </Typography>

      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
          Booking Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Package</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {selectedPackage?.name} - £{selectedPackage?.price}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Name</Typography>
            <Typography variant="body1">{form.name}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Email</Typography>
            <Typography variant="body1">{form.email}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Phone</Typography>
            <Typography variant="body1">{form.phone}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Location</Typography>
            <Typography variant="body1">{form.location}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Venue</Typography>
            <Typography variant="body1">{form.venue}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Date</Typography>
            <Typography variant="body1">{form.date?.format('DD/MM/YYYY')}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Time</Typography>
            <Typography variant="body1">{form.time?.format('HH:mm')}</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Message</Typography>
          <Typography variant="body1">{form.message || 'No additional message'}</Typography>
        </Box>
      </Card>

      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
        Security Verification
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleRecaptchaChange}
          theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          type="submit"
          disabled={submitting || !recaptchaToken}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #ff6b6b 100%)',
            px: 6,
            py: 2,
            borderRadius: 3,
            color: '#fff',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
            opacity: submitting ? 0.7 : 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #e0143f 0%, #ff5555 100%)',
              boxShadow: '0 10px 30px rgba(255, 23, 68, 0.4)',
              transform: submitting ? 'none' : 'translateY(-2px)'
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground
            }
          }}
          onClick={(e) => handleSubmit(e as any)}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : (
            'Confirm & Submit Booking'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default FinalReview;