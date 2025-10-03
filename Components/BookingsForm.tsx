"use client";
import React, { useState, useEffect } from 'react';
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
import ReCAPTCHA from 'react-google-recaptcha';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Slide from '@mui/material/Slide';
import Grow from '@mui/material/Grow';

const locations = ['Bridgend', 'Pontycymer', 'Sarn', 'Maesteg', 'Other'];

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic Tribute',
    duration: '1+ Hour',
    description: 'Perfect for small gatherings and intimate celebrations',
    price: 10,
    features: [
      '1 hour MJ tribute performance',
      'Classic MJ hits medley'
    ]
  }
];

const steps = ['Choose Package', 'Your Details', 'Verify Email', 'Final Review'];

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

interface Package {
  id: string;
  name: string;
  duration: string;
  description: string;
  price: number;
  features: string[];
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  venue: string;
  package: string;
  date: Dayjs | null;
  time: Dayjs | null;
  message: string;
  acceptTerms: boolean;
}

interface Props {
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
}


function ManageBookings({ selectedLocation, onLocationChange }: Props) {
  const theme = useTheme();
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', location: selectedLocation ?? '', venue: '', package: '', date: null, message: '', time: null, acceptTerms: false });
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedVerificationCode, setExpectedVerificationCode] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  const sendVerificationCode = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setSubmissionError('Please enter a valid email address first.');
      return;
    }

    setSendingVerification(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      setExpectedVerificationCode(code);

      const verificationBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification - MJ2 Studios</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196f3; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .code { font-size: 24px; font-weight: bold; color: #2196f3; text-align: center; padding: 20px; background-color: #e3f2fd; border-radius: 5px; margin: 20px 0; }
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
            <h2>Email Verification</h2>
            <p>Please verify your email address to complete your booking.</p>
            <p>Your verification code is:</p>
            <div class="code">${code}</div>
            <p>Enter this code in the booking form to continue.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 MJ2 Studios. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.email,
          subject: 'Email Verification - MJ2 Studios',
          body: verificationBody
        }),
      });

      if (response.ok) {
        setSnackMsg('Verification code sent! Check your email.');
        setSnackSeverity('success');
        setOpenSnack(true);
      } else {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Verification email error:', error);
      setSubmissionError('Failed to send verification email. Please try again.');
      setSnackMsg('Failed to send verification email.');
      setSnackSeverity('error');
      setOpenSnack(true);
    } finally {
      setSendingVerification(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setSubmissionError('Please enter the verification code.');
      return;
    }

    setVerifyingCode(true);
    // Simulate verification delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (verificationCode === expectedVerificationCode) {
      setEmailVerified(true);
      setSubmissionError(null);

      // Send verification success email
      try {
        const successEmailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verified - MJ2 Studios</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4caf50; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .checkmark { font-size: 48px; color: #4caf50; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MJ2 Studios</h1>
            <p>Michael Jackson Tributes</p>
        </div>
        <div class="content">
            <div class="checkmark">✓</div>
            <h2>Email Verification Successful!</h2>
            <p>Dear ${form.name || 'Valued Customer'},</p>
            <p>Your email address has been successfully verified for your booking with MJ2 Studios.</p>
            <p>You can now complete your booking form submission. We're excited to help you with your Michael Jackson tribute event!</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Complete the reCAPTCHA verification</li>
                <li>Submit your booking form</li>
                <li>You'll receive a booking confirmation email</li>
            </ul>
            <p>If you have any questions, feel free to contact us.</p>
            <p>Best regards,<br>The MJ2 Studios Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 MJ2 Studios. All rights reserved.</p>
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
            subject: 'Email Verified - MJ2 Studios',
            body: successEmailBody
          }),
        });
      } catch (emailError) {
        console.error('Failed to send verification success email:', emailError);
        // Don't block the verification process for email failure
      }

      setSnackMsg('Email verified successfully! Check your email for confirmation.');
      setSnackSeverity('success');
      setOpenSnack(true);
    } else {
      setSubmissionError('Invalid verification code. Please try again.');
      setSnackMsg('Invalid verification code.');
      setSnackSeverity('error');
      setOpenSnack(true);
    }
    setVerifyingCode(false);
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* Package Selection */}
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
              Select Your MJ Tribute Package
            </Typography>
            <RadioGroup
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
              sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}
            >
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  sx={{
                    flex: 1,
                    cursor: 'pointer',
                    border: form.package === pkg.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                    bgcolor: form.package === pkg.id ? 'rgba(25, 118, 210, 0.1)' : theme.palette.background.paper,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}30`
                    }
                  }}
                  onClick={() => setForm({ ...form, package: pkg.id })}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FormControlLabel
                        value={pkg.id}
                        control={<Radio />}
                        label=""
                        sx={{ mr: 1 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                          {pkg.name}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                          {pkg.duration} • £{pkg.price}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                      {pkg.description}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {pkg.features.map((feature, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
            <Typography variant="body2" sx={{ textAlign: 'center', color: theme.palette.text.secondary, mt: 2, fontStyle: 'italic' }}>
              * This is just the starting price. Final pricing may vary based on specific requirements and customizations.
            </Typography>
            {form.package && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.success.main, textAlign: 'center' }}>
                  Selected: <strong>{packages.find(p => p.id === form.package)?.name}</strong> - £{packages.find(p => p.id === form.package)?.price}
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
              Enter Your Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <TextField
                fullWidth
                label="Email"
                placeholder="john@example.com"
                variant="outlined"
                value={form.email}
                onChange={(e) => {
                  handleChange('email')(e);
                  // Reset verification when email changes
                  if (emailVerified) {
                    setEmailVerified(false);
                    setExpectedVerificationCode(null);
                    setVerificationCode('');
                  }
                }}
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
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
              </LocalizationProvider>
              <TextField
                fullWidth
                label="Message"
                placeholder="Any additional details..."
                variant="outlined"
                multiline
                rows={3}
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

              {/* Terms and Conditions */}
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.acceptTerms}
                      onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      I accept the{' '}
                      <span style={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}>
                        Terms and Conditions
                      </span>
                      {' '}and{' '}
                      <span style={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}>
                        Privacy Policy
                      </span>
                    </Typography>
                  }
                />
                {errors.acceptTerms && (
                  <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 1 }}>
                    {errors.acceptTerms}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Verify Your Email
            </Typography>

            {!emailVerified ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  We've sent a verification code to <strong>{form.email}</strong>
                </Typography>

                {form.email && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Button
                      variant="outlined"
                      onClick={sendVerificationCode}
                      disabled={sendingVerification}
                      sx={{ minWidth: 150 }}
                    >
                      {sendingVerification ? 'Sending...' : 'Resend Code'}
                    </Button>
                    <TextField
                      label="Enter Verification Code"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      sx={{ width: 200, '& .MuiOutlinedInput-root': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}
                      InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                    />
                    <Button
                      variant="contained"
                      onClick={verifyCode}
                      disabled={verifyingCode || !verificationCode.trim()}
                      color="success"
                      startIcon={verifyingCode ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {verifyingCode ? 'Verifying...' : 'Verify'}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{
                p: 3,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: '1px solid #4caf50'
              }}>
                <span style={{ fontSize: '48px', color: '#4caf50', display: 'block', marginBottom: '16px' }}>✓</span>
                <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                  Email Verified Successfully!
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Check your email for confirmation. You can now proceed to the final step.
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Final Step - Complete Security
            </Typography>

            {/* reCAPTCHA */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={handleRecaptchaChange}
                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
              />
            </Box>

            {/* Submit Button */}
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
        );
      default:
        return null;
    }
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
      const hasStepErrors = ['name', 'email', 'phone', 'location', 'venue', 'date', 'time', 'message', 'acceptTerms'].some(field => stepValidation[field as keyof FormState]);
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
    // Allow jumping back to completed steps
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
    if (!vals.package.trim()) e.package = 'Please select a package';
    if (!vals.venue.trim()) e.venue = 'Venue is required';
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

      // Clear auto-saved form data after successful submission
      localStorage.removeItem('mj2_booking_form');

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

  // Form auto-save functionality
  useEffect(() => {
    const savedForm = localStorage.getItem('mj2_booking_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        setForm(parsedForm);
      } catch (error) {
        console.error('Error loading saved form:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-save form data
    localStorage.setItem('mj2_booking_form', JSON.stringify(form));
  }, [form]);

  // Update step progress based on completion (but don't auto-advance)
  // This just updates the stepper visual state, navigation is manual
  useEffect(() => {
    // Step progress is controlled by user navigation, not auto-advancement
    // The stepper shows visual progress but user controls the flow
  }, [form, emailVerified, recaptchaToken]);

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
          maxWidth: 800,
          mx: 'auto',
          mt: { xs: 4, sm: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Progress Indicator */}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            {/* Step Content with Animation */}
            <Box sx={{ mb: 4, minHeight: 400, overflow: 'hidden' }}>
              <Slide direction={slideDirection} in={true} key={activeStep} timeout={500} mountOnEnter unmountOnExit>
                <Box sx={{ width: '100%' }}>
                  {getStepContent(activeStep)}
                </Box>
              </Slide>
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Back
              </Button>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ minWidth: 100 }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ minWidth: 150 }}
                    href="/pages/contact-us"
                  >
                    Need Help?
                  </Button>
                )}
              </Box>
            </Box>

            {/* Error Display */}
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
          </Box>
        </LocalizationProvider>
      </Box>
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

export default ManageBookings