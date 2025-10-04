"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import { auth } from '@/Components/Utils/firebaseClient';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // already signed in
        router.push('/pages/manage_booking');
      }
    });
    return () => unsub();
  }, [router]);

  const handleEmailSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/pages/manage_booking');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err ?? 'Sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in removed — admin sign-in uses email/password only

  return (
    <>
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper elevation={8} sx={{ width: 480, p: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Admin sign in</Typography>
              <Typography variant="caption" color="text.secondary">Restricted access — admins only</Typography>
            </Box>
          </Stack>
          <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} variant="outlined" InputProps={{ startAdornment: (<InputAdornment position="start">@</InputAdornment>) }} />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ mb: 2 }} variant="outlined" />
            {error ? <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography> : null}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" onClick={handleEmailSignIn} disabled={loading || !email || !password}>Sign in</Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
