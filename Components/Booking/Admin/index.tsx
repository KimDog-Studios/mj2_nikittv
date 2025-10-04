"use client";
import React, { useEffect, useState, useRef } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Checkbox from '@mui/material/Checkbox';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import SendIcon from '@mui/icons-material/Send';
// Removed email-related icons
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { motion } from 'framer-motion';

// Sound configurations
const sounds = {
  newBooking: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  editSaved: "https://www.soundjay.com/misc/sounds/applause.wav",
  deleteAction: "https://www.soundjay.com/misc/sounds/error.wav",
  statusChange: "https://www.soundjay.com/misc/sounds/click.wav",
};

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch(err => console.log('Audio play failed:', err));
};

import { db, rtdb } from '../../Utils/firebaseClient';
// Firestore
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
// Realtime DB
import { ref as rref, onValue, update as rtdbUpdate, remove as rtdbRemove, push, set } from 'firebase/database';
import { EmailTemplates, BookingData } from '../../Email';

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
  adminNotes?: string;
};

type Show = {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  venue?: string;
  description?: string;
};

type RTDBShow = {
  title: string;
  start: string;
  end?: string;
  venue?: string;
  description?: string;
};

type FirestoreShow = {
  title: string;
  start: { seconds: number; nanoseconds: number };
  end?: { seconds: number; nanoseconds: number };
  venue?: string;
  description?: string;
};

type DBMessage = {
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
};

type Message = {
  id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: number;
};

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedForView, setSelectedForView] = useState<Booking | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [cancellationReason, setCancellationReason] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatTab, setChatTab] = useState(0);
  const previousLengthRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    setError(null);

    // Fetch bookings
    const fetchBookings = () => {
      if (rtdb) {
        const bookingsRef = rref(rtdb, 'bookings');
        const unsub = onValue(bookingsRef, (snapshot) => {
          const val = snapshot.val() || {};
          const items: Booking[] = Object.entries(val).map(([k, v]) => ({ ...(v as Omit<Booking, 'id'>), id: k }));
          setBookings(items.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)));
          setLoading(false);
        }, (err) => {
          setError((err as Error)?.message || 'RTDB read error');
          setLoading(false);
        });
        return unsub;
      } else {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
          const items: Booking[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
          setBookings(items);
          setLoading(false);
        }, (err) => {
          setError((err as Error)?.message || 'Firestore read error');
          setLoading(false);
        });
        return unsub;
      }
    };

    // Fetch shows
    const fetchShows = () => {
      if (rtdb) {
        const showsRef = rref(rtdb, 'shows');
        const unsub = onValue(showsRef, (snapshot) => {
          const val = snapshot.val() || {};
          const items: Show[] = Object.entries(val).map(([k, v]) => ({
            id: k,
            title: (v as RTDBShow).title,
            start: new Date((v as RTDBShow).start),
            end: (v as RTDBShow).end ? new Date((v as RTDBShow).end!) : undefined,
            venue: (v as RTDBShow).venue,
            description: (v as RTDBShow).description
          }));
          setShows(items);
        }, (err) => console.error('Shows fetch error', err));
        return unsub;
      } else {
        const q = query(collection(db, 'shows'), orderBy('start'));
        const unsub = onSnapshot(q, (snap) => {
          const items: Show[] = snap.docs.map((d) => {
            const data = d.data() as FirestoreShow;
            return {
              id: d.id,
              title: data.title,
              start: new Date(data.start.seconds * 1000),
              end: data.end ? new Date(data.end.seconds * 1000) : undefined,
              venue: data.venue,
              description: data.description
            };
          });
          setShows(items);
        }, (err) => console.error('Shows fetch error', err));
        return unsub;
      }
    };

    const unsubBookings = fetchBookings();
    const unsubShows = fetchShows();

    return () => {
      if (unsubBookings) unsubBookings();
      if (unsubShows) unsubShows();
    };
  }, []);

  // Play sound on new booking
   useEffect(() => {
     if (bookings.length > previousLengthRef.current && previousLengthRef.current > 0) {
       playSound(sounds.newBooking);
     }
     previousLengthRef.current = bookings.length;
   }, [bookings]);

  // Chat listener
  useEffect(() => {
    if (!viewOpen || !selectedForView || !rtdb) return;

    const chatRef = rref(rtdb, `chats/${selectedForView.bookingId || selectedForView.id}/messages`);
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
  }, [viewOpen, selectedForView]);

  const handleView = (b: Booking) => {
    console.log('Viewing booking:', b);
    setSelectedForView(b);
    setChatMessages([]);
    setChatTab(0);
    setViewOpen(true);
  };

  const handleEdit = (b: Booking) => {
    setSelected(b);
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!bookingToDelete) return;
    try {
      if (rtdb) {
        await rtdbRemove(rref(rtdb, `bookings/${bookingToDelete.id}`));
      } else {
        await deleteDoc(doc(db, 'bookings', bookingToDelete.id));
      }
      setSnack({ open: true, message: 'Deleted', severity: 'success' });
      playSound(sounds.deleteAction);
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, message: (err as Error)?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  const handleDeleteClick = (b: Booking) => {
    setBookingToDelete(b);
    setDeleteDialogOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleQuickStatusUpdate = async (booking: Booking) => {
    const statuses: ('pending' | 'confirmed' | 'cancelled')[] = ['pending', 'confirmed', 'cancelled'];
    const currentIndex = statuses.indexOf(booking.status || 'pending');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const payload = { ...booking };
      delete (payload as any).id;
      const updatePayload = { ...payload, status: nextStatus };
      if (rtdb) {
        await rtdbUpdate(rref(rtdb, `bookings/${booking.id}`), updatePayload);
      } else {
        await updateDoc(doc(db, 'bookings', booking.id), updatePayload);
      }

      // Send status update email if email exists
      let emailSent = false;
      if (booking.email && nextStatus !== 'pending') {
        try {
          const htmlBody = EmailTemplates.getStatusUpdateHtml({ ...booking, email: booking.email }, nextStatus as 'confirmed' | 'cancelled');
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: booking.email,
              subject: nextStatus === 'confirmed' ? 'Booking Confirmed - MJ2 Studios' : 'Booking Update - MJ2 Studios',
              body: htmlBody
            }),
          });
          emailSent = true;
          console.log('Status update email sent successfully');
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }

      setSnack({ open: true, message: `Status updated to ${nextStatus}${emailSent ? ' - Email sent' : ''}`, severity: 'success' });
      playSound(sounds.statusChange);
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, message: (err as Error)?.message ?? 'Update failed', severity: 'error' });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(paginatedBookings.map(b => b.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleSelectBooking = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, id]);
    } else {
      setSelectedBookings(selectedBookings.filter(s => s !== id));
    }
  };

  const handleBulkStatusUpdate = async (status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      for (const id of selectedBookings) {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const { id, ...payload } = booking;
          const updatePayload = { ...payload, status };
          if (rtdb) {
            await rtdbUpdate(rref(rtdb, `bookings/${id}`), updatePayload);
          } else {
            await updateDoc(doc(db, 'bookings', id), updatePayload);
          }

          // Send status update email if email exists and status is not pending
          if (booking.email && status !== 'pending') {
            try {
              const htmlBody = EmailTemplates.getStatusUpdateHtml({ ...booking, email: booking.email }, status);
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: booking.email,
                  subject: status === 'confirmed' ? 'Booking Confirmed - MJ2 Studios' : 'Booking Update - MJ2 Studios',
                  body: htmlBody
                }),
              });
            } catch (emailError) {
              console.error('Failed to send bulk status update email:', emailError);
            }
          }
        }
      }
      setSelectedBookings([]);
      setSnack({ open: true, message: `Bulk status updated to ${status}`, severity: 'success' });
      playSound(sounds.statusChange);
    } catch (err: unknown) {
      setSnack({ open: true, message: (err as Error)?.message ?? 'Bulk update failed', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedBookings) {
        if (rtdb) {
          await rtdbRemove(rref(rtdb, `bookings/${id}`));
        } else {
          await deleteDoc(doc(db, 'bookings', id));
        }
      }
      setSelectedBookings([]);
      setSnack({ open: true, message: 'Bulk deleted', severity: 'success' });
      playSound(sounds.deleteAction);
    } catch (err: unknown) {
      setSnack({ open: true, message: (err as Error)?.message ?? 'Bulk delete failed', severity: 'error' });
    }
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedForView || !rtdb) return;

    const chatRef = rref(rtdb, `chats/${selectedForView.bookingId || selectedForView.id}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      sender: 'admin',
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

// Email sending function removed

  const handleSave = async () => {
    if (!selected) return;
    if (!selected.name || !selected.email) {
      setSnack({ open: true, message: 'Name and Email are required', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...selected };
      delete (payload as any).id;
      const updatePayload = { ...payload, status: selected.status || 'pending' };
      if (rtdb) {
        await rtdbUpdate(rref(rtdb, `bookings/${selected.id}`), updatePayload);
      } else {
        await updateDoc(doc(db, 'bookings', selected.id), updatePayload);
      }
      setEditOpen(false);
      setSnack({ open: true, message: 'Saved', severity: 'success' });
      playSound(sounds.editSaved);
    } catch (err: unknown) {
      console.error(err);
      setSnack({ open: true, message: (err as Error)?.message ?? 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending' || !b.status).length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(bookings.map(b => b.location).filter(Boolean)));

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = !searchTerm ||
      (b.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.phone?.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || b.location === locationFilter;
    const matchesDateRange = (!startDate || !b.date || new Date(b.date) >= new Date(startDate)) &&
                             (!endDate || !b.date || new Date(b.date) <= new Date(endDate));
    return matchesSearch && matchesStatus && matchesLocation && matchesDateRange;
  });

  // Sort bookings
  const sortedBookings = filteredBookings.sort((a, b) => {
    let aValue: string | number, bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'date':
        aValue = new Date(a.date || '1970-01-01').getTime();
        bValue = new Date(b.date || '1970-01-01').getTime();
        break;
      case 'status':
        aValue = a.status || 'pending';
        bValue = b.status || 'pending';
        break;
      case 'createdAt':
      default:
        aValue = typeof a.createdAt === 'number' ? a.createdAt : ((a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : 0);
        bValue = typeof b.createdAt === 'number' ? b.createdAt : ((b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : 0);
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedBookings = sortedBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const hasShowOnDate = (dateStr: string) => {
    return shows.some(show => {
      const showDate = show.start.toISOString().slice(0, 10);
      return showDate === dateStr;
    });
  };

  const getShowOnDate = (dateStr: string) => {
    return shows.find(show => {
      const showDate = show.start.toISOString().slice(0, 10);
      return showDate === dateStr;
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Location', 'Date', 'Status', 'Message', 'Created'],
      ...filteredBookings.map(b => [
        b.name || '',
        b.email || '',
        b.phone || '',
        b.location || '',
        b.date || '',
        b.status || 'pending',
        b.message || '',
        b.createdAt ? (typeof b.createdAt === 'number' ? new Date(b.createdAt).toISOString() : ((b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().toISOString() : String(b.createdAt))) : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <Paper sx={{ mt: 4, p: {xs:1, sm:3}, borderRadius: 3, background: 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)', color: '#f5f5f5', boxShadow: 3 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#ffffff' }}>Bookings Management</Typography>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 700 }}>Dashboard Overview</Typography>
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
        </motion.div>

      {/* Search and Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ sx: { color: '#ffffff' } }}
          sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#ffffff' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiSelect-select': { color: '#ffffff' } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: '#ffffff' }}>Location</InputLabel>
          <Select
            value={locationFilter}
            label="Location"
            onChange={(e) => setLocationFilter(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiSelect-select': { color: '#ffffff' } }}
          >
            <MenuItem value="all">All Locations</MenuItem>
            {uniqueLocations.map(location => (
              <MenuItem key={location} value={location}>{location}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          InputLabelProps={{ shrink: true, sx: { color: '#ffffff' } }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          InputLabelProps={{ shrink: true, sx: { color: '#ffffff' } }}
        />
        <Button variant="contained" startIcon={<GetAppIcon />} onClick={exportToCSV}>
          Export CSV
        </Button>
        </Box>
      </motion.div>

      {loading ? <Stack alignItems="center"><CircularProgress /></Stack> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}>
          <Box>
            {selectedBookings.length > 0 && (
              <Box sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 1 }} color="#ffffff">
                  {selectedBookings.length} selected
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={() => handleBulkStatusUpdate('confirmed')} sx={{ color: '#ffffff', borderColor: '#ffffff' }}>
                    Confirm Selected
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => handleBulkStatusUpdate('cancelled')} sx={{ color: '#ffffff', borderColor: '#ffffff' }}>
                    Cancel Selected
                  </Button>
                  <Button variant="outlined" size="small" color="error" onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                </Stack>
              </Box>
            )}
            <TableContainer sx={{ overflowX: 'auto', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <Table sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
              <TableHead sx={{ bgcolor: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)', borderBottom: '2px solid #555' }}>
                <TableRow>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>
                    <Checkbox
                      indeterminate={selectedBookings.length > 0 && selectedBookings.length < paginatedBookings.length}
                      checked={paginatedBookings.length > 0 && selectedBookings.length === paginatedBookings.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      sx={{ color: '#ffffff', '&.Mui-checked': { color: '#ffffff' } }}
                    />
                  </TableCell>
                  <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', userSelect: 'none', color: '#ffffff', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: '#ffffff' }} />
                      Name
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleSort('status')} sx={{ cursor: 'pointer', userSelect: 'none', color: '#ffffff', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon sx={{ mr: 1, color: '#ffffff' }} />
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer', userSelect: 'none', color: '#ffffff', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon sx={{ mr: 1, color: '#ffffff' }} />
                      Created
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="small" sx={{ color: '#ffffff', ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', borderBottom: 'none' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((b, index) => {
                  console.log('Rendering booking row for:', b.name, 'status:', b.status, 'email:', b.email);
                  return (
                  <TableRow
                    key={b.id}
                    hover
                    sx={{
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', transform: 'scale(1.01)', transition: 'all 0.2s ease' },
                      bgcolor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ color: '#ffffff', borderBottom: 'none' }}>
                      <Checkbox
                        checked={selectedBookings.includes(b.id)}
                        onChange={(e) => handleSelectBooking(b.id, e.target.checked)}
                        sx={{ color: '#ffffff', '&.Mui-checked': { color: '#ffffff' } }}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleView(b)} sx={{ color: '#ffffff', cursor: 'pointer', borderBottom: 'none', fontSize: '0.95rem' }}>{b.name}</TableCell>
                    <TableCell onClick={() => handleQuickStatusUpdate(b)} sx={{ cursor: 'pointer', borderBottom: 'none' }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 1, bgcolor: b.status === 'confirmed' ? 'rgba(76,175,80,0.2)' : b.status === 'cancelled' ? 'rgba(244,67,54,0.2)' : 'rgba(255,165,0,0.2)' }}>
                        <Typography
                          sx={{
                            color: b.status === 'confirmed' ? '#4caf50' : b.status === 'cancelled' ? '#f44336' : '#ff9800',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          {b.status || 'pending'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#cccccc', borderBottom: 'none', fontSize: '0.9rem' }}>{b.createdAt ? (typeof b.createdAt === 'number' ? (mounted ? new Date(b.createdAt).toLocaleString() : new Date(b.createdAt).toISOString()) : ((b.createdAt as any)?.toDate ? (mounted ? (b.createdAt as any).toDate().toLocaleString() : (b.createdAt as any).toDate().toISOString()) : String(b.createdAt))) : ''}</TableCell>
                    <TableCell align="right" sx={{ borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleView(b)} sx={{ color: '#2196f3', '&:hover': { bgcolor: 'rgba(33,150,243,0.1)' } }} title="View details">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(b)} sx={{ color: '#3f51b5', '&:hover': { bgcolor: 'rgba(63,81,181,0.1)' } }} title="Edit booking">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(b)} sx={{ color: '#f44336', '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' } }} title="Delete booking">
                          <DeleteIcon />
                        </IconButton>
                        {b.phone && (
                          <IconButton
                            size="small"
                            onClick={() => handleCall(b.phone!)}
                            sx={{ color: '#4caf50', '&:hover': { bgcolor: 'rgba(76,175,80,0.1)' } }}
                            title="Call customer"
                          >
                            <PhoneIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
            <TablePagination
              component="div"
              count={sortedBookings.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
          </motion.div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        BackdropProps={{
          sx: { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.5)' }
        }}
        PaperProps={{
          sx: { background: 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)', color: '#f5f5f5' }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ffffff' }}>Are you sure you want to delete this booking? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#ffffff' }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          sx: { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.5)' }
        }}
        PaperProps={{
          sx: { background: 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)', color: '#f5f5f5' }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff' }}>Edit Booking</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Full name"
                value={selected.name ?? ''}
                onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <TextField
                label="Email"
                type="email"
                value={selected.email ?? ''}
                onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <TextField
                label="Phone"
                value={selected.phone ?? ''}
                onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                fullWidth
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <TextField
                label="Location"
                value={selected.location ?? ''}
                onChange={(e) => setSelected({ ...selected, location: e.target.value })}
                fullWidth
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <TextField
                label="Date"
                type="date"
                value={selected.date ?? ''}
                onChange={(e) => setSelected({ ...selected, date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true, sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ffffff' }}>Status</InputLabel>
                <Select
                  value={selected.status ?? 'pending'}
                  label="Status"
                  onChange={(e) => setSelected({ ...selected, status: e.target.value as 'pending' | 'confirmed' | 'cancelled' })}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiSelect-select': { color: '#ffffff' } }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Message"
                value={selected.message ?? ''}
                onChange={(e) => setSelected({ ...selected, message: e.target.value })}
                multiline
                rows={3}
                fullWidth
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
              <TextField
                label="Admin Notes (Internal)"
                value={selected.adminNotes ?? ''}
                onChange={(e) => setSelected({ ...selected, adminNotes: e.target.value })}
                multiline
                rows={2}
                fullWidth
                InputLabelProps={{ sx: { color: '#ffffff' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving} sx={{ color: '#ffffff' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !selected?.name || !selected?.email}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="md"
        BackdropProps={{
          sx: { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.5)' }
        }}
        PaperProps={{
          sx: { background: 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)', color: '#f5f5f5' }
        }}
      >
        <DialogTitle sx={{ color: '#ffffff' }}>Booking Details</DialogTitle>
        <DialogContent>
          <Tabs value={chatTab} onChange={(e, newValue) => setChatTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Details" sx={{ color: '#ffffff' }} />
            <Tab label="Chat" sx={{ color: '#ffffff' }} />
          </Tabs>
          {chatTab === 0 && selectedForView && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{selectedForView.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mr: 1 }}>{selectedForView.email}</Typography>
                <IconButton size="small" href={`mailto:${selectedForView.email}`} sx={{ color: '#ffffff' }} title="Send email">
                  <EmailIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mr: 1 }}>{selectedForView.phone}</Typography>
                <IconButton size="small" href={`tel:${selectedForView.phone}`} sx={{ color: '#ffffff' }} title="Call">
                  <PhoneIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{selectedForView.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mr: 1 }}>{selectedForView.date}</Typography>
                {hasShowOnDate(selectedForView.date!) && (
                  <IconButton size="small" onClick={() => {
                    const show = getShowOnDate(selectedForView.date!);
                    if (show) {
                      alert(`Edit show: ${show.title}`);
                    }
                  }} sx={{ color: '#ffffff' }} title="Edit Show">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  Status: <span style={{ color: selectedForView.status === 'confirmed' ? '#4caf50' : selectedForView.status === 'cancelled' ? '#f44336' : '#ff9800' }}>{selectedForView.status || 'pending'}</span>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  Created: {selectedForView.createdAt ? (typeof selectedForView.createdAt === 'number' ? (mounted ? new Date(selectedForView.createdAt).toLocaleString() : new Date(selectedForView.createdAt).toISOString()) : ((selectedForView.createdAt as any)?.toDate ? (mounted ? (selectedForView.createdAt as any).toDate().toLocaleString() : (selectedForView.createdAt as any).toDate().toISOString()) : String(selectedForView.createdAt))) : ''}
                </Typography>
              </Box>
              {selectedForView.bookingId && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon sx={{ mr: 1, color: '#e0e0e0' }} />
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                    Booking ID: {selectedForView.bookingId}
                  </Typography>
                </Box>
              )}
              {selectedForView.message && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                  <InfoIcon sx={{ mr: 1, mt: 0.25, color: '#e0e0e0' }} />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mb: 0.5 }}>Message:</Typography>
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{selectedForView.message}</Typography>
                  </Box>
                </Box>
              )}
              {selectedForView.adminNotes && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                  <InfoIcon sx={{ mr: 1, mt: 0.25, color: '#e0e0e0' }} />
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mb: 0.5 }}>Admin Notes:</Typography>
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>{selectedForView.adminNotes}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {chatTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>Chat with Customer</Typography>
              <Box sx={{ height: 300, overflowY: 'auto', bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 1, mb: 2 }}>
                {chatMessages.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#bbb', textAlign: 'center', mt: 10 }}>No messages yet.</Typography>
                ) : (
                  chatMessages.map((msg) => (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start', mb: 1 }}>
                      <Box sx={{ maxWidth: '70%', bgcolor: msg.sender === 'admin' ? '#2196f3' : 'rgba(255,255,255,0.1)', color: '#fff', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2">{msg.message}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString()}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
                />
                <Button variant="contained" onClick={sendChatMessage} disabled={!newChatMessage.trim()} startIcon={<SendIcon />} sx={{ minWidth: 80 }}>
                  Send
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)} sx={{ color: '#ffffff' }}>Close</Button>
        </DialogActions>
      </Dialog>

        <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>

        {/* Bulk Email Functions */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>Bulk Email Functions</Typography>

          {/* Cancellation Reason Input */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Cancellation Reason (for cancellation emails)"
              placeholder="Please enter the reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              multiline
              rows={2}
              InputLabelProps={{ sx: { color: '#ffffff' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ffffff' },
                  '&:hover fieldset': { borderColor: '#ffffff' },
                  '&.Mui-focused fieldset': { borderColor: '#ffffff' }
                },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                const confirmedBookings = bookings.filter(b => b.status === 'confirmed' && b.email);
                if (confirmedBookings.length === 0) {
                  setSnack({ open: true, message: 'No confirmed bookings with email addresses found.', severity: 'error' });
                  return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const booking of confirmedBookings) {
                  try {
                    const htmlBody = EmailTemplates.getStatusUpdateHtml({ ...booking, email: booking.email! }, 'confirmed');
                    await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: booking.email,
                        subject: 'Booking Confirmed - MJ2 Studios',
                        body: htmlBody
                      }),
                    });
                    successCount++;
                  } catch (error) {
                    errorCount++;
                    console.error('Failed to send confirmation email to:', booking.email, error);
                  }
                }

                setSnack({
                  open: true,
                  message: `Sent ${successCount} confirmation emails${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
                  severity: errorCount > 0 ? 'error' : 'success'
                });
              }}
            >
              Send Confirmation Emails to All Confirmed Bookings
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!cancellationReason.trim()) {
                  setSnack({ open: true, message: 'Please enter a cancellation reason.', severity: 'error' });
                  return;
                }

                const cancelledBookings = bookings.filter(b => b.status === 'cancelled' && b.email);
                if (cancelledBookings.length === 0) {
                  setSnack({ open: true, message: 'No cancelled bookings with email addresses found.', severity: 'error' });
                  return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const booking of cancelledBookings) {
                  try {
                    const htmlBody = EmailTemplates.getStatusUpdateHtml({ ...booking, email: booking.email! }, 'cancelled', cancellationReason || undefined);
                    await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: booking.email,
                        subject: 'Booking Update - MJ2 Studios',
                        body: htmlBody
                      }),
                    });
                    successCount++;
                  } catch (error) {
                    errorCount++;
                    console.error('Failed to send cancellation email to:', booking.email, error);
                  }
                }

                setSnack({
                  open: true,
                  message: `Sent ${successCount} cancellation emails${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
                  severity: errorCount > 0 ? 'error' : 'success'
                });
              }}
            >
              Send Cancellation Emails to All Cancelled Bookings
            </Button>
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
}
