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
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BookingsAdmin from '@/Components/Booking/Admin';
import ShowsCalendar from '@/Components/Calendar';
import { auth, db, rtdb } from '@/Components/Utils/firebaseClient';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, OAuthProvider, User } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ref, onValue, push, set } from 'firebase/database';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import BarChartIcon from '@mui/icons-material/BarChart';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChatIcon from '@mui/icons-material/Chat';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

type Show = {
   id: string;
   title: string;
   start: Date;
   end?: Date;
   venue?: string;
   description?: string;
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
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
   const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
   const [activeSection, setActiveSection] = useState<'dashboard' | 'bookings' | 'calendar' | 'chat' | 'customers' | 'settings' | 'reports'>('dashboard');
   const [drawerOpen, setDrawerOpen] = useState(false);
   const [allBookings, setAllBookings] = useState<Booking[]>([]);
   const [allShows, setAllShows] = useState<Show[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [chatBooking, setChatBooking] = useState<Booking | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [newChatMessage, setNewChatMessage] = useState('');
    const [conversationPreviews, setConversationPreviews] = useState<Map<string, { lastMessage: string; timestamp: number; unreadCount: number }>>(new Map());
    const [timeFormat, setTimeFormat] = useState<'12' | '24'>(() => {
      if (typeof window !== 'undefined') {
        return (localStorage.getItem('adminTimeFormat') as '12' | '24') || '24';
      }
      return '24';
    });

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

  // Save time format preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTimeFormat', timeFormat);
    }
  }, [timeFormat]);

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
    } else if (user && user.email === 'admin@mj2-studios.co.uk') {
      // Load all bookings for admin dashboard
      const loadAllBookings = () => {
        if (rtdb) {
          const bookingsRef = ref(rtdb, 'bookings');
          const unsub = onValue(bookingsRef, (snapshot) => {
            const val = snapshot.val() || {};
            const items: Booking[] = Object.entries(val).map(([k, v]) => ({ ...(v as Booking), id: k }));
            setAllBookings(items);
          });
          return unsub;
        } else {
          const q = query(collection(db, 'bookings'));
          const unsub = onSnapshot(q, (snap) => {
            const items: Booking[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
            setAllBookings(items);
          });
          return unsub;
        }
      };

      // Load all shows for admin dashboard
      const loadAllShows = () => {
        if (rtdb) {
          const showsRef = ref(rtdb, 'shows');
          const unsub = onValue(showsRef, (snapshot) => {
            const val = snapshot.val() || {};
            const items: Show[] = Object.entries(val).map(([k, v]) => ({
              id: k,
              title: (v as any).title ?? 'Show',
              start: new Date((v as any).start),
              end: (v as any).end ? new Date((v as any).end) : undefined,
              venue: (v as any).venue,
              description: (v as any).description
            }));
            setAllShows(items);
          });
          return unsub;
        } else {
          const q = query(collection(db, 'shows'));
          const unsub = onSnapshot(q, (snap) => {
            const items: Show[] = snap.docs.map((d) => {
              const data = d.data() as any;
              return {
                id: d.id,
                title: data.title ?? 'Show',
                start: data.start?.toDate ? data.start.toDate() : new Date(data.start?.seconds * 1000),
                end: data.end ? (data.end.toDate ? data.end.toDate() : new Date(data.end.seconds * 1000)) : undefined,
                venue: data.venue,
                description: data.description
              };
            });
            setAllShows(items);
          });
          return unsub;
        }
      };
      const unsubBookings = loadAllBookings();
      const unsubShows = loadAllShows();
      return () => {
        unsubBookings();
        unsubShows();
      };
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

  const isAdmin = user?.email === 'admin@mj2-studios.co.uk';

  const capitalizeLocation = (location: string) => {
    return location.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12'
    });
  };

  const totalBookings = allBookings.length;
  const pendingCount = allBookings.filter(b => b.status === 'pending' || !b.status).length;
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = allBookings.filter(b => b.status === 'cancelled').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'bookings', label: 'Bookings Management', icon: <BookIcon /> },
    { id: 'calendar', label: 'Shows Calendar', icon: <CalendarTodayIcon /> },
    { id: 'chat', label: 'Customer Chat', icon: <ChatIcon /> },
    { id: 'customers', label: 'Customers', icon: <PeopleIcon /> },
    { id: 'reports', label: 'Reports', icon: <AssessmentIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderCustomers = () => {
    // Group bookings by email
    const customerMap = new Map<string, { name: string; bookings: Booking[]; lastBooking: Date; phone?: string; location?: string }>();
    allBookings.forEach(booking => {
      if (booking.email) {
        const existing = customerMap.get(booking.email) || { name: booking.name || 'Unknown', bookings: [], lastBooking: new Date(0), phone: booking.phone, location: booking.location };
        existing.bookings.push(booking);
        const bookingDate = typeof booking.createdAt === 'number' ? new Date(booking.createdAt) : new Date(booking.createdAt || 0);
        if (bookingDate > existing.lastBooking) existing.lastBooking = bookingDate;
        customerMap.set(booking.email, existing);
      }
    });


    const customers = Array.from(customerMap.entries()).map(([email, data]) => ({
      email,
      name: capitalizeLocation(data.name),
      totalBookings: data.bookings.length,
      lastBooking: data.lastBooking,
      phone: data.phone,
      location: data.location,
      status: data.bookings.some(b => b.status === 'pending') ? 'Has Pending' : 'All Confirmed',
      pendingCount: data.bookings.filter(b => b.status === 'pending').length
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
      !customerSearchQuery ||
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
      (customer.location && customer.location.toLowerCase().includes(customerSearchQuery.toLowerCase()))
    );

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 700 }}>Customer Database</Typography>

        {/* Customer Search */}
        <TextField
          placeholder="Search customers by name, email, phone, or location..."
          value={customerSearchQuery}
          onChange={(e) => setCustomerSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#2196f3' }
            },
            '& .MuiInputBase-input': { color: '#ffffff' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        {/* Customer Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {filteredCustomers.map((customer) => {
            const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const statusColor = customer.status === 'Has Pending' ? '#ff9800' : '#4caf50';

            return (
              <Paper
                key={customer.email}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }
                }}
              >
                {/* Header with Avatar and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      mr: 2,
                      flexShrink: 0
                    }}
                  >
                    {initials}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                      {customer.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: statusColor, fontWeight: 600, background: 'rgba(255,255,255,0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
                        {customer.status}
                      </Typography>
                      {customer.pendingCount > 0 && (
                        <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>
                          {customer.pendingCount} pending
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Customer Details */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                    <strong>Email:</strong> {customer.email}
                  </Typography>
                  {customer.phone && (
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                      <strong>Phone:</strong> {customer.phone}
                    </Typography>
                  )}
                  {customer.location && (
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                      <strong>Location:</strong> {customer.location}
                    </Typography>
                  )}
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {customer.totalBookings}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                      Total Bookings
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.8rem' }}>
                      Last: {customer.lastBooking.toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ color: '#ffffff', borderColor: '#ffffff', fontSize: '0.75rem', '&:hover': { borderColor: '#cccccc', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => setActiveSection('chat')}
                  >
                    Message
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ color: '#ffffff', borderColor: '#ffffff', fontSize: '0.75rem', '&:hover': { borderColor: '#cccccc', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => window.open(`mailto:${customer.email}`, '_blank')}
                  >
                    Email
                  </Button>
                  {customer.phone && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ color: '#ffffff', borderColor: '#ffffff', fontSize: '0.75rem', '&:hover': { borderColor: '#cccccc', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                      onClick={() => window.open(`tel:${customer.phone}`, '_self')}
                    >
                      Call
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderSettings = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, color: '#ffffff', fontWeight: 700 }}>Settings & Configuration</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Display Settings</Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>Time Format</Typography>
            <ToggleButtonGroup
              value={timeFormat}
              exclusive
              onChange={(e, newFormat) => {
                if (newFormat) {
                  setTimeFormat(newFormat);
                }
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(33,150,243,0.2)',
                    color: '#2196f3',
                    borderColor: '#2196f3',
                    '&:hover': { backgroundColor: 'rgba(33,150,243,0.3)' }
                  },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }
              }}
            >
              <ToggleButton value="12">12 Hour</ToggleButton>
              <ToggleButton value="24">24 Hour</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>Notifications</Typography>
          <TextField
            label="Admin Email"
            defaultValue="admin@mj2-studios.co.uk"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>Email templates for automated responses</Typography>
          <TextField
            label="Confirmation Email Template"
            multiline
            rows={4}
            defaultValue="Dear [NAME],\n\nYour booking has been confirmed!\n\nDetails: [DETAILS]\n\nBest regards,\nMJ2 Studios"
            fullWidth
          />
        </Paper>
        <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Business Settings</Typography>
          <TextField
            label="Business Hours"
            defaultValue="9:00 AM - 4:00 PM"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Contact Phone"
            defaultValue="+44 7368 119079"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }}>Save Settings</Button>
        </Paper>
      </Box>
    </Box>
  );


  const loadChatMessages = async (booking: Booking) => {
    if (!rtdb) return;
    try {
      const chatRef = ref(rtdb, `chats/${booking.bookingId || booking.id}/messages`);
      const snapshot = await new Promise<any>((resolve) => {
        onValue(chatRef, (snap) => resolve(snap.val()), { onlyOnce: true });
      });
      if (snapshot) {
        const msgs = Object.entries(snapshot).map(([id, msg]) => ({
          id,
          ...(msg as DBMessage)
        })).sort((a, b) => a.timestamp - b.timestamp);
        setChatMessages(msgs);

        // Update conversation preview
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg) {
          const customerKey = `${booking.name || 'Unknown'}_${booking.email || ''}`;
          const unreadCount = msgs.filter(msg => msg.sender === 'user').length; // Count all user messages as unread for now
          setConversationPreviews(prev => new Map(prev.set(customerKey, {
            lastMessage: lastMsg.message.length > 50 ? lastMsg.message.substring(0, 50) + '...' : lastMsg.message,
            timestamp: lastMsg.timestamp,
            unreadCount: unreadCount
          })));
        }
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setChatMessages([]);
    }
  };

  const renderChat = () => {
    const sendChatMessage = async () => {
      if (!newChatMessage.trim() || !chatBooking || !rtdb) return;

      const chatRef = ref(rtdb, `chats/${chatBooking.bookingId || chatBooking.id}/messages`);
      const newMsgRef = push(chatRef);
      await set(newMsgRef, {
        sender: 'admin',
        message: newChatMessage.trim(),
        timestamp: Date.now()
      });
      setNewChatMessage('');
      // Add to local state for immediate display
      setChatMessages(prev => [...prev, {
        id: newMsgRef.key || Date.now().toString(),
        sender: 'admin',
        message: newChatMessage.trim(),
        timestamp: Date.now()
      }]);
    };

    const handleChatKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    };

    const handleSelectConversation = (booking: Booking) => {
      setChatBooking(booking);
      loadChatMessages(booking);
      // Reset unread count for this conversation
      const customerKey = `${booking.name || 'Unknown'}_${booking.email || ''}`;
      setConversationPreviews(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(customerKey);
        if (existing) {
          newMap.set(customerKey, { ...existing, unreadCount: 0 });
        }
        return newMap;
      });
    };

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, color: '#ffffff', fontWeight: 700 }}>Customer Chat</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
          {/* Bookings List */}
          <Paper sx={{
            p: 2,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            maxHeight: 600,
            overflowY: 'auto'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Active Conversations</Typography>
            {(() => {
              // Group bookings by customer (name + email) and take the most recent
              const customerMap = new Map<string, Booking & { bookingCount: number }>();
              allBookings
                .filter(b => b.status !== 'cancelled')
                .forEach(booking => {
                  const customerKey = `${booking.name || 'Unknown'}_${booking.email || ''}`;
                  const existing = customerMap.get(customerKey);
                  if (!existing || (Number(booking.createdAt) || 0) > (Number(existing.createdAt) || 0)) {
                    const bookingCount = allBookings.filter(b => b.name === booking.name && b.email === booking.email).length;
                    customerMap.set(customerKey, { ...booking, bookingCount });
                  }
                });

              const uniqueCustomers = Array.from(customerMap.values())
                .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

              return uniqueCustomers.map((booking) => {
                const customerKey = `${booking.name || 'Unknown'}_${booking.email || ''}`;
                const preview = conversationPreviews.get(customerKey);
                const initials = (booking.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();

                return (
                  <Box
                    key={customerKey}
                    onClick={() => handleSelectConversation(booking)}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      background: chatBooking?.id === booking.id ? 'rgba(33,150,243,0.2)' : 'rgba(255,255,255,0.05)',
                      '&:hover': { background: 'rgba(255,255,255,0.1)' },
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    {/* Avatar */}
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${booking.status === 'confirmed' ? '#4caf50' : booking.status === 'cancelled' ? '#f44336' : '#ff9800'}, ${booking.status === 'confirmed' ? '#66bb6a' : booking.status === 'cancelled' ? '#ef5350' : '#ffb74d'})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </Box>

                    {/* Conversation Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                          {booking.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {preview && (
                            <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: '0.75rem' }}>
                              {formatTime(new Date(preview.timestamp))}
                            </Typography>
                          )}
                          {(preview?.unreadCount ?? 0) > 0 && (
                            <Box sx={{
                              minWidth: 18,
                              height: 18,
                              borderRadius: '9px',
                              background: '#2196f3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                {(preview?.unreadCount ?? 0) > 99 ? '99+' : (preview?.unreadCount ?? 0)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {preview ? (
                        <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {preview.lastMessage}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          No messages yet
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" sx={{
                          color: booking.status === 'confirmed' ? '#4caf50' : booking.status === 'cancelled' ? '#f44336' : '#ff9800',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}>
                          {booking.status || 'pending'}
                        </Typography>
                        {booking.bookingCount > 1 && (
                          <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: '0.7rem' }}>
                            • {booking.bookingCount} bookings
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              });
            })()}
          </Paper>

          {/* Chat Area */}
          <Paper sx={{
            p: 3,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 600
          }}>
            {chatBooking ? (
              <>
                <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>
                  Chat with {chatBooking.name}
                </Typography>
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                  {chatMessages.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center', mt: 10 }}>No messages yet.</Typography>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const prevMsg = chatMessages[index - 1];
                      const showTimestamp = !prevMsg || (msg.timestamp - prevMsg.timestamp) > 300000; // 5 minutes
                      const timeString = formatTime(new Date(msg.timestamp));

                      return (
                        <Box key={msg.id} sx={{ mb: 2 }}>
                          {showTimestamp && (
                            <Typography variant="caption" sx={{ color: '#888', display: 'block', textAlign: 'center', mb: 1, fontSize: '0.7rem' }}>
                              {new Date(msg.timestamp).toLocaleDateString()} {timeString}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                            <Box sx={{
                              maxWidth: '70%',
                              bgcolor: msg.sender === 'admin' ? '#0084ff' : '#3e4042',
                              color: '#fff',
                              p: 1.5,
                              borderRadius: msg.sender === 'admin' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              position: 'relative',
                              wordWrap: 'break-word'
                            }}>
                              <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                {msg.message}
                              </Typography>
                              <Typography variant="caption" sx={{
                                opacity: 0.7,
                                fontSize: '0.7rem',
                                display: 'block',
                                textAlign: msg.sender === 'admin' ? 'right' : 'left',
                                mt: 0.5
                              }}>
                                {timeString}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                  />
                  <Button variant="contained" onClick={sendChatMessage} disabled={!newChatMessage.trim()}>
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: '#cccccc', textAlign: 'center', mt: 'auto', mb: 'auto' }}>
                Select a conversation to start chatting
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  const renderReports = () => {
    // Status distribution data for pie chart
    const statusData = [
      { name: 'Confirmed', value: confirmedCount, color: '#4caf50' },
      { name: 'Pending', value: pendingCount, color: '#ff9800' },
      { name: 'Cancelled', value: cancelledCount, color: '#f44336' }
    ].filter(item => item.value > 0);

    // Location analytics
    const locationStats: Record<string, number> = {};
    allBookings.forEach(booking => {
      if (booking.location) {
        const capitalizedLocation = capitalizeLocation(booking.location);
        locationStats[capitalizedLocation] = (locationStats[capitalizedLocation] || 0) + 1;
      }
    });
    const topLocations = Object.entries(locationStats)
      .sort(([,a]: [string, number], [,b]: [string, number]) => b - a)
      .slice(0, 5);

    // Peak hours analysis
    const hourStats = new Array(24).fill(0);
    allBookings.forEach(booking => {
      if (booking.createdAt) {
        const date = typeof booking.createdAt === 'number' ? new Date(booking.createdAt) : new Date(booking.createdAt);
        hourStats[date.getHours()]++;
      }
    });
    const peakHour = hourStats.indexOf(Math.max(...hourStats));

    // Customer insights
    const uniqueCustomers = new Set(allBookings.map(b => b.email).filter(Boolean)).size;
    const avgBookingsPerCustomer = allBookings.length / uniqueCustomers;
    const repeatCustomers = Object.values(
      allBookings.reduce((acc: Record<string, number>, booking) => {
        if (booking.email) {
          acc[booking.email] = (acc[booking.email] || 0) + 1;
        }
        return acc;
      }, {})
    ).filter((count: number) => count > 1).length;

    // Lead time analysis (how far in advance customers book)
    const leadTimes: number[] = [];
    allBookings.forEach(booking => {
      if (booking.createdAt && booking.date) {
        const bookingDate = typeof booking.createdAt === 'number' ? new Date(booking.createdAt) : new Date(booking.createdAt);
        const eventDate = new Date(booking.date);
        const leadTimeDays = Math.floor((eventDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
        if (leadTimeDays >= 0) leadTimes.push(leadTimeDays);
      }
    });
    const avgLeadTime = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : 0;

    // Seasonal/monthly trends
    const monthlyStats: Record<string, number> = {};
    allBookings.forEach(booking => {
      if (booking.createdAt) {
        const date = typeof booking.createdAt === 'number' ? new Date(booking.createdAt) : new Date(booking.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
      }
    });
    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        bookings: count
      }));

    // Venue popularity analysis
    const venueStats: Record<string, number> = {};
    allBookings.forEach(booking => {
      if (booking.venue) {
        const capitalizedVenue = capitalizeLocation(booking.venue);
        venueStats[capitalizedVenue] = (venueStats[capitalizedVenue] || 0) + 1;
      }
    });
    const topVenues = Object.entries(venueStats)
      .sort(([,a]: [string, number], [,b]: [string, number]) => b - a)
      .slice(0, 5);

    // Cancellation rate trends (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentBookings = allBookings.filter(b =>
      b.createdAt && (typeof b.createdAt === 'number' ? new Date(b.createdAt) : new Date(b.createdAt)) >= thirtyDaysAgo
    );
    const recentCancellations = recentBookings.filter(b => b.status === 'cancelled').length;
    const cancellationRate = recentBookings.length > 0 ? Math.round((recentCancellations / recentBookings.length) * 100) : 0;

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, color: '#ffffff', fontWeight: 700 }}>Reports & Analytics</Typography>

        {/* Charts and Analytics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Status Distribution Chart */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Booking Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#333',
                    border: 'none',
                    borderRadius: 8,
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              {statusData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                  <Typography variant="caption" sx={{ color: '#cccccc' }}>
                    {item.name}: {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Location Analytics */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Top Locations</Typography>
            <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
              {topLocations.length === 0 ? (
                <Typography sx={{ color: '#cccccc' }}>No location data available</Typography>
              ) : (
                topLocations.map(([location, count], index) => (
                  <Box key={location} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      {index + 1}. {location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      {count as number} booking{(count as number) !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>

        {/* Additional Analytics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Peak Times */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Peak Booking Time</Typography>
            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold', textAlign: 'center' }}>
              {peakHour.toString().padStart(2, '0')}:00
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center' }}>
              Most active hour
            </Typography>
          </Paper>

          {/* Customer Insights */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Customer Insights</Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
              Total Customers: {uniqueCustomers}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
              Avg Bookings/Customer: {avgBookingsPerCustomer.toFixed(1)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Repeat Customers: {repeatCustomers}
            </Typography>
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Performance Metrics</Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
              Avg Bookings/Day: {Math.round(allBookings.length / 30)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
              Conversion Rate: {Math.round((confirmedCount / allBookings.length) * 100)}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Active Customers: {uniqueCustomers}
            </Typography>
          </Paper>
        </Box>

        {/* Advanced Analytics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Lead Time Analysis */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Booking Lead Time</Typography>
            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold', textAlign: 'center' }}>
              {avgLeadTime}
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center' }}>
              Average days in advance
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0', display: 'block', textAlign: 'center', mt: 1 }}>
              How far ahead customers book
            </Typography>
          </Paper>

          {/* Venue Popularity */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Top Venues</Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {topVenues.length === 0 ? (
                <Typography sx={{ color: '#cccccc', fontSize: '0.9rem' }}>No venue data available</Typography>
              ) : (
                topVenues.map(([venue, count], index) => (
                  <Box key={venue} sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      {index + 1}. {venue}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      {count} bookings
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* Cancellation Rate */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.05) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(244,67,54,0.3)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Cancellation Rate</Typography>
            <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold', textAlign: 'center' }}>
              {cancellationRate}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center' }}>
              Last 30 days
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0', display: 'block', textAlign: 'center', mt: 1 }}>
              {recentCancellations} of {recentBookings.length} bookings
            </Typography>
          </Paper>
        </Box>

        {/* Monthly Trends Chart */}
        <Paper sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          mb: 4
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Monthly Booking Trends</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff'
                }}
              />
              <Line type="monotone" dataKey="bookings" stroke="#4caf50" strokeWidth={3} dot={{ fill: '#4caf50' }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Export Options */}
        <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Export Data</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => window.open('/api/export-bookings', '_blank')}>
              Export Bookings CSV
            </Button>
            <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => window.open('/api/export-customers', '_blank')}>
              Export Customers CSV
            </Button>
            <Button variant="outlined" sx={{ color: '#ffffff', borderColor: '#ffffff' }} onClick={() => window.print()}>
              Print Report
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderDashboard = () => {
    const recentBookings = allBookings
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
      .slice(0, 5);

    const upcomingShows = allShows
      .filter(show => show.start > new Date())
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3);

    const oldPendingBookings = allBookings.filter(b =>
      b.status === 'pending' && b.createdAt &&
      (new Date().getTime() - (typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime())) > 7 * 24 * 60 * 60 * 1000
    ).length;

    // Filter based on search
    const filteredRecentBookings = recentBookings.filter(b =>
      !searchQuery ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUpcomingShows = upcomingShows.filter(s =>
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Prepare chart data for last 30 days
    const now = new Date();
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const count = allBookings.filter(b =>
        b.createdAt && new Date(typeof b.createdAt === 'number' ? b.createdAt : b.createdAt).toISOString().slice(0, 10) === dateStr
      ).length;
      chartData.push({
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        bookings: count
      });
    }

    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, color: '#ffffff', fontWeight: 700 }}>Dashboard Overview</Typography>
  
        {/* Global Search */}
        <TextField
          placeholder="Search bookings, shows, customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#2196f3' }
            },
            '& .MuiInputBase-input': { color: '#ffffff' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ffffff' }} />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              color: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }
            }}>
              <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
                <BarChartIcon sx={{ fontSize: 40, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{totalBookings}</Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Total Bookings</Typography>
              </Box>
            </Paper>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(255,165,0,0.2) 0%, rgba(255,165,0,0.1) 100%)',
              color: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(255,165,0,0.2)',
              border: '1px solid rgba(255,165,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 30px rgba(255,165,0,0.3)' }
            }}>
              <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,165,0,0.1)' }}>
                <PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{pendingCount}</Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Pending</Typography>
              </Box>
            </Paper>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.1) 100%)',
              color: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(76,175,80,0.2)',
              border: '1px solid rgba(76,175,80,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 30px rgba(76,175,80,0.3)' }
            }}>
              <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(76,175,80,0.1)' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{confirmedCount}</Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Confirmed</Typography>
              </Box>
            </Paper>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.1) 100%)',
              color: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(244,67,54,0.2)',
              border: '1px solid rgba(244,67,54,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 30px rgba(244,67,54,0.3)' }
            }}>
              <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(244,67,54,0.1)' }}>
                <CancelIcon sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{cancelledCount}</Typography>
                <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Cancelled</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Booking Trends Chart */}
        <Paper sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          mb: 4
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Booking Trends (Last 30 Days)</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: 8,
                  color: '#ffffff'
                }}
              />
              <Line type="monotone" dataKey="bookings" stroke="#2196f3" strokeWidth={3} dot={{ fill: '#2196f3' }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Additional Dashboard Sections */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 4 }}>
          {/* Recent Bookings */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Recent Bookings</Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredRecentBookings.length === 0 ? (
                <Typography sx={{ color: '#cccccc' }}>No recent bookings found</Typography>
              ) : (
                filteredRecentBookings.map((booking) => (
                  <Box key={booking.id} sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>{booking.name}</Typography>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.5, borderRadius: 1, bgcolor: booking.status === 'confirmed' ? 'rgba(76,175,80,0.2)' : booking.status === 'cancelled' ? 'rgba(244,67,54,0.2)' : 'rgba(255,165,0,0.2)' }}>
                        <Typography variant="caption" sx={{ color: booking.status === 'confirmed' ? '#4caf50' : booking.status === 'cancelled' ? '#f44336' : '#ff9800', fontWeight: 600 }}>
                          {booking.status || 'pending'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#cccccc' }}>
                      {booking.createdAt ? formatDateTime(new Date(typeof booking.createdAt === 'number' ? booking.createdAt : booking.createdAt)) : 'Unknown'}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* Upcoming Shows */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Upcoming Shows</Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredUpcomingShows.length === 0 ? (
                <Typography sx={{ color: '#cccccc' }}>No upcoming shows found</Typography>
              ) : (
                filteredUpcomingShows.map((show) => (
                  <Box key={show.id} sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>{show.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc', mb: 1 }}>
                      {show.start.toLocaleDateString()} at {formatTime(show.start)}
                    </Typography>
                    {show.venue && (
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Venue: {show.venue}</Typography>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Box>

        {/* Alerts & Quick Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          {/* Alerts */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,193,7,0.3)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Alerts</Typography>
            {oldPendingBookings > 0 ? (
              <Box sx={{ p: 2, background: 'rgba(255,193,7,0.2)', borderRadius: 2, border: '1px solid rgba(255,193,7,0.4)' }}>
                <Typography variant="body2" sx={{ color: '#ffeb3b', fontWeight: 600 }}>
                  ⚠️ {oldPendingBookings} pending booking{oldPendingBookings > 1 ? 's' : ''} older than 7 days
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ color: '#cccccc' }}>No urgent alerts</Typography>
            )}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 600 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveSection('bookings')}
                sx={{ color: '#ffffff', borderColor: '#ffffff', '&:hover': { borderColor: '#cccccc', backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                Manage Bookings
              </Button>
              <Button
                variant="outlined"
                onClick={() => setActiveSection('calendar')}
                sx={{ color: '#ffffff', borderColor: '#ffffff', '&:hover': { borderColor: '#cccccc', backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                View Calendar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open('/api/send-email', '_blank')} // Placeholder for bulk email
              >
                Send Bulk Emails
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  };

  const sidebarContent = (
    <Box sx={{ width: 280, p: 2, background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)', height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#ffffff', fontWeight: 700, textAlign: 'center' }}>
        Admin Panel
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => {
                setActiveSection(item.id as typeof activeSection);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25,118,210,0.2)',
                  '&:hover': { backgroundColor: 'rgba(25,118,210,0.3)' }
                },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: activeSection === item.id ? '#2196f3' : '#ffffff' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{ color: '#ffffff' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)', color: '#f5f5f5' }}>
      {/* Professional Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', borderBottom: '1px solid #333', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAdmin && (
              <IconButton
                sx={{ color: '#ffffff', display: { xs: 'block', md: 'none' } }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffffff', letterSpacing: 1 }}>
              MJ2 Studios {isAdmin ? 'Admin' : 'Account'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#b0b0b0', display: { xs: 'none', md: 'block' } }}>
              {isAdmin ? 'Management Dashboard' : 'Your Bookings'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: '#ffffff',
              borderColor: '#ffffff',
              '&:hover': {
                borderColor: '#cccccc',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Logout ({user?.email})
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
        {/* Sidebar - only show for admins */}
        {isAdmin && (
          <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280 }}>
            {sidebarContent}
          </Box>
        )}

        {/* Drawer for mobile - only for admins */}
        {isAdmin && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)' }
            }}
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {isAdmin ? (
            <>
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'bookings' && <BookingsAdmin />}
              {activeSection === 'calendar' && <ShowsCalendar />}
              {activeSection === 'chat' && renderChat()}
              {activeSection === 'customers' && renderCustomers()}
              {activeSection === 'settings' && renderSettings()}
              {activeSection === 'reports' && renderReports()}
            </>
          ) : (
            // Customer view
            <Box sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: 3, p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#ffffff' }}>Your Bookings</Typography>
              {userBookings.length === 0 ? (
                <Typography sx={{ color: '#cccccc' }}>No bookings found.</Typography>
              ) : (
                <Table sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <TableHead sx={{ background: '#333333' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Booking ID</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userBookings.map((booking) => (
                      <TableRow key={booking.id} hover sx={{ '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
                        <TableCell sx={{ color: '#ffffff' }}>{booking.bookingId}</TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>{booking.date}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: booking.status === 'confirmed' ? '#4caf50' : booking.status === 'cancelled' ? '#f44336' : '#ff9800',
                              fontWeight: 600
                            }}
                          >
                            {booking.status || 'pending'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleViewBooking(booking)} sx={{ color: '#ffffff' }}>
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </Box>
      </Box>

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

