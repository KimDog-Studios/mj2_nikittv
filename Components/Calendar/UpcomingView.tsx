import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import { Show } from './types';
import { isActive } from './utils';

interface Props {
  filteredUpcoming: Show[];
  venueFilter: string;
  dateRangeFilter: 'all' | 'today' | 'week' | 'month';
  onVenueFilterChange: (value: string) => void;
  onDateRangeFilterChange: (value: 'all' | 'today' | 'week' | 'month') => void;
  now: Date;
  mounted: boolean;
}

export default function UpcomingView({
  filteredUpcoming,
  venueFilter,
  dateRangeFilter,
  onVenueFilterChange,
  onDateRangeFilterChange,
  now,
  mounted
}: Props) {
  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          label="Filter by Venue"
          variant="outlined"
          size="small"
          value={venueFilter}
          onChange={(e) => onVenueFilterChange(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRangeFilter}
            label="Date Range"
            onChange={(e) => onDateRangeFilterChange(e.target.value as typeof dateRangeFilter)}
          >
            <MenuItem value="all">All Upcoming</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Typography variant="h6" sx={{ mt: 2, color: '#ffffff' }}>Upcoming Shows ({filteredUpcoming.length})</Typography>
      <List sx={{ mt: 1 }}>
        {filteredUpcoming.map((s) => (
          <ListItem key={s.id} sx={{ borderBottom: 1, borderColor: 'divider', p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1 }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.25rem' }}>{s.title}</Typography>
                <Box>
                  {isActive(s, now) && <Chip label="LIVE" color="error" sx={{ mr: 1, fontWeight: 600 }} />}
                  {!isActive(s, now) && (s.start.getTime() - now.getTime()) < 86400000 && <Chip label="Soon" color="warning" sx={{ fontWeight: 600 }} />}
                </Box>
              </Box>
              {s.venue && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon sx={{ color: '#e0e0e0', mr: 1 }} />
                  <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>{s.venue}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: s.description ? 1 : 0 }}>
                <ScheduleIcon sx={{ color: '#e0e0e0', mr: 1 }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  {mounted ? s.start.toLocaleDateString() + ' ' + s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.start.toISOString().slice(0,16).replace('T', ' ')}
                  {s.end && ` — ${mounted ? s.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.end.toISOString().slice(11,16)}`}
                </Typography>
              </Box>
              {s.description && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ color: '#e0e0e0', mr: 1, mt: 0.25 }} />
                  <Typography variant="body1" sx={{ color: '#e0e0e0', fontWeight: 500 }}>{s.description}</Typography>
                </Box>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}