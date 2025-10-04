"use client";
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseClient';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function ContactForm() {
  const [form, setForm] = useState<ContactFormState>({ name: '', email: '', phone: '', message: '' });
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (key: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  const validate = (vals: ContactFormState) => {
    const e: Partial<Record<keyof ContactFormState, string>> = {};
    if (!vals.name.trim()) e.name = 'Name is required';
    if (!vals.email.trim()) {
      e.email = 'Email is required';
    } else {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(vals.email)) e.email = 'Enter a valid email';
    }
    if (vals.phone && vals.phone.trim()) {
      const phoneRe = /^[0-9+\-()\s]+$/;
      if (!phoneRe.test(vals.phone)) e.phone = 'Enter a valid phone number';
    }
    if (!vals.message.trim()) e.message = 'Message is required';
    return e;
  };

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
      await addDoc(collection(db, 'contacts'), { ...form, createdAt: serverTimestamp() });
      setSubmissionError(null);
      setOpenDialog(true);
    } catch (err: unknown) {
      console.error('Contact submission error:', err);
      const message = err instanceof Error && err.message ? `Submission failed: ${err.message}` : 'Submission failed — check console for details.';
      setSubmissionError(message);
      setSnackMsg(message);
      setSnackSeverity('error');
      setOpenSnack(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{
      bgcolor: '#1f2937',
      color: '#f9fafb',
      p: { xs: 3, sm: 4 },
      borderRadius: 4,
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      maxWidth: 800,
      mx: 'auto',
      mt: 6,
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      },
    }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#f9fafb', textAlign: 'center' }}>Contact Us</Typography>
      <Typography variant="body1" sx={{ color: '#d1d5db', mb: 3, textAlign: 'center', lineHeight: 1.6 }}>Get in touch with us. We&apos;ll get back to you as soon as possible.</Typography>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#f9fafb', mb: 1 }}>Contact Information</Typography>
        <Typography variant="body2" sx={{ color: '#d1d5db' }}>Email: coming soon</Typography>
        <Typography variant="body2" sx={{ color: '#d1d5db' }}>Phone: +44 7368 119079</Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        <TextField label="Name" placeholder="Your full name" variant="outlined" value={form.name} onChange={handleChange('name')} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} required error={!!errors.name} helperText={errors.name} />
        <TextField label="Email" placeholder="your.email@example.com" variant="outlined" value={form.email} onChange={handleChange('email')} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} required error={!!errors.email} helperText={errors.email} />
        <TextField label="Phone" placeholder="Optional" variant="outlined" value={form.phone} onChange={handleChange('phone')} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} error={!!errors.phone} helperText={errors.phone} />
        <TextField label="Message" variant="outlined" multiline rows={4} fullWidth value={form.message} onChange={handleChange('message')} sx={{ gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} required error={!!errors.message} helperText={errors.message} />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gridColumn: '1 / -1' }}>
          <Button type="submit" disabled={submitting} variant="contained" sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', px: 5, py: 1.5, borderRadius: 3, color: '#fff', fontWeight: 600, opacity: submitting ? 0.7 : 1, transition: 'all 0.2s ease-in-out', '&:hover': { transform: submitting ? 'none' : 'translateY(-1px)', boxShadow: submitting ? 'none' : '0 10px 25px rgba(59, 130, 246, 0.3)' }, '&:active': { transform: 'translateY(0)' } }}>{submitting ? <> <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Sending... </> : 'Send Message'}</Button>
        </Box>
      </Box>
      {/* Inline error panel below the form */}
      {submissionError || Object.keys(errors).length ? (
        <Box sx={{ mt: 2, maxWidth: 720, mx: 'auto', color: '#fff' }}>
          <Box sx={{ bgcolor: '#451a1a', color: '#fca5a5', p: 3, borderRadius: 3, border: '1px solid #7f1d1d' }} role="alert">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>There are problems with your submission</Typography>
            {submissionError ? <Typography variant="body2" sx={{ mb: 1 }}>{submissionError}</Typography> : null}
            {Object.keys(errors).length ? (
              <Box component="ul" sx={{ ml: 2, mb: 0 }}>
                {Object.entries(errors).map(([k, v]) => (
                  <li key={k}><Typography variant="body2">{k}: {v}</Typography></li>
                ))}
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}
      <Snackbar open={openSnack} autoHideDuration={6000} onClose={() => setOpenSnack(false)}>
        <Alert onClose={() => setOpenSnack(false)} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} aria-labelledby="success-dialog-title" aria-describedby="success-dialog-description">
        <DialogTitle id="success-dialog-title">Message Sent Successfully</DialogTitle>
        <DialogContent>
          <DialogContentText id="success-dialog-description">
            Thank you for contacting us. We&apos;ll get back to you soon.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setForm({ name: '', email: '', phone: '', message: '' }); setErrors({}); }} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ContactForm