'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
import { db, rtdb } from '@/Components/Utils/firebaseClient';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, onValue, push, set } from 'firebase/database';

interface Message {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
}

interface BookingData {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  venue: string;
  package: string;
  date: string;
  time: string;
  message: string;
  status?: string; // e.g., 'pending', 'confirmed', 'cancelled'
  createdAt: number;
}

interface DBMessage {
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
}

function BookingStatusPage() {
  const theme = useTheme();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('bookingId');
    setBookingId(id);
  }, []);

  useEffect(() => {
    if (!bookingId || typeof bookingId !== 'string') return;

    let unsubscribe: () => void;

    if (rtdb) {
      // Use Realtime Database
      const bookingsRef = ref(rtdb, 'bookings');
      unsubscribe = onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const bookings = Object.values(data) as BookingData[];
          const booking = bookings.find(b => b.bookingId === bookingId);
          setBookingData(booking || null);
        } else {
          setBookingData(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching booking from RTDB:', error);
        setLoading(false);
      });
    } else {
      // Use Firestore
      const q = query(collection(db, 'bookings'), where('bookingId', '==', bookingId));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setBookingData(doc.data() as BookingData);
        } else {
          setBookingData(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching booking from Firestore:', error);
        setLoading(false);
      });
    }

    return unsubscribe;
  }, [bookingId]);

  // Chat listener
  useEffect(() => {
    if (!bookingId || !rtdb) return;

    const chatRef = ref(rtdb, `chats/${bookingId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data).map(([id, msg]) => ({
          id,
          ...(msg as DBMessage)
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
        // Scroll to bottom
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        setMessages([]);
      }
    });

    return unsubscribe;
  }, [bookingId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !bookingId || !rtdb) return;

    const chatRef = ref(rtdb, `chats/${bookingId}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      sender: 'user',
      message: newMessage.trim(),
      timestamp: Date.now()
    });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#ffd700' }} />
        <Typography sx={{ ml: 2, color: '#fff' }}>Loading booking details...</Typography>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>Booking not found. Please check your booking ID.</Typography>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%)', minHeight: '100vh', width: '100vw', color: '#fff', position: 'relative' }}>
      <style>{`
        body {
          background: linear-gradient(135deg, #000 0%, #1a1a2e 50%, #000 100%);
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        animation: 'fadeInUp 1s ease-out',
      }}>
        <Card sx={{
          maxWidth: 800,
          width: '100%',
          bgcolor: 'rgba(24,26,27,0.9)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          textAlign: 'center',
        }}>
          <CardContent sx={{ p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4rem', color: bookingData.status === 'confirmed' ? '#4caf50' : bookingData.status === 'cancelled' ? '#f44336' : '#ffd700', mb: 2 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
              Booking Status
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
                Booking ID
              </Typography>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace', bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                {bookingData.bookingId}
              </Typography>
            </Box>
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
                Booking Details
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Name:</strong> {bookingData.name}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Email:</strong> {bookingData.email}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Phone:</strong> {bookingData.phone}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Location:</strong> {bookingData.location}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Venue:</strong> {bookingData.venue}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Package:</strong> {bookingData.package}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Date:</strong> {bookingData.date}</Typography></Box>
                <Box><Typography variant="body2" sx={{ color: '#bbb' }}><strong>Time:</strong> {bookingData.time}</Typography></Box>
              </Box>
              {bookingData.message && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#bbb' }}><strong>Message:</strong> {bookingData.message}</Typography>
                </Box>
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#bbb' }}>
              Status: <strong style={{ color: bookingData.status === 'confirmed' ? '#4caf50' : bookingData.status === 'cancelled' ? '#f44336' : '#ffd700' }}>{bookingData.status || 'Pending Confirmation'}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#bbb', mt: 2 }}>
              {bookingData.status === 'confirmed' ? 'Your booking has been confirmed! We look forward to your event.' : bookingData.status === 'cancelled' ? 'Unfortunately, your booking has been cancelled. Please contact us for more information.' : 'Your booking is being reviewed. You will receive an update soon.'}
            </Typography>
          </CardContent>
        </Card>

        {/* Chat Section */}
        <Card sx={{
          maxWidth: 800,
          width: '100%',
          bgcolor: 'rgba(24,26,27,0.9)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          mt: 4,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 3 }}>
              Chat with Support
            </Typography>

            {/* Messages */}
            <Box
              ref={chatContainerRef}
              sx={{
                height: 300,
                overflowY: 'auto',
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 2,
                p: 2,
                mb: 2,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  borderRadius: '3px',
                },
              }}
            >
              {messages.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center', mt: 10 }}>
                  No messages yet. Start a conversation!
                </Typography>
              ) : (
                messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        bgcolor: msg.sender === 'user' ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        p: 1.5,
                        borderRadius: 2,
                        wordWrap: 'break-word',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#bbb',
                  },
                }}
                disabled={!rtdb}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!newMessage.trim() || !rtdb}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                <SendIcon />
              </Button>
            </Box>
            {!rtdb && (
              <Typography variant="body2" sx={{ color: '#f44336', mt: 1 }}>
                Chat is currently unavailable. Please use email support.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default BookingStatusPage;