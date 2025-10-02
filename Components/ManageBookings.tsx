import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

function ManageBookings() {
  return (
    <Box sx={{
      bgcolor: '#ffffff',
      color: '#232526',
      p: 4,
      borderRadius: 3,
      boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
      maxWidth: 720,
      mx: 'auto',
      mt: 6,
    }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#232526' }}>Booking Application</Typography>
      <Typography variant="body2" sx={{ color: '#555', mb: 2 }}>Fill in your details below to apply for a booking. This form is for demo purposes and does not submit yet.</Typography>
      <Box component="form" noValidate autoComplete="off" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <TextField
          label="Full name"
          placeholder="e.g. John Smith"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#fafafa', borderRadius: 1 }}
        />
        <TextField
          label="Email"
          placeholder="you@example.com"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
          helperText="We will contact you to confirm the booking"
          sx={{ bgcolor: '#fafafa', borderRadius: 1 }}
        />
        <TextField
          label="Phone"
          placeholder="01234 567890"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlinedIcon sx={{ color: '#9e9e9e' }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#fafafa', borderRadius: 1 }}
        />
        <TextField label="Location" placeholder="Town or venue" variant="outlined" sx={{ bgcolor: '#fafafa', borderRadius: 1 }} />
        <TextField label="Preferred Date" placeholder="DD/MM/YYYY" variant="outlined" sx={{ bgcolor: '#fafafa', borderRadius: 1 }} />
        <TextField label="Message" variant="outlined" multiline rows={4} fullWidth sx={{ gridColumn: '1 / -1', bgcolor: '#fafafa', borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" sx={{ background: 'linear-gradient(90deg,#232526,#444)', px: 4, py: 1.2, borderRadius: 2, color: '#fff', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>Submit</Button>
      </Box>
    </Box>
  );
}

export default ManageBookings