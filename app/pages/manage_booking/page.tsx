"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BookingsAdmin from '@/Components/BookingsAdmin';
import ShowsCalendar from '@/Components/ShowsCalendar';
import { auth, db, rtdb } from '@/Components/firebaseClient';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, OAuthProvider, User } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ref, onValue, push, set } from 'firebase/database';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

type Booking = {
  id: string;
  bookingId?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  venue?: string;
  date?: string;
  time?: string;
  message?: string;
  createdAt?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
};

type Message = {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
};

interface DBMessage {
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
}

export default function ManageBookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [bookingIdLookup, setBookingIdLookup] = useState('');
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [chatTab, setChatTab] = useState(0);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // OAuth Providers
  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      setLoading(false);
    });

    // Fallback in case auth doesn't respond
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth timeout, showing login');
        setLoading(false);
      }
    }, 5000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (user && user.email !== 'admin@mj2-studios.co.uk') {
      // Load user bookings
      const loadUserBookings = () => {
        if (rtdb) {
          const bookingsRef = ref(rtdb, 'bookings');
          const unsub = onValue(bookingsRef, (snapshot) => {
            const val = snapshot.val() || {};
            const items: Booking[] = Object.entries(val).map(([k, v]) => ({ ...(v as Booking), id: k })).filter(b => b.email === user.email);
            setUserBookings(items);
          });
          return unsub;
        } else {
          const q = query(collection(db, 'bookings'), where('email', '==', user.email));
          const unsub = onSnapshot(q, (snap) => {
            const items: Booking[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
            setUserBookings(items);
          });
          return unsub;
        }
      };
      const unsub = loadUserBookings();
      return unsub;
    }
  }, [user]);

  // Chat listener
  useEffect(() => {
    if (!viewOpen || !selectedBooking || !rtdb) return;

    const chatRef = ref(rtdb, `chats/${selectedBooking.bookingId || selectedBooking.id}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, msg]) => ({
          id,
          ...(msg as DBMessage)
        })).sort((a, b) => a.timestamp - b.timestamp);
        setChatMessages(msgs);
      } else {
        setChatMessages([]);
      }
    });

    return unsubscribe;
  }, [viewOpen, selectedBooking]);

  const handleLogin = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        setSnack({ open: true, message: 'Account created successfully!', severity: 'success' });
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        setSnack({ open: true, message: 'Logged in successfully!', severity: 'success' });
      }
    } catch (err: unknown) {
      setSnack({ open: true, message: err instanceof Error ? err.message : String(err), severity: 'error' });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleBookingIdLookup = () => {
    if (bookingIdLookup.trim()) {
      router.push(`/pages/booking_status?bookingId=${bookingIdLookup.trim()}`);
    }
  };

  const handleSocialLogin = async (provider: OAuthProvider | GoogleAuthProvider | GithubAuthProvider | FacebookAuthProvider) => {
    try {
      await signInWithPopup(auth, provider);
      setSnack({ open: true, message: 'Logged in successfully!', severity: 'success' });
    } catch (err: unknown) {
      setSnack({ open: true, message: err instanceof Error ? err.message : String(err), severity: 'error' });
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setChatMessages([]);
    setChatTab(0);
    setViewOpen(true);
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedBooking || !rtdb || !user) return;

    const chatRef = ref(rtdb, `chats/${selectedBooking.bookingId || selectedBooking.id}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      sender: user.email === 'admin@mj2-studios.co.uk' ? 'admin' : 'user',
      message: newChatMessage.trim(),
      timestamp: Date.now()
    });
    setNewChatMessage('');
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Login/Signup form
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
              Welcome to MJ2 Studios
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                    '&.Mui-focused': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                    '&.Mui-focused': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                sx={{
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                {isSignUp ? 'Sign Up' : 'Login'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setIsSignUp(!isSignUp)}
                sx={{
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
              </Button>
            </Box>

            {/* Social Login Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'background.paper',
                    px: 2,
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  Other Options
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                Continue with social accounts
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleSocialLogin(googleProvider)}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '2px solid #4285f4',
                    color: '#4285f4',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 8px 25px rgba(66, 133, 244, 0.3)',
                      borderColor: '#3367d6',
                      bgcolor: 'rgba(66, 133, 244, 0.04)'
                    }
                  }}
                  title="Continue with Google"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => handleSocialLogin(githubProvider)}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '2px solid #333',
                    color: '#333',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 8px 25px rgba(51, 51, 51, 0.3)',
                      borderColor: '#24292e',
                      bgcolor: 'rgba(51, 51, 51, 0.04)'
                    }
                  }}
                  title="Continue with GitHub"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#333">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => handleSocialLogin(facebookProvider)}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '2px solid #1877f2',
                    color: '#1877f2',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 8px 25px rgba(24, 119, 242, 0.3)',
                      borderColor: '#166fe5',
                      bgcolor: 'rgba(24, 119, 242, 0.04)'
                    }
                  }}
                  title="Continue with Facebook"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877f2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Button>
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
              Or View Booking by ID
            </Typography>
            <TextField
              fullWidth
              label="Booking ID"
              value={bookingIdLookup}
              onChange={(e) => setBookingIdLookup(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button fullWidth variant="outlined" onClick={handleBookingIdLookup}>
              View Booking Status
            </Button>
          </CardContent>
        </Card>
        <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    );
  }

  const isAdmin = user.email === 'admin@mj2-studios.co.uk';

  return (
    <Box sx={{ minHeight: '80vh', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Manage Bookings</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout ({user.email})</Button>
      </Box>

      {isAdmin ? (
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
          <BookingsAdmin />
          <ShowsCalendar />
        </Box>
      ) : (
        // Customer view
        <>
          <Typography variant="h5" sx={{ mb: 3 }}>Your Bookings</Typography>
          {userBookings.length === 0 ? (
            <Typography>No bookings found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.bookingId}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewBooking(booking)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          <Tabs value={chatTab} onChange={(e, newValue) => setChatTab(newValue)}>
            <Tab label="Details" />
            <Tab label="Chat" />
          </Tabs>
          {chatTab === 0 && selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Booking ID:</strong> {selectedBooking.bookingId}</Typography>
              <Typography><strong>Name:</strong> {selectedBooking.name}</Typography>
              <Typography><strong>Email:</strong> {selectedBooking.email}</Typography>
              <Typography><strong>Phone:</strong> {selectedBooking.phone}</Typography>
              <Typography><strong>Location:</strong> {selectedBooking.location}</Typography>
              <Typography><strong>Venue:</strong> {selectedBooking.venue}</Typography>
              <Typography><strong>Date:</strong> {selectedBooking.date}</Typography>
              <Typography><strong>Time:</strong> {selectedBooking.time}</Typography>
              <Typography><strong>Status:</strong> {selectedBooking.status}</Typography>
              {selectedBooking.message && <Typography><strong>Message:</strong> {selectedBooking.message}</Typography>}
            </Box>
          )}
          {chatTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Chat</Typography>
              <Box sx={{ height: 300, overflowY: 'auto', bgcolor: 'grey.100', p: 2, mb: 2 }}>
                {chatMessages.map((msg) => (
                  <Box key={msg.id} sx={{ mb: 1, textAlign: msg.sender === (isAdmin ? 'admin' : 'user') ? 'right' : 'left' }}>
                    <Typography variant="body2" sx={{ display: 'inline-block', p: 1, bgcolor: msg.sender === (isAdmin ? 'admin' : 'user') ? 'primary.main' : 'grey.300', color: msg.sender === (isAdmin ? 'admin' : 'user') ? 'white' : 'black', borderRadius: 1 }}>
                      {msg.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                onKeyPress={handleChatKeyPress}
                sx={{ mb: 1 }}
              />
              <Button variant="contained" onClick={sendChatMessage} startIcon={<SendIcon />}>
                Send
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
