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
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, rtdb } from './firebaseClient';
import { ref, push, set, get } from 'firebase/database';

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  time?: string;
  message: string;
}

interface Props {
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
}

function ManageBookings({ selectedLocation, onLocationChange }: Props) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', location: selectedLocation ?? '', date: '', message: '', time: '' });
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  const validate = (vals: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!vals.name.trim()) e.name = 'Name is required';
    if (!vals.email.trim()) {
      e.email = 'Email is required';
    } else {
      // simple email regex
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(vals.email)) e.email = 'Enter a valid email';
    }
    if (vals.phone && vals.phone.trim()) {
      // very permissive phone check (digits, spaces, +, -)
      const phoneRe = /^[0-9+\-()\s]+$/;
      if (!phoneRe.test(vals.phone)) e.phone = 'Enter a valid phone number';
    }
    if (vals.date && vals.date.trim()) {
      // Check DD/MM/YYYY or YYYY-MM-DD basic formats
      const d1 = /^\d{2}\/\d{2}\/\d{4}$/;
      const d2 = /^\d{4}-\d{2}-\d{2}$/;
      if (!d1.test(vals.date) && !d2.test(vals.date)) e.date = 'Use DD/MM/YYYY or YYYY-MM-DD';
    }
    // time is optional but if provided should be HH:MM
    if (vals.time && vals.time.trim()) {
      const t = /^\d{2}:\d{2}$/;
      if (!t.test(vals.time)) e.time = 'Use HH:MM format (24-hour)';
    }
    return e;
  };

  function normalizeDateToISO(dateStr: string) {
    if (!dateStr) return '';
    const d1 = /^\d{2}\/\d{2}\/\d{4}$/;
    const d2 = /^\d{4}-\d{2}-\d{2}$/;
    if (d2.test(dateStr)) return dateStr;
    if (d1.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    // fallback attempt
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return '';
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
  // If user provided a date+time, check for conflicts (same date and same time)
  const isoDate = normalizeDateToISO(form.date || '');
      if (isoDate && form.time) {
        if (rtdb) {
          if (rtdb) {
            const snapshot = await get(ref(rtdb, 'bookings'));
            const val = (snapshot && (snapshot as any).val && (snapshot as any).val()) || {};
            const conflict = Object.values(val).some((b: any) => {
              const bDate = b.date ? (b.date.indexOf('-') > -1 ? b.date.split('T')[0] : (b.date.indexOf('/') > -1 ? (() => { const [d,m,y]=b.date.split('/'); return `${y}-${m}-${d}` })() : b.date)) : '';
              return bDate === isoDate && (b.time || '') === form.time;
            });
            if (conflict) {
              throw new Error('Preferred time already taken on that date. Please choose another time.');
            }
          }
        } else {
          const q = query(collection(db, 'bookings'), where('date', '==', isoDate), where('time', '==', form.time));
          const snap = await getDocs(q);
          if (!snap.empty) {
            throw new Error('Preferred time already taken on that date. Please choose another time.');
          }
        }
      }
        const payload = { ...form, dateISO: isoDate ? isoDate : undefined } as any;
        if (rtdb) {
          // write to Realtime Database under /bookings
          const bookingsRef = ref(rtdb, 'bookings');
          const newRef = push(bookingsRef);
          await set(newRef, { ...payload, createdAt: Date.now() });
        } else {
          // send to Firestore
          await addDoc(collection(db, 'bookings'), { ...payload, createdAt: serverTimestamp() });
        }
  setSubmissionError(null);
  setSnackMsg('Booking submitted — we will contact you soon.');
      setSnackSeverity('success');
      setOpenSnack(true);
  setForm({ name: '', email: '', phone: '', location: '', date: '', message: '', time: '' });
      setErrors({});
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
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, location: val }));
    if (onLocationChange) onLocationChange(val);
  };

  return (
    <Box sx={{
      bgcolor: '#ffffff',
      color: '#232526',
      p: 4,
      borderRadius: 3,
      boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
      maxWidth: 720,
      mx: 'auto',
      mt: 6,
    }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#232526' }}>Booking Application</Typography>
      <Typography variant="body2" sx={{ color: '#555', mb: 2 }}>Fill in your details below to apply for a booking. This form will submit to our Secure Database</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
  <TextField label="Full name" placeholder="e.g. John Smith" variant="outlined" value={form.name} onChange={handleChange('name')} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#9e9e9e' }} /></InputAdornment>) }} sx={{ bgcolor: '#fafafa', borderRadius: 1 }} required error={!!errors.name} helperText={errors.name} />
  <TextField label="Email" placeholder="you@example.com" variant="outlined" value={form.email} onChange={handleChange('email')} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#9e9e9e' }} /></InputAdornment>) }} helperText={errors.email ?? 'We will contact you to confirm the booking'} sx={{ bgcolor: '#fafafa', borderRadius: 1 }} required error={!!errors.email} />
  <TextField label="Phone" placeholder="01234 567890" variant="outlined" value={form.phone} onChange={handleChange('phone')} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#9e9e9e' }} /></InputAdornment>) }} sx={{ bgcolor: '#fafafa', borderRadius: 1 }} error={!!errors.phone} helperText={errors.phone} />
        <TextField label="Location" placeholder="Town or venue" variant="outlined" value={form.location} onChange={handleLocationChange} sx={{ bgcolor: '#fafafa', borderRadius: 1 }} />
  <TextField label="Preferred Date" placeholder="DD/MM/YYYY" variant="outlined" value={form.date} onChange={handleChange('date')} sx={{ bgcolor: '#fafafa', borderRadius: 1 }} error={!!errors.date} helperText={errors.date} />
  <TextField
    label="Preferred Time"
    type="time"
    variant="outlined"
    value={form.time}
    onChange={handleChange('time')}
    sx={{ bgcolor: '#fafafa', borderRadius: 1 }}
    error={!!errors.time}
    helperText={errors.time ?? 'Optional — use 24-hour format (HH:MM)'}
    inputProps={{ step: 300 }}
  />
        <TextField label="Message" variant="outlined" multiline rows={4} fullWidth value={form.message} onChange={handleChange('message')} sx={{ gridColumn: '1 / -1', bgcolor: '#fafafa', borderRadius: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gridColumn: '1 / -1' }}>
          <Button type="submit" disabled={submitting} variant="contained" sx={{ background: 'linear-gradient(90deg,#232526,#444)', px: 4, py: 1.2, borderRadius: 2, color: '#fff', opacity: submitting ? 0.7 : 1, '&:hover': { transform: submitting ? 'none' : 'translateY(-2px)', boxShadow: submitting ? 'none' : '0 8px 24px rgba(0,0,0,0.12)' } }}>{submitting ? 'Submitting...' : 'Submit'}</Button>
        </Box>
      </Box>
      {/* Inline error panel below the form */}
      {submissionError || Object.keys(errors).length ? (
        <Box sx={{ mt: 2, maxWidth: 720, mx: 'auto', color: '#fff' }}>
          <Box sx={{ bgcolor: '#ffebee', color: '#b00020', p: 2, borderRadius: 1 }}>
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
    </Box>
  );
}

export default ManageBookings