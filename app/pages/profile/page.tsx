"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { auth, db } from '@/Components/Utils/firebaseClient';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { EmailTemplates } from '@/Components/Email';
import { Booking } from '@/Components/Booking/Admin/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Fetch additional user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUser({ ...currentUser, ...userDoc.data() });
            } else {
              setUser(currentUser);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(currentUser);
          }
        } else {
          // Not signed in, redirect to sign in
          router.push('/pages/signin-up');
          return;
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const fetchBookings = async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      console.log('Fetching bookings for:', user.email);
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('email', '==', user.email)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const userBookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      setBookings(userBookings);
      console.log('Fetched bookings:', userBookings.length);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageInstance = getStorage();
      const storageRef = ref(storageInstance, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update Firebase Auth profile
      await updateProfile(user, { photoURL });

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL,
        lastSignIn: new Date(),
      });

      // Update local user state
      setUser({ ...user, photoURL });

      console.log('Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #181A1B 0%, rgba(255,215,0,0.1) 50%, #181A1B 100%)', color: 'var(--foreground)', minHeight: '72vh', py: 8, px: { xs: 3, md: 8 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFD700', mb: 2 }}>
            Your Profile
          </Typography>
          <Box sx={{ width: 200, mx: 'auto', mb: 2, background: 'linear-gradient(90deg,#FFD700 0%, #fff0 100%)', height: 4 }} />
        </Box>

        <Paper elevation={8} sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)', mb: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.photoURL}
                onClick={handleAvatarClick}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid #FFD700',
                  boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 25px rgba(255,215,0,0.4)',
                  }
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#FFD700',
                  color: '#000',
                  '&:hover': { bgcolor: '#FFA500' }
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
              {uploading && (
                <CircularProgress
                  size={120}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: '#FFD700'
                  }}
                />
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFD700', mb: 1 }}>
                {user.displayName || 'User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ fontSize: 20, color: '#ccc' }} />
                <Typography variant="body1" sx={{ color: '#ccc' }}>
                  {user.email}
                </Typography>
                {user.emailVerified ? (
                  <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                ) : (
                  <EmailOutlinedIcon sx={{ fontSize: 20, color: '#ff9800' }} />
                )}
              </Box>
              {!user.emailVerified && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
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

                      // Show success message
                      // You could add a snackbar or alert here
                    } catch (error) {
                      console.error('Failed to send verification email:', error);
                    }
                  }}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    '&:hover': {
                      borderColor: '#f57c00',
                      backgroundColor: 'rgba(255, 152, 0, 0.04)',
                    }
                  }}
                >
                  Verify Email
                </Button>
              )}
              <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                Member since {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFA500', color: '#FFA500' } }}
              onClick={() => router.push('/pages/booking')}
            >
              Book New Event
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFA500', color: '#FFA500' } }}
              onClick={() => router.push('/pages/manage_booking')}
            >
              Manage Bookings
            </Button>
            <Button
              variant="contained"
              sx={{ background: 'linear-gradient(90deg,#FFD700,#FFA500)', color: '#000', '&:hover': { background: 'linear-gradient(90deg,#FFA500,#FFD700)' } }}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={8} sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFD700', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon />
            Your Bookings {bookingsLoading ? '(Loading...)' : `(${bookings.length})`}
          </Typography>
          {bookingsLoading ? (
            <CircularProgress sx={{ color: '#FFD700' }} />
          ) : bookings.length === 0 ? (
            <Typography variant="body1" sx={{ color: '#ccc' }}>
              You haven't made any bookings yet. Book your first show today!
            </Typography>
          ) : (
            <Stack spacing={2}>
              {bookings.map((booking) => (
                <Card key={booking.id} sx={{ bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600 }}>
                        Booking #{booking.bookingId}
                      </Typography>
                      <Chip
                        label={booking.status || 'pending'}
                        size="small"
                        sx={{
                          bgcolor: booking.status === 'confirmed' ? '#4caf50' : booking.status === 'cancelled' ? '#f44336' : '#ff9800',
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                        <Typography variant="body2" sx={{ color: '#ddd' }}>
                          {new Date(booking.date!).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                        <Typography variant="body2" sx={{ color: '#ddd' }}>
                          {booking.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                        <Typography variant="body2" sx={{ color: '#ddd' }}>
                          {booking.location} {booking.venue ? `(${booking.venue})` : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      Package: {booking.package}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}