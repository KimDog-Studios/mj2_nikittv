"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import { EmailTemplates } from '../../../Components/Email/';

interface TestData {
  email: string;
  name: string;
  phone?: string;
  location?: string;
  venue?: string;
  date?: string;
  time?: string;
  message?: string;
  bookingId?: string;
  verificationCode?: string;
}

const TestEmailsPage = () => {
  const [testData, setTestData] = useState<TestData>({
    email: 'test@example.com',
    name: 'John Doe',
    phone: '01234567890',
    location: 'Bridgend',
    venue: 'Test Venue',
    date: '2024-12-25',
    time: '14:00',
    message: 'Test booking message',
    bookingId: 'MJ123456',
    verificationCode: '123456'
  });

  const [loading, setLoading] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (field: keyof TestData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const sendTestEmail = async (emailType: string, emailFunction: () => Promise<any>) => {
    setLoading(emailType);
    try {
      console.log(`Testing ${emailType} email...`);
      await emailFunction();
      setSnack({
        open: true,
        message: `${emailType} email sent successfully! Check ${testData.email}`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error sending ${emailType} email:`, error);
      setSnack({
        open: true,
        message: `Failed to send ${emailType} email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(null);
    }
  };

  const testEmails = [
    {
      title: 'Verification Code',
      description: 'Send email with 6-digit verification code',
      color: 'primary' as const,
      action: () => sendTestEmail(
        'Verification Code',
        async () => {
          const htmlBody = EmailTemplates.getVerificationCodeHtml(testData.verificationCode!);
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: testData.email,
              subject: 'Email Verification - MJ2 Studios',
              body: htmlBody
            })
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        }
      )
    },
    {
      title: 'Verification Success',
      description: 'Send email confirming successful verification',
      color: 'success' as const,
      action: () => sendTestEmail(
        'Verification Success',
        async () => {
          const htmlBody = EmailTemplates.getVerificationSuccessHtml(testData.name);
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: testData.email,
              subject: 'Email Verified - MJ2 Studios',
              body: htmlBody
            })
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        }
      )
    },
    {
      title: 'Booking Confirmation',
      description: 'Send booking confirmation with all details',
      color: 'info' as const,
      action: () => sendTestEmail(
        'Booking Confirmation',
        async () => {
          const bookingData = {
            name: testData.name,
            email: testData.email,
            phone: testData.phone,
            location: testData.location,
            venue: testData.venue,
            date: testData.date,
            time: testData.time,
            message: testData.message,
            bookingId: testData.bookingId
          };
          const htmlBody = EmailTemplates.getBookingConfirmationHtml(bookingData);
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: testData.email,
              subject: `[${testData.bookingId}] Booking Confirmation - MJ2 Studios`,
              body: htmlBody
            })
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        }
      )
    },
    {
      title: 'Status Confirmed',
      description: 'Send booking status update (confirmed)',
      color: 'success' as const,
      action: () => sendTestEmail(
        'Status Confirmed',
        async () => {
          const bookingData = {
            name: testData.name,
            email: testData.email,
            phone: testData.phone,
            location: testData.location,
            venue: testData.venue,
            date: testData.date,
            time: testData.time,
            message: testData.message,
            bookingId: testData.bookingId
          };
          const htmlBody = EmailTemplates.getStatusUpdateHtml(bookingData, 'confirmed');
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: testData.email,
              subject: 'Booking Confirmed - MJ2 Studios',
              body: htmlBody
            })
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        }
      )
    },
    {
      title: 'Status Cancelled',
      description: 'Send booking status update (cancelled)',
      color: 'error' as const,
      action: () => sendTestEmail(
        'Status Cancelled',
        async () => {
          const bookingData = {
            name: testData.name,
            email: testData.email,
            phone: testData.phone,
            location: testData.location,
            venue: testData.venue,
            date: testData.date,
            time: testData.time,
            message: testData.message,
            bookingId: testData.bookingId
          };
          const htmlBody = EmailTemplates.getStatusUpdateHtml(bookingData, 'cancelled', 'Test cancellation reason');
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: testData.email,
              subject: 'Booking Update - MJ2 Studios',
              body: htmlBody
            })
          });
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
        }
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Email Testing Dashboard
      </Typography>

      {/* Test Data Input */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Test Data Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the test data used for all email templates
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            value={testData.email}
            onChange={handleInputChange('email')}
            helperText="Where to send test emails"
          />
          <TextField
            fullWidth
            label="Name"
            value={testData.name}
            onChange={handleInputChange('name')}
          />
          <TextField
            fullWidth
            label="Phone"
            value={testData.phone}
            onChange={handleInputChange('phone')}
          />
          <TextField
            fullWidth
            label="Verification Code"
            value={testData.verificationCode}
            onChange={handleInputChange('verificationCode')}
            helperText="6-digit code for verification emails"
          />
          <TextField
            fullWidth
            label="Location"
            value={testData.location}
            onChange={handleInputChange('location')}
          />
          <TextField
            fullWidth
            label="Venue"
            value={testData.venue}
            onChange={handleInputChange('venue')}
          />
          <TextField
            fullWidth
            label="Date"
            value={testData.date}
            onChange={handleInputChange('date')}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Time"
            value={testData.time}
            onChange={handleInputChange('time')}
          />
          <TextField
            fullWidth
            label="Booking ID"
            value={testData.bookingId}
            onChange={handleInputChange('bookingId')}
          />
          <TextField
            fullWidth
            label="Message"
            value={testData.message}
            onChange={handleInputChange('message')}
            multiline
            rows={2}
          />
        </Box>
      </Paper>

      {/* Email Test Buttons */}
      <Typography variant="h6" gutterBottom>
        Test Email Types
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {testEmails.map((email, index) => (
          <Card key={index} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {email.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {email.description}
              </Typography>
              <Chip
                label={`To: ${testData.email}`}
                size="small"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                color={email.color}
                onClick={email.action}
                disabled={loading === email.title}
                sx={{ minHeight: 48 }}
              >
                {loading === email.title ? 'Sending...' : `Test ${email.title}`}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Info Section */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.main', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Email Testing Information
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          • All emails are sent using Resend service
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          • Check browser console for detailed logs
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          • Emails will appear as sent from: onboarding@resend.dev
        </Typography>
        <Typography variant="body2">
          • For production, verify your domain in Resend dashboard
        </Typography>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestEmailsPage;