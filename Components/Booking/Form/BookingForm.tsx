"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import { collection, addDoc, serverTimestamp, getDocs, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, rtdb } from '../../Utils/firebaseClient';
import { ref, push, set, onValue } from 'firebase/database';
import { EmailTemplates } from '../../Email/';
import { useTheme } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';

import { FormState, Props } from './types';
import { steps, possibleTimes, timeToMinutes, normalizeDateToISO } from './utils';
import { useVerification } from './useVerification';
import PackageSelection from './PackageSelection';
import UserDetailsForm from './UserDetailsForm';
import EmailVerification from './EmailVerification';
import FinalReview from './FinalReview';

function ManageBookings({ selectedLocation, onLocationChange }: Props) {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const locationFromUrl = searchParams.get('location');

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    location: locationFromUrl ?? '',
    venue: '',
    package: '',
    date: null,
    message: '',
    time: null,
    acceptTerms: false
  });
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [dateCounts, setDateCounts] = useState(new Map<string, Map<string, number>>());
  const [dateTimes, setDateTimes] = useState(new Map<string, Map<string, string[]>>());

  const {
    verificationCode,
    setVerificationCode,
    expectedVerificationCode,
    emailVerified,
    sendingVerification,
    verifyingCode,
    timeLeft,
    sendVerificationCode: sendCode,
    verifyCode: verify
  } = useVerification();

  const sendVerificationCode = async () => {
    await sendCode(
      form.email,
      (msg) => {
        setSubmissionError(msg);
        setSnackMsg(msg);
        setSnackSeverity('error');
        setOpenSnack(true);
      },
      () => {
        setSnackMsg('Verification code sent to your email. Please check your inbox and enter the code below.');
        setSnackSeverity('success');
        setOpenSnack(true);
      }
    );
  };

  const verifyCode = async () => {
    await verify(
      form.email,
      verificationCode,
      (msg) => {
        setSubmissionError(msg);
        setSnackMsg(msg);
        setSnackSeverity('error');
        setOpenSnack(true);
      },
      () => {
        setSnackMsg('Email verified successfully! Check your email for confirmation.');
        setSnackSeverity('success');
        setOpenSnack(true);
        // Automatically proceed to next step
        setTimeout(() => handleNext(), 2000);
      }
    );
  };

  // Keep form.location in sync with selectedLocation prop
  React.useEffect(() => {
    if (typeof selectedLocation === 'string') {
      setForm(prev => ({ ...prev, location: selectedLocation }));
    }
  }, [selectedLocation]);

  // Form auto-save functionality
  useEffect(() => {
    const savedForm = localStorage.getItem('mj2_booking_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        // Merge with location from URL if present
        if (locationFromUrl && !parsedForm.location) {
          parsedForm.location = locationFromUrl;
        }
        // Rehydrate dayjs objects
        if (parsedForm.date && typeof parsedForm.date === 'object' && parsedForm.date.$d) {
          parsedForm.date = dayjs(parsedForm.date.$d);
        }
        if (parsedForm.time && typeof parsedForm.time === 'object' && parsedForm.time.$d) {
          parsedForm.time = dayjs(parsedForm.time.$d);
        }
        setForm(parsedForm);
      } catch (error) {
        console.error('Error loading saved form:', error);
      }
    }
  }, [locationFromUrl]);

  useEffect(() => {
    localStorage.setItem('mj2_booking_form', JSON.stringify(form));
  }, [form]);

  // Fetch booking counts and times in real-time
  useEffect(() => {
    const unsubscribe = rtdb ? onValue(ref(rtdb, 'bookings'), (snapshot) => {
      const counts = new Map<string, Map<string, number>>();
      const timesMap = new Map<string, Map<string, string[]>>();
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.date && data.location) {
          const loc = data.location.toLowerCase();
          if (!counts.has(data.date)) counts.set(data.date, new Map());
          counts.get(data.date)!.set(loc, (counts.get(data.date)!.get(loc) || 0) + 1);
          if (!timesMap.has(data.date)) timesMap.set(data.date, new Map());
          if (!timesMap.get(data.date)!.has(loc)) timesMap.get(data.date)!.set(loc, []);
          if (data.time) timesMap.get(data.date)!.get(loc)!.push(data.time);
        }
      });
      setDateCounts(counts);
      setDateTimes(timesMap);
    }) : onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const counts = new Map<string, Map<string, number>>();
      const timesMap = new Map<string, Map<string, string[]>>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.date && data.location) {
          const loc = data.location.toLowerCase();
          if (!counts.has(data.date)) counts.set(data.date, new Map());
          counts.get(data.date)!.set(loc, (counts.get(data.date)!.get(loc) || 0) + 1);
          if (!timesMap.has(data.date)) timesMap.set(data.date, new Map());
          if (!timesMap.get(data.date)!.has(loc)) timesMap.get(data.date)!.set(loc, []);
          if (data.time) timesMap.get(data.date)!.get(loc)!.push(data.time);
        }
      });
      setDateCounts(counts);
      setDateTimes(timesMap);
    });
    return unsubscribe;
  }, [rtdb]);


  const availableTimes = useMemo(() => {
    if (!form.date || !dayjs.isDayjs(form.date)) return [];
    if (!form.location) return possibleTimes;
    const dateStr = form.date.format('YYYY-MM-DD');
    const existing = dateTimes.get(dateStr)?.get(form.location.toLowerCase()) || [];
    const count = dateCounts.get(dateStr)?.get(form.location.toLowerCase()) || 0;
    if (count >= 4) return [];
    return possibleTimes.filter(time => {
      const minutes = timeToMinutes(time);
      return !existing.some(et => Math.abs(timeToMinutes(et) - minutes) < 120);
    });
  }, [form.date, form.location, dateTimes, dateCounts, possibleTimes]);

  // Auto-select next available date if current is full
  useEffect(() => {
    if (form.date && dayjs.isDayjs(form.date) && form.location && availableTimes.length === 0) {
      let nextDate = form.date.add(1, 'day');
      let attempts = 0;
      while (attempts < 30) {
        const dateStr = nextDate.format('YYYY-MM-DD');
        const count = dateCounts.get(dateStr)?.get(form.location.toLowerCase()) || 0;
        if (count < 4) {
          setForm(prev => ({ ...prev, date: nextDate }));
          break;
        }
        nextDate = nextDate.add(1, 'day');
        attempts++;
      }
    }
  }, [form.date, form.location, availableTimes.length, dateCounts]);

  // Auto-select first available time
  useEffect(() => {
    if (form.date && dayjs.isDayjs(form.date) && form.location && availableTimes.length > 0 && !form.time) {
      const firstTime = availableTimes[0];
      setForm(prev => ({ ...prev, time: dayjs(`${(form.date as Dayjs).format('YYYY-MM-DD')} ${firstTime}`) }));
    }
  }, [form.date, form.location, availableTimes]);

  const handleLocationChange = (e: any) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, location: val }));
    if (onLocationChange) onLocationChange(val);
  };


  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleNext = () => {
    if (activeStep === 0 && !form.package) {
      setSnackMsg('Please select a package to continue.');
      setSnackSeverity('error');
      setOpenSnack(true);
      return;
    }
    if (activeStep === 1) {
      const stepValidation = validate(form);
      const hasStepErrors = ['name', 'email', 'phone', 'location', 'date', 'time', 'message', 'acceptTerms'].some(field => stepValidation[field as keyof FormState]);
      if (hasStepErrors) {
        setErrors(stepValidation);
        setSnackMsg('Please fill in all required fields correctly.');
        setSnackSeverity('error');
        setOpenSnack(true);
        return;
      }
    }
    if (activeStep === 2 && !emailVerified) {
      setSnackMsg('Please verify your email before continuing.');
      setSnackSeverity('error');
      setOpenSnack(true);
      return;
    }
    setSlideDirection('left');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setSlideDirection('right');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step < activeStep) {
      setSlideDirection('right');
      setActiveStep(step);
    }
  };

  const validate = (vals: FormState) => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!vals.name.trim()) e.name = 'Name is required';
    if (!vals.email.trim()) {
      e.email = 'Email is required';
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(vals.email)) e.email = 'Enter a valid email';
    }
    if (!vals.phone.trim()) {
      e.phone = 'Phone is required';
    } else {
      const phoneRe = /^[0-9+\-()\s]+$/;
      if (!phoneRe.test(vals.phone)) e.phone = 'Enter a valid phone number';
    }
    if (!vals.location.trim()) e.location = 'Location is required';
    if (!vals.package.trim()) e.package = 'Please select a package';
    if (!vals.date) {
      e.date = 'Date is required';
    }
    if (!vals.time) {
      e.time = 'Time is required';
    }
    if (!vals.message.trim()) e.message = 'Message is required';
    if (!vals.acceptTerms) e.acceptTerms = 'You must accept the terms and conditions';
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

    if (!emailVerified) {
      setSubmissionError('Please verify your email address before submitting.');
      setSnackMsg('Please verify your email first.');
      setSnackSeverity('error');
      setOpenSnack(true);
      return;
    }

    if (!recaptchaToken) {
      setSubmissionError('Please complete the reCAPTCHA verification.');
      setSnackMsg('Please complete the reCAPTCHA.');
      setSnackSeverity('error');
      setOpenSnack(true);
      return;
    }

    setSubmitting(true);
    try {
      const isoDate = normalizeDateToISO(form.date);
      const count = dateCounts.get(isoDate)?.get(form.location.toLowerCase()) || 0;
      if (count >= 4) {
        setSubmissionError('This date is fully booked. Please select another date.');
        setSnackMsg('This date is fully booked.');
        setSnackSeverity('error');
        setOpenSnack(true);
        setSubmitting(false);
        return;
      }

      const selectedTimeStr = form.time?.format('HH:mm');
      if (selectedTimeStr) {
        const selectedMinutes = timeToMinutes(selectedTimeStr);
        const existingTimes = dateTimes.get(isoDate)?.get(form.location.toLowerCase()) || [];
        for (const existingTimeStr of existingTimes) {
          const existingMinutes = timeToMinutes(existingTimeStr);
          if (Math.abs(selectedMinutes - existingMinutes) < 120) {
            setSubmissionError('This time is too close to an existing booking (shows must be at least 2 hours apart). Please choose a different time.');
            setSnackMsg('Time conflict detected.');
            setSnackSeverity('error');
            setOpenSnack(true);
            setSubmitting(false);
            return;
          }
        }
      }

      let bookingId;
      do {
        const bookingIdTemp = 'MJ' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const q = query(collection(db, 'bookings'), where('bookingId', '==', bookingIdTemp));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          bookingId = bookingIdTemp;
          break;
        }
      } while (true);

      const payload = { ...form, date: isoDate, time: form.time?.format('HH:mm'), bookingId, location: form.location.toLowerCase() };
      if (rtdb) {
        const bookingsRef = ref(rtdb, 'bookings');
        const newRef = push(bookingsRef);
        await set(newRef, { ...payload, createdAt: Date.now() });
      } else {
        await addDoc(collection(db, 'bookings'), { ...payload, createdAt: serverTimestamp() });
      }

      // Send confirmation email
      try {
        const htmlBody = EmailTemplates.getBookingConfirmationHtml({
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          venue: form.venue,
          date: normalizeDateToISO(form.date),
          time: form.time?.format('HH:mm'),
          bookingId
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
          const fetchPromise = fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: form.email,
              subject: `[${bookingId}] Booking Confirmation - MJ2 Studios`,
              body: htmlBody
            }),
            signal: controller.signal,
          });
          await fetchPromise;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      localStorage.removeItem('mj2_booking_form');
      setSubmissionError(null);
      window.location.href = '/pages/booking_status?bookingId=' + bookingId;
    } catch (err: unknown) {
      console.error('Booking submission error:', err);
      const message = err instanceof Error && err.message ? `Submission failed: ${err.message}` : 'Submission failed — check console for details.';
      setSubmissionError(message);
      setSnackMsg(message);
      setSnackSeverity('error');
      setOpenSnack(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PackageSelection selectedPackage={form.package} onPackageChange={(pkg) => setForm({ ...form, package: pkg })} />;
      case 1:
        return (
          <UserDetailsForm
            form={form}
            setForm={setForm}
            errors={errors}
            dateCounts={dateCounts}
            dateTimes={dateTimes}
            availableTimes={availableTimes}
          />
        );
      case 2:
        return (
          <EmailVerification
            form={form}
            sendingVerification={sendingVerification}
            sendVerificationCode={sendVerificationCode}
            verifyingCode={verifyingCode}
            verifyCode={verifyCode}
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            expectedVerificationCode={expectedVerificationCode}
            timeLeft={timeLeft}
          />
        );
      case 3:
        return (
          <FinalReview
            form={form}
            submitting={submitting}
            recaptchaToken={recaptchaToken}
            handleRecaptchaChange={handleRecaptchaChange}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
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
          maxWidth: 800,
          mx: 'auto',
          mt: { xs: 4, sm: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Step {activeStep + 1} of {steps.length} • {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
            </Typography>
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label, index) => {
              const isCompleted = index < activeStep;
              const isAccessible = index <= activeStep;

              return (
                <Step key={label} completed={isCompleted}>
                  <StepLabel
                    onClick={() => isAccessible && handleStepClick(index)}
                    sx={{
                      cursor: isAccessible ? 'pointer' : 'default',
                      '& .MuiStepLabel-label': {
                        color: theme.palette.text.secondary,
                        '&.Mui-active': { color: theme.palette.primary.main, fontWeight: 600 },
                        '&.Mui-completed': { color: theme.palette.success.main },
                        '&:hover': isAccessible ? { color: theme.palette.primary.main } : {}
                      },
                      '& .MuiStepIcon-root': {
                        '&.Mui-active': { color: theme.palette.primary.main },
                        '&.Mui-completed': { color: theme.palette.success.main }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

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

        <Box sx={{ mb: 4, minHeight: 400, overflow: 'hidden' }}>
          <Slide direction={slideDirection} in={true} key={activeStep} timeout={500} mountOnEnter unmountOnExit>
            <Box sx={{ width: '100%' }}>
              {getStepContent(activeStep)}
            </Box>
          </Slide>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{
              minWidth: 100,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  minWidth: 100,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{
                  minWidth: 150,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                    bgcolor: theme.palette.secondary.dark
                  }
                }}
                href="/pages/contact-us"
              >
                Need Help?
              </Button>
            )}
          </Box>
        </Box>

        {(submissionError || Object.keys(errors).length > 0) && (
          <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
            <Box sx={{
              bgcolor: theme.palette.error.main + '1A',
              color: theme.palette.error.main,
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.error.main}4D`,
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
                setForm({ name: '', email: '', phone: '', location: '', venue: '', package: '', date: null, message: '', time: null, acceptTerms: false });
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

export default ManageBookings;