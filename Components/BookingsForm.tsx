"use client";
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Fade from '@mui/material/Fade';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, rtdb } from './firebaseClient';
import { ref, push, set, get } from 'firebase/database';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '@mui/material/styles';

const locations = ['Bridgend', 'Pontycymer', 'Sarn', 'Maesteg', 'Other'];

function parseTime(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    // try dd/mm/yyyy
    const dmy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
    const m = value.match(dmy);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
  }
  return null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  venue: string;
  date: Dayjs | null;
  time: Dayjs | null;
  message: string;
}

interface Props {
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
}


function ManageBookings({ selectedLocation, onLocationChange }: Props) {
  const theme = useTheme();
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', location: selectedLocation ?? '', venue: '', date: null, message: '', time: null });
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  const validate = (vals: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!vals.name.trim()) e.name = 'Name is required';
    if (!vals.email.trim()) {
      e.email = 'Email is required';
    } else {
      // simple email regex
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(vals.email)) e.email = 'Enter a valid email';
    }
    if (!vals.phone.trim()) {
      e.phone = 'Phone is required';
    } else {
      // very permissive phone check (digits, spaces, +, -)
      const phoneRe = /^[0-9+\-()\s]+$/;
      if (!phoneRe.test(vals.phone)) e.phone = 'Enter a valid phone number';
    }
    if (!vals.location.trim()) e.location = 'Location is required';
    if (!vals.venue.trim()) e.venue = 'Venue is required';
    if (!vals.date) {
      e.date = 'Date is required';
    }
    if (!vals.time) {
      e.time = 'Time is required';
    }
    if (!vals.message.trim()) e.message = 'Message is required';
    return e;
  };

  function normalizeDateToISO(date: Dayjs | null) {
    if (!date) return '';
    return date.format('YYYY-MM-DD');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) {
      setSubmissionError('Please fix the errors shown below.');
      setSnackMsg('Please fix validation errors before submitting.');
      setSnackSeverity('error');
      setOpenSnack(true);
      return;
    }

    setSubmitting(true);
    try {
      const isoDate = normalizeDateToISO(form.date);
      // Simplified submission without conflict check for now
      const { date, time, ...rest } = form;
      const payload = { ...rest, date: isoDate, time: form.time?.format('HH:mm') } as any;
      if (rtdb) {
        // write to Realtime Database under /bookings
        const bookingsRef = ref(rtdb, 'bookings');
        const newRef = push(bookingsRef);
        await set(newRef, { ...payload, createdAt: Date.now() });
      } else {
        // send to Firestore
        await addDoc(collection(db, 'bookings'), { ...payload, createdAt: serverTimestamp() });
      }

      // Send confirmation email
      try {
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e1e1e; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MJ2 Studios</h1>
            <p>Michael Jackson Tributes</p>
        </div>
        <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear ${form.name},</p>
            <p>Thank you for choosing MJ2 Studios for your Michael Jackson Tribute needs.</p>
            <p>We have received your booking details and will review them shortly. Our team will contact you within 24-48 hours to confirm your appointment and provide any additional information required.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> ${form.name}</li>
                <li><strong>Email:</strong> ${form.email}</li>
                <li><strong>Phone:</strong> ${form.phone}</li>
                <li><strong>Location:</strong> ${form.location}</li>
                <li><strong>Venue:</strong> ${form.venue}</li>
                <li><strong>Preferred Date:</strong> ${normalizeDateToISO(form.date)}</li>
                <li><strong>Preferred Time:</strong> ${form.time?.format('HH:mm')}</li>
            </ul>
            <p>If you have any questions in the meantime, please don't hesitate to contact us on our Website</p>
            <p>We look forward to working with you!</p>
            <p>Best regards,<br>The MJ2 Studios Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 MJ2 Studios. All rights reserved.</p>
            <p>Visit us at <a href="https://mj2-studios.co.uk">mj2-studios.co.uk</a></p>
        </div>
    </div>
</body>
</html>
        `;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.email,
            subject: 'Booking Confirmation - MJ2 Studios',
            body: emailBody
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't block success dialog for email failure
      }

      setSubmissionError(null);
      setOpenDialog(true);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      const message = err?.message ? `Submission failed: ${err.message}` : 'Submission failed — check console for details.';
      setSubmissionError(message);
      setSnackMsg(message);
      setSnackSeverity('error');
      setOpenSnack(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Keep form.location in sync with selectedLocation prop
  React.useEffect(() => {
    if (typeof selectedLocation === 'string') {
      setForm(prev => ({ ...prev, location: selectedLocation }));
    }
  }, [selectedLocation]);

  // When user edits the location field manually, notify parent if provided
  const handleLocationChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, location: val }));
    if (onLocationChange) onLocationChange(val);
  };

  const commonFieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 3,
      minHeight: 60,
      border: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
      },
      '&.Mui-focused': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 30px ${theme.palette.primary.main}4D`
      },
      '& .MuiOutlinedInput-input': { color: theme.palette.text.primary },
      '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
    },
    '& .MuiFormHelperText-root': { color: theme.palette.text.secondary, fontSize: '0.75rem' },
    '& .MuiFormLabel-root.Mui-focused': { color: theme.palette.primary.main }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          color: theme.palette.text.primary,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 20px 40px ${theme.palette.common.black}80`,
          maxWidth: 600,
          mx: 'auto',
          mt: { xs: 4, sm: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
      <Box>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          mb: 2,
          color: theme.palette.text.primary,
          textAlign: 'center',
          fontSize: { xs: '1.75rem', sm: '2.125rem' },
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, #ff6b6b)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Book Your Session
        </Typography>
        <Typography variant="body1" sx={{
          color: theme.palette.text.secondary,
          mb: 4,
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          Fill out the form below and we'll get back to you to confirm your booking.
        </Typography>
      </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="John Doe"
                variant="outlined"
                value={form.name}
                onChange={handleChange('name')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
                sx={commonFieldSx}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Email"
                placeholder="john@example.com"
                variant="outlined"
                value={form.email}
                onChange={handleChange('email')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
                sx={commonFieldSx}
                required
                error={!!errors.email}
                helperText={errors.email || 'We\'ll contact you to confirm'}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Phone"
                placeholder="01234 567890"
                variant="outlined"
                value={form.phone}
                onChange={handleChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
                sx={commonFieldSx}
                required
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Box>
            <Box>
              <FormControl fullWidth variant="outlined" error={!!errors.location} sx={commonFieldSx}>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  value={form.location}
                  onChange={handleLocationChange}
                  label="Location"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  }
                  sx={{
                    '& .MuiSelect-select': { color: theme.palette.text.primary },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                  }}
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc} sx={{ color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.location || 'Select your preferred location'}</FormHelperText>
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Venue"
                placeholder="Venue or address details"
                variant="outlined"
                value={form.venue}
                onChange={handleChange('venue')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
                sx={commonFieldSx}
                required
                error={!!errors.venue}
                helperText={errors.venue || 'Specific venue or address'}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Preferred Date"
                  value={form.date}
                  onChange={(newValue) => setForm(prev => ({ ...prev, date: newValue }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: commonFieldSx,
                      error: !!errors.date,
                      helperText: errors.date,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TimePicker
                  label="Preferred Time"
                  value={form.time}
                  onChange={(newValue) => setForm(prev => ({ ...prev, time: newValue }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: commonFieldSx,
                      error: !!errors.time,
                      helperText: errors.time || 'Use 24-hour format',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              </Box>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Message"
                placeholder="Any additional details..."
                variant="outlined"
                multiline
                rows={4}
                value={form.message}
                onChange={handleChange('message')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MessageOutlinedIcon sx={{ color: 'var(--muted)', alignSelf: 'flex-start', mt: 1 }} />
                    </InputAdornment>
                  )
                }}
                sx={commonFieldSx}
                required
                error={!!errors.message}
                helperText={errors.message}
              />
            </Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}
            >
              <Link href="/pages/contact-us">
                <Button
                  variant="text"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  Need Help? Contact Us
                </Button>
              </Link>
              <Box>
                <Button
                  type="submit"
                  disabled={submitting}
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
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Booking'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </LocalizationProvider>
        {(submissionError || Object.keys(errors).length > 0) && (
          <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
            <Box sx={{
              bgcolor: theme.palette.error.main + '1A', // 10% alpha
              color: theme.palette.error.main,
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.error.main}4D`, // 30% alpha
              backdropFilter: 'blur(10px)'
            }} role="alert">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Please check your input
              </Typography>
              {submissionError && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {submissionError}
                </Typography>
              )}
              {Object.keys(errors).length > 0 && (
                <Box component="ul" sx={{ ml: 2, mb: 0 }}>
                  {Object.entries(errors).map(([k, v]) => (
                    <li key={k}>
                      <Typography variant="body2">{v}</Typography>
                    </li>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
        <Snackbar
          open={openSnack}
          autoHideDuration={6000}
          onClose={() => setOpenSnack(false)}
        >
          <Alert onClose={() => setOpenSnack(false)} severity={snackSeverity} sx={{ width: '100%' }}>
            {snackMsg}
          </Alert>
        </Snackbar>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} aria-labelledby="success-dialog-title" aria-describedby="success-dialog-description">
          <DialogTitle id="success-dialog-title">Booking Submitted Successfully</DialogTitle>
          <DialogContent>
            <DialogContentText id="success-dialog-description">
              Your booking has been submitted. We'll contact you soon to confirm.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setForm({ name: '', email: '', phone: '', location: '', venue: '', date: null, message: '', time: null });
                setErrors({});
              }}
              color="primary"
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
   );
}

export default ManageBookings