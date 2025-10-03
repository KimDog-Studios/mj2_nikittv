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
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, rtdb } from './firebaseClient';
import { ref, push, set, get } from 'firebase/database';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

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
  date: Dayjs | null;
  time: Dayjs | null;
  message: string;
}

interface Props {
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
}

function ManageBookings({ selectedLocation, onLocationChange }: Props) {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', location: selectedLocation ?? '', date: null, message: '', time: null });
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
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      if (!re.test(vals.email)) e.email = 'Enter a valid email';
    }
    if (vals.phone && vals.phone.trim()) {
      // very permissive phone check (digits, spaces, +, -)
      const phoneRe = /^[0-9+\-()\s]+$/;
      if (!phoneRe.test(vals.phone)) e.phone = 'Enter a valid phone number';
    }
    if (!vals.date) {
      e.date = 'Date is required';
    } else if (vals.date.isBefore(dayjs(), 'day')) {
      e.date = 'Date must be in the future';
    }
    // time is optional
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
  // First: block if this customer already has an active/upcoming booking
  // We'll consider a booking active/upcoming if its end time is in the future.
  const now = new Date();
  const DEFAULT_DURATION_MS = 1000 * 60 * 60 * 2; // 2 hours default
  const isoDate = normalizeDateToISO(form.date);
  if (form.name && form.name.trim()) {
    const nameLower = form.name.trim().toLowerCase();
    if (rtdb) {
      const snapshotAll = await get(ref(rtdb, 'bookings'));
      const valAll = (snapshotAll && (snapshotAll as any).val && (snapshotAll as any).val()) || {};
      const entries: any[] = Object.values(valAll);
      for (const b of entries) {
        if (!b || !b.name) continue;
        if ((b.name || '').toString().trim().toLowerCase() !== nameLower) continue;
        // compute normalized date for existing booking
        const bIso = normalizeDateToISO(b.date || '');
        // If both bookings have a date and they match => block
        if (isoDate && bIso && isoDate === bIso) {
          // if both provide times, check time equality/overlap
          if (form.time && b.time) {
            if (form.time.format('HH:mm') === b.time) {
              throw new Error('You already have a booking with the same name and time on that date. Please choose another date or time.');
            }
            // optional: overlap logic could go here; for now, equal times are blocked
          } else {
            // either booking is full-day or one has no time — treat as conflict
            throw new Error('You already have a booking on that date. Please wait until it is completed before requesting another.');
          }
        }
        // If no date provided (or dates don't match), fallback to blocking active/upcoming bookings
        let start = null as Date | null;
        if (bIso) {
          const [yy, mm, dd] = bIso.split('-').map(Number);
          if (b.time) {
            const [hh, min] = (b.time || '00:00').split(':').map(Number);
            start = new Date(yy, mm - 1, dd, hh || 0, min || 0, 0);
          } else {
            start = new Date(yy, mm - 1, dd, 0, 0, 0);
          }
        } else if (b.createdAt) {
          if (typeof b.createdAt === 'number') start = new Date(b.createdAt);
          else if (b.createdAt?.toDate) start = b.createdAt.toDate();
        }
        const end = start ? (b.end ? parseTime(b.end) ?? new Date(start.getTime() + DEFAULT_DURATION_MS) : new Date(start.getTime() + DEFAULT_DURATION_MS)) : null;
        if (end && end.getTime() > now.getTime()) {
          throw new Error('You already have an active or upcoming booking. Please wait until that booking is completed before requesting another.');
        }
      }
    } else {
      // Firestore: try server-side equality query first, then fallback to client-side case-insensitive scan if nothing returned
      try {
        const qByName = query(collection(db, 'bookings'), where('name', '==', form.name));
        const snapByName = await getDocs(qByName);
        let docsToCheck: any[] = [];
        if (!snapByName.empty) {
          docsToCheck = snapByName.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          // fallback: fetch all bookings and filter case-insensitively (small apps only)
          const allSnap = await getDocs(collection(db, 'bookings'));
          docsToCheck = allSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((b: any) => (b.name || '').toString().trim().toLowerCase() === nameLower);
        }
        for (const docB of docsToCheck) {
          const b: any = docB;
          if (!b || !b.name) continue;
          if ((b.name || '').toString().trim().toLowerCase() !== nameLower) continue;
          const bIso = normalizeDateToISO(b.date || '');
          if (isoDate && bIso && isoDate === bIso) {
            if (form.time && b.time) {
              if (form.time.format('HH:mm') === b.time) {
                throw new Error('You already have a booking with the same name and time on that date. Please choose another date or time.');
              }
            } else {
              throw new Error('You already have a booking on that date. Please wait until it is completed before requesting another.');
            }
          }
          // fallback: block active/upcoming bookings
          let start: Date | null = null;
          if (bIso) {
            const [yy, mm, dd] = bIso.split('-').map(Number);
            if (b.time) {
              const [hh, min] = (b.time || '00:00').split(':').map(Number);
              start = new Date(yy, mm - 1, dd, hh || 0, min || 0, 0);
            } else {
              start = new Date(yy, mm - 1, dd, 0, 0, 0);
            }
          } else if (b.createdAt) {
            if (typeof b.createdAt === 'number') start = new Date(b.createdAt);
            else if (b.createdAt?.toDate) start = b.createdAt.toDate();
          }
          const end = start ? (b.end ? parseTime(b.end) ?? new Date(start.getTime() + DEFAULT_DURATION_MS) : new Date(start.getTime() + DEFAULT_DURATION_MS)) : null;
          if (end && end.getTime() > now.getTime()) {
            throw new Error('You already have an active or upcoming booking. Please wait until that booking is completed before requesting another.');
          }
        }
      } catch (err) {
        // allow other checks to proceed if this query fails silently
        console.warn('Name-based booking check failed', err);
      }
    }
  }
  // If user provided a date+time, check for conflicts (same date and same time)
      
      if (isoDate && form.time) {
        if (rtdb) {
          if (rtdb) {
            const snapshot = await get(ref(rtdb, 'bookings'));
            const val = (snapshot && (snapshot as any).val && (snapshot as any).val()) || {};
            const conflict = Object.values(val).some((b: any) => {
              const bDate = b.date ? (b.date.indexOf('-') > -1 ? b.date.split('T')[0] : (b.date.indexOf('/') > -1 ? (() => { const [d,m,y]=b.date.split('/'); return `${y}-${m}-${d}` })() : b.date)) : '';
              return bDate === isoDate && (b.time || '') === (form.time ? form.time.format('HH:mm') : '');
            });
            if (conflict) {
              throw new Error('Preferred time already taken on that date. Please choose another time.');
            }
          }
        } else {
          const q = query(collection(db, 'bookings'), where('date', '==', isoDate), where('time', '==', form.time.format('HH:mm')));
          const snap = await getDocs(q);
          if (!snap.empty) {
            throw new Error('Preferred time already taken on that date. Please choose another time.');
          }
        }
      }
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
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, location: val }));
    if (onLocationChange) onLocationChange(val);
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
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#f9fafb', textAlign: 'center' }}>Book Your Session</Typography>
      <Typography variant="body1" sx={{ color: '#d1d5db', mb: 3, textAlign: 'center', lineHeight: 1.6 }}>Please provide your details below. We'll securely store your booking and contact you to confirm.</Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
  <TextField label="Full name" placeholder="e.g. John Smith" variant="outlined" value={form.name} onChange={handleChange('name')} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} required error={!!errors.name} helperText={errors.name} />
  <TextField label="Email" placeholder="you@example.com" variant="outlined" value={form.email} onChange={handleChange('email')} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} helperText={errors.email ?? 'We will contact you to confirm the booking'} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} required error={!!errors.email} />
  <TextField label="Phone" placeholder="01234 567890" variant="outlined" value={form.phone} onChange={handleChange('phone')} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#9ca3af' }} /></InputAdornment>) }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} error={!!errors.phone} helperText={errors.phone} />
        <TextField label="Location" placeholder="Town or venue" variant="outlined" value={form.location} onChange={handleLocationChange} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
  <DatePicker label="Preferred Date" value={form.date} onChange={(newValue) => setForm(prev => ({ ...prev, date: newValue }))} shouldDisableDate={(date) => date.isBefore(dayjs(), 'day')} slotProps={{ textField: { sx: { '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }, error: !!errors.date, helperText: errors.date } }} />
  <TimePicker label="Preferred Time" value={form.time} onChange={(newValue) => setForm(prev => ({ ...prev, time: newValue }))} slotProps={{ textField: { sx: { '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }, error: !!errors.time, helperText: errors.time ?? 'Optional — use 24-hour format (HH:MM)' } }} />
        <TextField label="Message" variant="outlined" multiline rows={4} fullWidth value={form.message} onChange={handleChange('message')} sx={{ gridColumn: '1 / -1', '& .MuiOutlinedInput-root': { bgcolor: '#374151', borderRadius: 2, '&:hover': { bgcolor: '#4b5563' }, '&.Mui-focused': { bgcolor: '#1f2937', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' }, '& .MuiOutlinedInput-input': { color: '#f9fafb' }, '& .MuiInputLabel-root': { color: '#d1d5db' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' } } }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, gridColumn: '1 / -1', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Link href="/contact-us" passHref>
            <Button variant="text" sx={{ color: '#d1d5db', textTransform: 'none', '&:hover': { color: '#f9fafb', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Having Issues? Contact Us
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} variant="contained" sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', px: 5, py: 1.5, borderRadius: 3, color: '#fff', fontWeight: 600, width: { xs: '100%', sm: 'auto' }, opacity: submitting ? 0.7 : 1, transition: 'all 0.2s ease-in-out', '&:hover': { transform: submitting ? 'none' : 'translateY(-1px)', boxShadow: submitting ? 'none' : '0 10px 25px rgba(59, 130, 246, 0.3)' }, '&:active': { transform: 'translateY(0)' } }}>{submitting ? <> <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Submitting... </> : 'Submit Booking'}</Button>
        </Box>
      </Box>
      </LocalizationProvider>
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
         <DialogTitle id="success-dialog-title">Booking Submitted Successfully</DialogTitle>
         <DialogContent>
           <DialogContentText id="success-dialog-description">
             Your booking has been submitted. We will contact you soon to confirm.
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => { setOpenDialog(false); setForm({ name: '', email: '', phone: '', location: '', date: null, message: '', time: null }); setErrors({}); }} color="primary" autoFocus>
             OK
           </Button>
         </DialogActions>
       </Dialog>
     </Box>
  );
}

export default ManageBookings