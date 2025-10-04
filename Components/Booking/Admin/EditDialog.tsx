import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Booking } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  selected: Booking | null;
  onSave: () => void;
  saving: boolean;
  onChange: (booking: Booking) => void;
}

export default function EditDialog({ open, onClose, selected, onSave, saving, onChange }: Props) {
  if (!selected) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={selected.name ?? ''}
            onChange={(e) => onChange({ ...selected, name: e.target.value })}
            fullWidth
            required
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <TextField
            label="Email"
            type="email"
            value={selected.email ?? ''}
            onChange={(e) => onChange({ ...selected, email: e.target.value })}
            fullWidth
            required
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <TextField
            label="Phone"
            value={selected.phone ?? ''}
            onChange={(e) => onChange({ ...selected, phone: e.target.value })}
            fullWidth
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <TextField
            label="Location"
            value={selected.location ?? ''}
            onChange={(e) => onChange({ ...selected, location: e.target.value })}
            fullWidth
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <TextField
            label="Date"
            type="date"
            value={selected.date ?? ''}
            onChange={(e) => onChange({ ...selected, date: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true, sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#ffffff' }}>Status</InputLabel>
            <Select
              value={selected.status ?? 'pending'}
              label="Status"
              onChange={(e) => onChange({ ...selected, status: e.target.value as 'pending' | 'confirmed' | 'cancelled' })}
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
            onChange={(e) => onChange({ ...selected, message: e.target.value })}
            multiline
            rows={3}
            fullWidth
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
          <TextField
            label="Admin Notes (Internal)"
            value={selected.adminNotes ?? ''}
            onChange={(e) => onChange({ ...selected, adminNotes: e.target.value })}
            multiline
            rows={2}
            fullWidth
            InputLabelProps={{ sx: { color: '#ffffff' } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ffffff' }, '&:hover fieldset': { borderColor: '#ffffff' }, '&.Mui-focused fieldset': { borderColor: '#ffffff' } }, '& .MuiInputBase-input': { color: '#ffffff' } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} sx={{ color: '#ffffff' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !selected?.name || !selected?.email}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}