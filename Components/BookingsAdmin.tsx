"use client";
import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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

import { db, rtdb } from './firebaseClient';
// Firestore
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
// Realtime DB
import { ref as rref, onValue, update as rtdbUpdate, remove as rtdbRemove } from 'firebase/database';

type Booking = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  date?: string;
  message?: string;
  createdAt?: any;
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

  const handleDelete = async (b: Booking) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    try {
      if (rtdb) {
        await rtdbRemove(rref(rtdb, `bookings/${b.id}`));
      } else {
        await deleteDoc(doc(db, 'bookings', b.id));
      }
      setSnack({ open: true, message: 'Deleted', severity: 'success' });
    } catch (err: any) {
      console.error(err);
      setSnack({ open: true, message: err?.message ?? 'Delete failed', severity: 'error' });
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload = { ...selected } as any;
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

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Bookings</Typography>
      {loading ? <Stack alignItems="center"><CircularProgress /></Stack> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell>{b.location}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>{b.createdAt ? (typeof b.createdAt === 'number' ? (mounted ? new Date(b.createdAt).toLocaleString() : new Date(b.createdAt).toISOString()) : (b.createdAt?.toDate ? (mounted ? b.createdAt.toDate().toLocaleString() : b.createdAt.toDate().toISOString()) : String(b.createdAt))) : ''}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(b)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(b)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit booking</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Full name" value={selected.name ?? ''} onChange={(e) => setSelected({ ...selected, name: e.target.value })} fullWidth />
              <TextField label="Email" value={selected.email ?? ''} onChange={(e) => setSelected({ ...selected, email: e.target.value })} fullWidth />
              <TextField label="Phone" value={selected.phone ?? ''} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} fullWidth />
              <TextField label="Location" value={selected.location ?? ''} onChange={(e) => setSelected({ ...selected, location: e.target.value })} fullWidth />
              <TextField label="Date" value={selected.date ?? ''} onChange={(e) => setSelected({ ...selected, date: e.target.value })} fullWidth />
              <TextField label="Message" value={selected.message ?? ''} onChange={(e) => setSelected({ ...selected, message: e.target.value })} multiline rows={3} fullWidth />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
