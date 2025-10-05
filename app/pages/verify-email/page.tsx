"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/Components/Utils/firebaseClient';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/material/styles';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: `rgba(255,255,255,0.8)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid rgba(255,255,255,0.2)`,
  boxShadow: `0 8px 40px rgba(0,0,0,0.3)`,
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, rgba(56, 239, 125, 0.1) 0%, transparent 50%, rgba(17, 152, 142, 0.1) 100%)`,
    pointerEvents: 'none',
  },
}));

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const uid = searchParams.get('uid');

      if (!token || !uid) {
        setError('Invalid verification link');
        setVerifying(false);
        return;
      }

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          setError('User not found');
          setVerifying(false);
          return;
        }

        const userData = userDoc.data();
        if (userData.verificationToken !== token) {
          setError('Invalid verification token');
          setVerifying(false);
          return;
        }

        // Update user as verified
        await updateDoc(doc(db, 'users', uid), {
          emailVerified: true,
          verificationToken: null, // Clear the token
          lastSignIn: new Date(),
        });

        setSuccess(true);
        // Redirect after success
        setTimeout(() => router.push('/'), 3000);
      } catch (err: any) {
        setError(err.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <GlassPaper sx={{ width: { xs: '90%', sm: 480 }, p: 4, position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Avatar sx={{ bgcolor: 'linear-gradient(45deg, #38ef7d, #11998e)', width: 56, height: 56 }}>
                <LockOutlinedIcon sx={{ fontSize: 28 }} />
              </Avatar>
            </motion.div>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {verifying ? 'Verifying Email' : success ? 'Email Verified!' : 'Verification Failed'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {verifying ? 'Please wait while we verify your email...' : success ? 'Your email has been successfully verified' : 'There was an issue verifying your email'}
              </Typography>
            </Box>
          </Stack>

          {verifying ? (
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
              We're processing your email verification. This may take a moment...
            </Typography>
          ) : success ? (
            <>
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
                Your email has been verified successfully! You can now access all features of the app.
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
                You will be redirected to the home page in a few seconds.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push('/')}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Go to Home
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
                {error}
              </Typography>
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/pages/signin-up')}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: '#4285f4',
                    color: '#4285f4',
                    '&:hover': {
                      borderColor: '#357ae8',
                      backgroundColor: 'rgba(66, 133, 244, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Back to Sign In
                </Button>
              </Stack>
            </>
          )}
        </GlassPaper>
      </motion.div>
    </Box>
  );
}