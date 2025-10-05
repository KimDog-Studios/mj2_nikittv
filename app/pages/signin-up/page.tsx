"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled, alpha } from '@mui/material/styles';
import { auth, db } from '@/Components/Utils/firebaseClient';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { EmailTemplates } from '@/Components/Email';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.3)}`,
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
    background: `linear-gradient(135deg, ${alpha('#38ef7d', 0.1)} 0%, transparent 50%, ${alpha('#11998e', 0.1)} 100%)`,
    pointerEvents: 'none',
  },
}));

const AnimatedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
}));

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check Firestore for custom verification status
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const firestoreVerified = userDoc.exists() && userDoc.data().emailVerified;

          if (firestoreVerified) {
            // User is verified, redirect to home
            router.push('/');
          } else {
            // User is signed in but not verified
            setVerificationPending(true);
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          setVerificationPending(true);
        }
      } else {
        setVerificationPending(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Google accounts are automatically verified, mark as verified in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: true, // Google accounts are verified
        createdAt: new Date(),
        lastSignIn: new Date(),
      }, { merge: true });

      // Redirect manually since Google sign-in is verified
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err ?? 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send sign-in notification email
      const signInTime = new Date().toLocaleString();
      const htmlBody = EmailTemplates.getSignInNotificationHtml(user.displayName || 'User', user.email!, signInTime);

      // Send asynchronously (don't await)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: 'Sign-In Notification - MJ2 Studios',
          body: htmlBody
        })
      }).catch(error => console.error('Failed to send sign-in notification:', error));

      // onAuthStateChanged will handle the redirect
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err ?? 'Sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = null;
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid,
      });

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Save user data to Firestore with verification token (with timeout)
      const saveUserPromise = setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: false,
        verificationToken,
        createdAt: new Date(),
        lastSignIn: new Date(),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore save timeout')), 10000)
      );

      try {
        await Promise.race([saveUserPromise, timeoutPromise]);
        console.log('User data saved to Firestore');
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
        // Continue with email sending even if Firestore fails
      }

      // Send custom verification email
      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}&uid=${user.uid}`;
      const htmlBody = EmailTemplates.getEmailVerificationHtml(displayName.trim()).replace('{{verification_link}}', verificationLink);

      console.log('Sending verification email to:', email);
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Verify Your Email - MJ2 Studios',
          body: htmlBody
        })
      });

      if (emailResponse.ok) {
        console.log('Verification email sent successfully');
      } else {
        console.error('Failed to send verification email:', emailResponse.status, emailResponse.statusText);
      }

      setSuccess('Account created successfully! Please check your email and click the verification link.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err ?? 'Sign-up failed'));
    } finally {
      setLoading(false);
    }
  };

  if (verificationPending) {
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
                  Email Verification Required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please verify your email to continue
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
              We've sent a verification email to your email address. Please check your email and click the verification link to verify your account.
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
              Once verified, you can sign in to access your account.
            </Typography>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Button
                onClick={async () => {
                  const user = auth.currentUser;
                  if (user) {
                    try {
                      // Generate new verification token
                      const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

                      // Update token in Firestore
                      await setDoc(doc(db, 'users', user.uid), {
                        verificationToken,
                      }, { merge: true });

                      // Send custom verification email
                      const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}&uid=${user.uid}`;
                      const htmlBody = EmailTemplates.getEmailVerificationHtml(user.displayName || 'User').replace('{{verification_link}}', verificationLink);

                      await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: user.email,
                          subject: 'Verify Your Email - MJ2 Studios',
                          body: htmlBody
                        })
                      });

                      setSuccess('Verification email sent! Please check your email.');
                    } catch (error) {
                      setError('Failed to send verification email. Please try again.');
                    }
                  }
                }}
                variant="contained"
                fullWidth
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
                Resend Verification Email
              </Button>
              <Button
                onClick={() => auth.signOut()}
                variant="outlined"
                fullWidth
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
                Sign Out
              </Button>
            </Stack>
          </GlassPaper>
        </motion.div>
      </Box>
    );
  
    return (
      <>
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
                    Welcome to MJ2 Studios
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to your account or create a new one
                  </Typography>
                </Box>
              </Stack>
  
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  aria-label="auth tabs"
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: 48,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 2,
                      mx: 1,
                      transition: 'all 0.3s',
                      '&.Mui-selected': {
                        background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <Tab icon={<LoginIcon />} label="Sign In" iconPosition="start" />
                  <Tab icon={<PersonAddIcon />} label="Sign Up" iconPosition="start" />
                </Tabs>
              </Box>
  
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 0 ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ mt: 2 }}>
                    {tab === 0 && (
                      <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                        <AnimatedTextField
                          label="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (<InputAdornment position="start">@</InputAdornment>),
                          }}
                        />
                        <AnimatedTextField
                          label="Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                        />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                            Or sign in with
                          </Typography>
                          <Button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            variant="outlined"
                            fullWidth
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
                            startIcon={
                              <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            }
                          >
                            Sign in with Google
                          </Button>
                        </Box>
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                                {error}
                              </Typography>
                            </motion.div>
                          )}
                          {success && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
                                {success}
                              </Typography>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !email || !password}
                            sx={{
                              px: 4,
                              py: 1.5,
                              borderRadius: 3,
                              background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                              boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(56, 239, 125, 0.4)',
                              },
                              transition: 'all 0.3s',
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                          </Button>
                        </Box>
                      </Box>
                    )}
  
                    {tab === 1 && (
                      <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                        <AnimatedTextField
                          label="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (<InputAdornment position="start">👤</InputAdornment>),
                          }}
                        />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Profile Picture (Optional)
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={imagePreview || undefined}
                              sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }}
                            >
                              {displayName ? displayName[0]?.toUpperCase() : 'U'}
                            </Avatar>
                            <Box>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                              />
                              <Button
                                variant="outlined"
                                startIcon={<PhotoCameraIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ mr: 1 }}
                              >
                                Upload
                              </Button>
                              {imagePreview && (
                                <IconButton onClick={handleRemoveImage} color="error">
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <AnimatedTextField
                          label="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (<InputAdornment position="start">@</InputAdornment>),
                          }}
                        />
                        <AnimatedTextField
                          label="Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                        />
                        <AnimatedTextField
                          label="Confirm Password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          variant="outlined"
                        />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                            Or sign up with
                          </Typography>
                          <Button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            variant="outlined"
                            fullWidth
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
                            startIcon={
                              <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            }
                          >
                            Sign up with Google
                          </Button>
                        </Box>
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                                {error}
                              </Typography>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !email || !password || !confirmPassword || !displayName.trim()}
                            sx={{
                              px: 4,
                              py: 1.5,
                              borderRadius: 3,
                              background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                              boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(56, 239, 125, 0.4)',
                              },
                              transition: 'all 0.3s',
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </AnimatePresence>
            </GlassPaper>
          </motion.div>
        </Box>
  
        <Snackbar
          open={!!error || !!success}
          autoHideDuration={6000}
          onClose={() => { setError(null); setSuccess(null); }}
        >
          <Alert onClose={() => { setError(null); setSuccess(null); }} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
            {error || success}
          </Alert>
        </Snackbar>
      </>
    );
  }

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
                Welcome to MJ2 Studios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account or create a new one
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              aria-label="auth tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: 2,
                  mx: 1,
                  transition: 'all 0.3s',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                    color: 'white',
                  },
                },
              }}
            >
              <Tab icon={<LoginIcon />} label="Sign In" iconPosition="start" />
              <Tab icon={<PersonAddIcon />} label="Sign Up" iconPosition="start" />
            </Tabs>
          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 0 ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 2 }}>
                {tab === 0 && (
                  <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                    <AnimatedTextField
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (<InputAdornment position="start">@</InputAdornment>),
                      }}
                    />
                    <AnimatedTextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                        Or sign in with
                      </Typography>
                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        variant="outlined"
                        fullWidth
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
                        startIcon={
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        }
                      >
                        Sign in with Google
                      </Button>
                    </Box>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                            {error}
                          </Typography>
                        </motion.div>
                      )}
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
                            {success}
                          </Typography>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !email || !password}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                          boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(56, 239, 125, 0.4)',
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {tab === 1 && (
                  <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                    <AnimatedTextField
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (<InputAdornment position="start">👤</InputAdornment>),
                      }}
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Profile Picture (Optional)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={imagePreview || undefined}
                          sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }}
                        >
                          {displayName ? displayName[0]?.toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                          />
                          <Button
                            variant="outlined"
                            startIcon={<PhotoCameraIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ mr: 1 }}
                          >
                            Upload
                          </Button>
                          {imagePreview && (
                            <IconButton onClick={handleRemoveImage} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <AnimatedTextField
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (<InputAdornment position="start">@</InputAdornment>),
                      }}
                    />
                    <AnimatedTextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                    />
                    <AnimatedTextField
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="outlined"
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
                        Or sign up with
                      </Typography>
                      <Button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        variant="outlined"
                        fullWidth
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
                        startIcon={
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        }
                      >
                        Sign up with Google
                      </Button>
                    </Box>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                            {error}
                          </Typography>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !email || !password || !confirmPassword || !displayName.trim()}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          background: 'linear-gradient(45deg, #38ef7d, #11998e)',
                          boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(56, 239, 125, 0.4)',
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>
          </AnimatePresence>
        </GlassPaper>
      </motion.div>
    </Box>
  );
}