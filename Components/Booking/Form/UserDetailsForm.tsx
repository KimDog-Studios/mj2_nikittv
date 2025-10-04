"use client";
import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { FormState } from './types';
import { locations, possibleTimes, timeToMinutes } from './utils';

interface UserDetailsFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Partial<Record<keyof FormState, string>>;
  dateCounts: Map<string, Map<string, number>>;
  dateTimes: Map<string, Map<string, string[]>>;
  availableTimes: string[];
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  form,
  setForm,
  errors,
  dateCounts,
  dateTimes,
  availableTimes
}) => {
  const theme = useTheme();

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleLocationChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, location: val }));
  };

  const commonFieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 3,
      minHeight: 60,
      border: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
      },
      '&.Mui-focused': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 30px ${theme.palette.primary.main}4D`
      },
      '& .MuiOutlinedInput-input': { color: theme.palette.text.primary },
      '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
      '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
    },
    '& .MuiFormHelperText-root': { color: theme.palette.text.secondary, fontSize: '0.75rem' },
    '& .MuiFormLabel-root.Mui-focused': { color: theme.palette.primary.main }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.primary }}>
        Enter Your Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          label="Full Name"
          placeholder="John Doe"
          variant="outlined"
          value={form.name}
          onChange={handleChange('name')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            )
          }}
          sx={commonFieldSx}
          required
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          fullWidth
          label="Email"
          placeholder="john@example.com"
          variant="outlined"
          value={form.email}
          onChange={(e) => {
            handleChange('email')(e);
            // Reset verification when email changes
            // Note: This logic should be handled in the parent component
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            )
          }}
          sx={commonFieldSx}
          required
          error={!!errors.email}
          helperText={errors.email || 'We\'ll contact you to confirm'}
        />
        <TextField
          fullWidth
          label="Phone"
          placeholder="01234 567890"
          variant="outlined"
          value={form.phone}
          onChange={handleChange('phone')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            )
          }}
          sx={commonFieldSx}
          required
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <FormControl fullWidth variant="outlined" error={!!errors.location} sx={commonFieldSx}>
          <InputLabel id="location-label">Location</InputLabel>
          <Select
            labelId="location-label"
            value={form.location}
            onChange={handleLocationChange}
            label="Location"
            startAdornment={
              <InputAdornment position="start">
                <LocationOnOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            }
            sx={{
              '& .MuiSelect-select': { color: theme.palette.text.primary },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
          >
            {locations.map(loc => (
              <MenuItem key={loc} value={loc} sx={{ color: theme.palette.text.primary, '&:hover': { bgcolor: theme.palette.action.hover } }}>
                {loc}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.location || 'Select your preferred location'}</FormHelperText>
        </FormControl>
        <TextField
          fullWidth
          label="Venue"
          placeholder="Venue or address details"
          variant="outlined"
          value={form.venue}
          onChange={handleChange('venue')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            )
          }}
          sx={commonFieldSx}
          required
          error={!!errors.venue}
          helperText={errors.venue || 'Specific venue or address'}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <DatePicker
              label="Preferred Date"
              value={form.date && dayjs.isDayjs(form.date) ? form.date : null}
              onChange={(newValue) => setForm(prev => ({ ...prev, date: newValue }))}
              shouldDisableDate={(date) => !form.venue ? false : (dateCounts.get(date.format('YYYY-MM-DD'))?.get(form.venue.toLowerCase()) || 0) >= 4}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: commonFieldSx,
                  error: !!errors.date,
                  helperText: errors.date,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    )
                  }
                }
              }}
            />
            <TimePicker
              label="Preferred Time"
              value={form.time && dayjs.isDayjs(form.time) ? form.time : null}
              onChange={(newValue) => setForm(prev => ({ ...prev, time: newValue }))}
              shouldDisableTime={(timeValue) => {
                if (!form.date || !dayjs.isDayjs(form.date)) return false;
                const selectedTimeStr = timeValue.format('HH:mm');
                const selectedMinutes = timeToMinutes(selectedTimeStr);
                const dateStr = form.date.format('YYYY-MM-DD');
                const existingTimes = dateTimes.get(dateStr)?.get(form.venue.toLowerCase()) || [];
                return existingTimes.some(existingTimeStr => {
                  const existingMinutes = timeToMinutes(existingTimeStr);
                  return Math.abs(selectedMinutes - existingMinutes) < 120;
                });
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: commonFieldSx,
                  error: !!errors.time,
                  helperText: errors.time || 'Use 24-hour format',
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    )
                  }
                }
              }}
            />
          </Box>
        </LocalizationProvider>
        {form.date && dayjs.isDayjs(form.date) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {(() => {
                const dateStr = form.date.format('YYYY-MM-DD');
                if (!form.venue) {
                  const totalBookings = Array.from(dateCounts.get(dateStr)?.values() || []).reduce((sum, count) => sum + count, 0);
                  return (availableTimes.length > 0 ? 'Available Time Slots:' : 'No available slots on this date.') + ' (' + totalBookings + ' total booked)';
                } else {
                  const bookingCount = dateCounts.get(dateStr)?.get(form.venue.toLowerCase()) || 0;
                  return (availableTimes.length > 0 ? 'Available Time Slots:' : 'No available slots on this date.') + ' (' + (4 - bookingCount) + '/4 available)';
                }
              })()}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {possibleTimes.map(slot => {
                const isAvailable = availableTimes.includes(slot);
                return (
                  <Button
                    key={slot}
                    variant={form.time && dayjs.isDayjs(form.time) && form.time.format('HH:mm') === slot ? 'contained' : 'outlined'}
                    disabled={!isAvailable}
                    onClick={isAvailable && dayjs.isDayjs(form.date) ? () => setForm(prev => ({ ...prev, time: dayjs(`${(form.date as any).format('YYYY-MM-DD')} ${slot}`) })) : undefined}
                    sx={{ minWidth: 80 }}
                  >
                    {slot}
                  </Button>
                )
              })}
            </Box>
          </Box>
        )}
        <TextField
          fullWidth
          label="Message"
          placeholder="Any additional details..."
          variant="outlined"
          multiline
          rows={3}
          value={form.message}
          onChange={handleChange('message')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MessageOutlinedIcon sx={{ color: 'var(--muted)', alignSelf: 'flex-start', mt: 1 }} />
              </InputAdornment>
            )
          }}
          sx={commonFieldSx}
          required
          error={!!errors.message}
          helperText={errors.message}
        />

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.acceptTerms}
                onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                I accept the{' '}
                <span style={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}>
                  Terms and Conditions
                </span>
                {' '}and{' '}
                <span style={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}>
                  Privacy Policy
                </span>
              </Typography>
            }
          />
          {errors.acceptTerms && (
            <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 1 }}>
              {errors.acceptTerms}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserDetailsForm;