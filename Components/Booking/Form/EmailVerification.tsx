"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

interface EmailVerificationProps {
  form: { email: string };
  sendingVerification: boolean;
  sendVerificationCode: () => Promise<void>;
  verifyingCode: boolean;
  verifyCode: () => Promise<void>;
  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  expectedVerificationCode: string | null;
  timeLeft: number;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  form,
  sendingVerification,
  sendVerificationCode,
  verifyingCode,
  verifyCode,
  verificationCode,
  setVerificationCode,
  expectedVerificationCode,
  timeLeft
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary }}>
        Verify Your Email
      </Typography>

      {expectedVerificationCode && (
        <Typography variant="body2" sx={{ color: timeLeft > 60 ? theme.palette.text.secondary : timeLeft <= 0 ? theme.palette.error.main : theme.palette.warning.main, mb: 2 }}>
          {timeLeft <= 0 ? 'Code has expired' : `Code expires in: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          {expectedVerificationCode ? (
            <>Check your email for the verification code. Enter it below to verify your email address.</>
          ) : (
            <>Click "Generate Code" to receive a verification code via email</>
          )}
        </Typography>

        {form.email && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Button
              variant="outlined"
              onClick={sendVerificationCode}
              disabled={sendingVerification}
              sx={{ minWidth: 150 }}
            >
              {sendingVerification ? 'Generating...' : expectedVerificationCode ? 'Regenerate Code' : 'Generate Code'}
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
              disabled={verifyingCode || !verificationCode.trim() || timeLeft <= 0}
              color="success"
              startIcon={verifyingCode ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {verifyingCode ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EmailVerification;