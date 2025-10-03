"use client";
import React, { useEffect, useState } from 'react';
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
// Removed email-related icons
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
import Fade from '@mui/material/Fade';

import { db, rtdb } from './firebaseClient';
// Firestore
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
// Realtime DB
import { ref as rref, onValue, update as rtdbUpdate, remove as rtdbRemove } from 'firebase/database';
// Removed Resend email service import

type Booking = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  date?: string;
  message?: string;
  createdAt?: any;
  status?: 'pending' | 'confirmed' | 'cancelled';
};

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    setError(null);
    if (rtdb) {
      // Realtime DB listener
      const bookingsRef = rref(rtdb, 'bookings');
      const unsub = onValue(bookingsRef, (snapshot) => {
        const val = snapshot.val() || {};
        const items: Booking[] = Object.entries(val).map(([k, v]: any) => ({ id: k, ...v }));
        setBookings(items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setLoading(false);
      }, (err) => {
        setError(err?.message || 'RTDB read error');
        setLoading(false);
      });
      return () => unsub();
    } else {
      // Firestore listener
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const items: Booking[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        setBookings(items);
        setLoading(false);
      }, (err) => {
        setError(err?.message || 'Firestore read error');
        setLoading(false);
      });
      return () => unsub();
    }
  }, []);

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
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, message: err?.message ?? 'Delete failed', severity: 'error' });
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

// Email sending function removed

  const handleSave = async () => {
    if (!selected) return;
    if (!selected.name || !selected.email) {
      setSnack({ open: true, message: 'Name and Email are required', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...selected, status: selected.status || 'pending' } as any;
      delete payload.id;
      if (rtdb) {
        await rtdbUpdate(rref(rtdb, `bookings/${selected.id}`), payload);
      } else {
        await updateDoc(doc(db, 'bookings', selected.id), payload);
      }
      setEditOpen(false);
      setSnack({ open: true, message: 'Saved', severity: 'success' });
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, message: err?.message ?? 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = !searchTerm ||
      (b.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.phone?.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort bookings
  const sortedBookings = filteredBookings.sort((a, b) => {
    let aValue: any, bValue: any;

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
        aValue = new Date(a.date || '1970-01-01');
        bValue = new Date(b.date || '1970-01-01');
        break;
      case 'status':
        aValue = a.status || 'pending';
        bValue = b.status || 'pending';
        break;
      case 'createdAt':
      default:
        aValue = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        bValue = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
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
        b.createdAt ? (typeof b.createdAt === 'number' ? new Date(b.createdAt).toISOString() : (b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : String(b.createdAt))) : ''
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
    <Fade in={true} timeout={600}>
      <Paper sx={{ mt: 4, p: {xs:1, sm:3}, borderRadius: 2, boxShadow: 3 }}>
        <Fade in={true} timeout={800}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Bookings Management</Typography>
        </Fade>

      {/* Search and Filter Bar */}
      <Fade in={true} timeout={1000}>
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
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<GetAppIcon />} onClick={exportToCSV}>
          Export CSV
        </Button>
        </Box>
      </Fade>

      {loading ? <Stack alignItems="center"><CircularProgress /></Stack> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error ? (
        <Fade in={true} timeout={1200}>
          <Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <strong>Name</strong>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleSort('email')} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <strong>Email</strong>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell onClick={() => handleSort('date')} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <strong>Date</strong>
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleSort('status')} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <strong>Status</strong>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell onClick={() => handleSort('createdAt')} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <strong>Created</strong>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((b) => (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{b.location}</TableCell>
                    <TableCell>{b.date}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: b.status === 'confirmed' ? 'green' : b.status === 'cancelled' ? 'red' : 'orange',
                          fontWeight: 'bold'
                        }}
                      >
                        {b.status || 'pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>{b.createdAt ? (typeof b.createdAt === 'number' ? (mounted ? new Date(b.createdAt).toLocaleString() : new Date(b.createdAt).toISOString()) : (b.createdAt?.toDate ? (mounted ? b.createdAt.toDate().toLocaleString() : b.createdAt.toDate().toISOString()) : String(b.createdAt))) : ''}</TableCell>
                    <TableCell align="right">
                      {b.phone && (
                        <IconButton
                          size="small"
                          onClick={() => handleCall(b.phone!)}
                          color="success"
                          title="Call customer"
                          sx={{ mr: 1 }}
                        >
                          <PhoneIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleEdit(b)} color="primary" title="Edit booking">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(b)} color="error" title="Delete booking">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
        </Fade>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this booking? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Full name"
                value={selected.name ?? ''}
                onChange={(e) => setSelected({ ...selected, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={selected.email ?? ''}
                onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={selected.phone ?? ''}
                onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Location"
                value={selected.location ?? ''}
                onChange={(e) => setSelected({ ...selected, location: e.target.value })}
                fullWidth
              />
              <TextField
                label="Date"
                type="date"
                value={selected.date ?? ''}
                onChange={(e) => setSelected({ ...selected, date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selected.status ?? 'pending'}
                  label="Status"
                  onChange={(e) => setSelected({ ...selected, status: e.target.value as 'pending' | 'confirmed' | 'cancelled' })}
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
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !selected?.name || !selected?.email}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

        <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Paper>
    </Fade>
  );
}
