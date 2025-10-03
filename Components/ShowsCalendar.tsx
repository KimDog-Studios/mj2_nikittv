    "use client";
import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
// Grid replaced with CSS grid via Box for predictable layout
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { db, rtdb } from './firebaseClient';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref as rref, onValue } from 'firebase/database';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type Show = {
  id: string;
  title: string;
  start: Date;
  end?: Date | null;
  venue?: string;
  description?: string;
};

function parseTime(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    // Prefer parsing ISO date/time strings into local Date components to avoid timezone shifts
    // Handle YYYY-MM-DD or YYYY-MM-DDTHH:MM(:SS)
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const dateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY
    const dmyDash4 = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY
    const dmyDash2 = /^\d{2}-\d{2}-\d{2}$/; // DD-MM-YY
    const dmySlash2 = /^\d{2}\/\d{2}\/\d{2}$/; // DD/MM/YY
    if (dateOnly.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (dateTime.test(value)) {
      const [datePart, timePart] = value.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm, ss] = (timePart.split(':').map(Number) as number[]).concat([0, 0]).slice(0, 3);
      return new Date(y, m - 1, d, hh, mm, ss);
    }
    // DD/MM/YYYY or DD-MM-YYYY
    if (dmySlash.test(value) || dmyDash4.test(value)) {
      const sep = value.indexOf('/') > -1 ? '/' : '-';
      const [dd, mm, yyyy] = value.split(sep).map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    // DD-MM-YY or DD/MM/YY -> expand two-digit year
    if (dmyDash2.test(value) || dmySlash2.test(value)) {
      const sep = value.indexOf('/') > -1 ? '/' : '-';
      const [dd, mm, yy] = value.split(sep).map(Number);
      const yyyy = yy < 50 ? 2000 + yy : 1900 + yy;
      return new Date(yyyy, mm - 1, dd);
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    const asNum = Number(value);
    if (!isNaN(asNum)) return new Date(asNum);
  }
  return null;
}

function formatKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ShowsCalendar() {
  const [shows, setShows] = useState<Show[]>([]);
  const [now, setNow] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'upcoming'>('calendar');
  const [venueFilter, setVenueFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  useEffect(() => {
    setError(null);
    // We'll subscribe to both /shows and /bookings and merge them into one list
    let unsubShows: (() => void) | null = null;
    let unsubBookings: (() => void) | null = null;

    function normalizeDateToISO(dateStr: any) {
        if (!dateStr) return '';
        if (typeof dateStr !== 'string') return '';
        // YYYY-MM-DD
        const isoY = /^\d{4}-\d{2}-\d{2}$/;
        if (isoY.test(dateStr)) return dateStr;
        // DD/MM/YYYY or DD-MM-YYYY
        const dmy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
        const dmy2 = /^(\d{2})[\/\-](\d{2})[\/\-](\d{2})$/; // dd-mm-yy
        let m = dateStr.match(dmy);
        if (m) {
          const [, dd, mm, yyyy] = m;
          return `${yyyy}-${mm}-${dd}`;
        }
        m = dateStr.match(dmy2);
        if (m) {
          const [, dd, mm, yy] = m;
          // interpret 2-digit year: 00-49 => 2000-2049, 50-99 => 1950-1999
          const y = Number(yy);
          const yyyy = y < 50 ? 2000 + y : 1900 + y;
          return `${yyyy}-${mm}-${dd}`;
        }
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
        return '';
    }

    const mergeAndSet = (showsArr: Show[], bookingsArr: Show[]) => {
      const merged = [...showsArr, ...bookingsArr];
      merged.sort((a, b) => a.start.getTime() - b.start.getTime());
      setShows(merged);
    };

    if (rtdb) {
      // RTDB listeners
      const showsRef = rref(rtdb, 'shows');
      const bookingsRef = rref(rtdb, 'bookings');
      let latestShows: Show[] = [];
      let latestBookings: Show[] = [];

      unsubShows = onValue(showsRef, (snap: any) => {
        const val = snap.val() || {};
        latestShows = Object.entries(val).map(([k, v]: any) => {
          const s = parseTime(v.start) ?? new Date();
          const e = parseTime(v.end) ?? null;
          return { id: k, title: v.title ?? 'Show', start: s, end: e, venue: v.venue, description: v.description } as Show;
        });
        mergeAndSet(latestShows, latestBookings);
      }, (err: any) => setError(err?.message ?? 'RTDB shows error')) as any;

      unsubBookings = onValue(bookingsRef, (snap: any) => {
        const val = snap.val() || {};
        latestBookings = Object.entries(val).map(([k, v]: any) => {
          // build a start Date from booking.date + booking.time when available using numeric parts (local time)
          const dateISO = normalizeDateToISO(v.date || '');
          let start = parseTime(v.createdAt) ?? new Date();
          if (dateISO) {
            const [yy, mm, dd] = dateISO.split('-').map(Number);
            if (v.time) {
              const [hh, min] = (v.time || '00:00').split(':').map(Number);
              const dt = new Date(yy, mm - 1, dd, hh || 0, min || 0, 0);
              if (!isNaN(dt.getTime())) start = dt;
            } else {
              start = new Date(yy, mm - 1, dd, 0, 0, 0);
            }
          }
          return { id: `booking-${k}`, title: v.name ?? v.location ?? 'Booking', start, end: null, venue: v.location, description: v.message } as Show;
        });
        mergeAndSet(latestShows, latestBookings);
      }, (err: any) => setError(err?.message ?? 'RTDB bookings error')) as any;
    } else {
      try {
        const qShows = query(collection(db, 'shows'), orderBy('start'));
        const qBookings = query(collection(db, 'bookings'));
        let latestShows: Show[] = [];
        let latestBookings: Show[] = [];

        unsubShows = onSnapshot(qShows, (snap) => {
          latestShows = snap.docs.map((d) => {
            const data: any = d.data();
            const s = parseTime(data.start) ?? new Date();
            const e = parseTime(data.end) ?? null;
            return { id: d.id, title: data.title ?? 'Show', start: s, end: e, venue: data.venue, description: data.description } as Show;
          });
          mergeAndSet(latestShows, latestBookings);
        }, (err) => setError(err?.message ?? 'Firestore shows error'));

        unsubBookings = onSnapshot(qBookings, (snap) => {
          latestBookings = snap.docs.map((d) => {
            const data: any = d.data();
            const dateISO = normalizeDateToISO(data.date || '');
            let start = parseTime(data.createdAt) ?? new Date();
            if (dateISO) {
              const [yy, mm, dd] = dateISO.split('-').map(Number);
              if (data.time) {
                const [hh, min] = (data.time || '00:00').split(':').map(Number);
                const dt = new Date(yy, mm - 1, dd, hh || 0, min || 0, 0);
                if (!isNaN(dt.getTime())) start = dt;
              } else {
                start = new Date(yy, mm - 1, dd, 0, 0, 0);
              }
            }
            return { id: `booking-${d.id}`, title: data.name ?? data.location ?? 'Booking', start, end: null, venue: data.location, description: data.message } as Show;
          });
          mergeAndSet(latestShows, latestBookings);
        }, (err) => setError(err?.message ?? 'Firestore bookings error'));
      } catch (err: any) {
        setError(err?.message ?? 'Shows/Bookings read error');
      }
    }

    return () => {
      if (unsubShows) unsubShows();
      if (unsubBookings) unsubBookings();
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startWeekday = startOfMonth.getDay(); // 0..6 (Sun..Sat)

  // map shows to calendar days (yyyy-mm-dd)
  const map: Record<string, Show[]> = {};
  shows.forEach((s) => {
    const sDate = s.start;
    const eDate = s.end ?? s.start;
    // iterate days from sDate to eDate inclusive
    let cursor = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const end = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
    while (cursor <= end) {
      const key = formatKey(cursor);
      if (!map[key]) map[key] = [];
      map[key].push(s);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  const isActive = (s: Show) => {
    const start = s.start.getTime();
    const end = s.end ? s.end.getTime() : start + 1000 * 60 * 60 * 2;
    const t = now.getTime();
    return t >= start && t <= end;
  };

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const openDay = (key: string) => {
    // client-side debug: log the selected key and how many entries exist in the map
    try { console.debug('openDay', key, 'mapCount', Object.keys(map).length, 'itemsForDay', (map[key] || []).length); } catch (e) {}
    setSelectedDay(key);
    setDayDialogOpen(true);
  };

  // build calendar grid cells (including previous/next month fillers)
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const cells: { date: Date; inMonth: boolean; key: string }[] = [];
  const firstCellDate = new Date(year, month, 1 - startWeekday);
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(firstCellDate);
    d.setDate(firstCellDate.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month, key: formatKey(d) });
  }

  const jumpToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const upcomingShows = shows.filter(s => s.start > now).sort((a, b) => a.start.getTime() - b.start.getTime());
  const filteredUpcoming = upcomingShows.filter(s => {
    if (venueFilter && !s.venue?.toLowerCase().includes(venueFilter.toLowerCase())) return false;
    if (dateRangeFilter === 'today') return s.start.toDateString() === now.toDateString();
    if (dateRangeFilter === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return s.start <= weekFromNow;
    }
    if (dateRangeFilter === 'month') {
      const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return s.start <= monthFromNow;
    }
    return true;
  });

  return (
    <Paper sx={{ p: {xs:1, sm:2}, mt: 3, background: 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)', borderRadius: 3, color: '#f5f5f5' }}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>Shows Calendar</Typography>
          <Button variant="outlined" size="small" onClick={jumpToToday}>Today</Button>
        </Stack>
        <Tabs value={viewMode} onChange={(_, newValue) => setViewMode(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Calendar" value="calendar" />
          <Tab label={`Upcoming (${upcomingShows.length})`} value="upcoming" />
        </Tabs>
        {viewMode === 'calendar' && (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Typography variant="caption" sx={{ color: '#e0e0e0' }}>Now: {mounted ? now.toLocaleString() : now.toISOString().replace('T', ' ').slice(0,19)}</Typography>
            <IconButton size="small" onClick={prevMonth}><ChevronLeftIcon /></IconButton>
            <Typography variant="subtitle2" sx={{ minWidth: 140, textAlign: 'center', color: '#ffffff' }}>{mounted ? startOfMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' }) : `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth()+1).padStart(2,'0')}`}</Typography>
            <IconButton size="small" onClick={nextMonth}><ChevronRightIcon /></IconButton>
          </Stack>
        )}
      </Stack>
      <Divider sx={{ my: 1 }} />

      {error ? <Typography color="error">{error}</Typography> : viewMode === 'upcoming' ? (
        <Box sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Filter by Venue"
              variant="outlined"
              size="small"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRangeFilter}
                label="Date Range"
                onChange={(e) => setDateRangeFilter(e.target.value as typeof dateRangeFilter)}
              >
                <MenuItem value="all">All Upcoming</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="h6" sx={{ mt: 2, color: '#ffffff' }}>Upcoming Shows ({filteredUpcoming.length})</Typography>
          <List>
            {filteredUpcoming.map((s) => (
              <ListItem key={s.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <ListItemText
                  primary={`${s.title}${s.venue ? ' @ ' + s.venue : ''}`}
                  secondary={`${mounted ? s.start.toLocaleString() : s.start.toISOString()}${s.end ? ' — ' + (mounted ? s.end.toLocaleString() : s.end.toISOString()) : ''}${s.description ? ' — ' + s.description : ''}`}
                />
                {isActive(s) && <Chip label="LIVE" color="error" size="small" />}
                {!isActive(s) && (s.start.getTime() - now.getTime()) < 86400000 && <Chip label="Soon" color="warning" size="small" />}
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <Box key={d} sx={{ p: 1, textAlign: 'center', background: '#333', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f5f5f5' }}>{d}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {cells.map((c) => {
              const dayShows = map[c.key] || [];
              // avoid computing "today" during SSR to prevent mismatches; only show after mount
              const isToday = mounted ? c.key === formatKey(new Date()) : false;
              const hasUpcoming = dayShows.some(s => s.start > now);
              return (
                <Box
                  key={c.key}
                  onClick={() => openDay(c.key)}
                  sx={{
                    p: 1.25,
                    minHeight: {xs:100, sm:120},
                    borderRadius: 2,
                    cursor: 'pointer',
                    background: c.inMonth ? 'linear-gradient(135deg, #4b0082, #8a2be2)' : '#2a2a2a',
                    boxShadow: c.inMonth ? (isToday ? '0 0 0 3px rgba(25,118,210,0.6)' : hasUpcoming ? '0 0 0 3px rgba(76,175,80,0.4)' : '0 2px 4px rgba(0,0,0,0.3)') : 'none',
                    transition: 'all 0.3s ease',
                    ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14, color: c.inMonth ? '#ffffff' : '#cccccc' }}>{c.date.getDate()}</Typography>
                    {isToday ? <Chip label="Today" size="small" color="primary" /> : null}
                  </Box>

                  <Box sx={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dayShows.slice(0, 4).map((s) => (
                      <Tooltip key={s.id} title={`${s.title} @ ${s.venue || 'N/A'} - ${s.start.toLocaleString()}${s.description ? ' - ' + s.description : ''}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 0.5, borderRadius: 0.5, background: 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffffff' }}>{s.title}</Typography>
                            {isActive(s) ? <Chip label="LIVE" color="error" size="small" sx={{ ml: 0.5 }} /> : (s.start.getTime() - now.getTime()) < 86400000 ? <Chip label="Soon" color="warning" size="small" sx={{ ml: 0.5 }} /> : null}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#e0e0e0' }}>{mounted ? s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.start.toISOString().slice(11,16)}</Typography>
                        </Box>
                      </Tooltip>
                    ))}
                    {dayShows.length > 4 ? <Typography variant="caption" sx={{ color: '#ffffff' }}>+{dayShows.length - 4} more</Typography> : null}
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Shows on {selectedDay}</DialogTitle>
            <DialogContent>
              {selectedDay ? (
                (() => {
                  const dayItems = map[selectedDay] || [];
                  if (!dayItems.length) {
                    // show helpful debug info and nearby counts
                    const prev = (() => {
                      const d = new Date(selectedDay + 'T00:00:00');
                      d.setDate(d.getDate() - 1);
                      return formatKey(d);
                    })();
                    const next = (() => {
                      const d = new Date(selectedDay + 'T00:00:00');
                      d.setDate(d.getDate() + 1);
                      return formatKey(d);
                    })();
                    return (
                      <Box sx={{ p: 1 }}>
                        <Typography variant="body2">No shows found for this date.</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Nearby counts — {prev}: {(map[prev] || []).length} | {selectedDay}: {dayItems.length} | {next}: {(map[next] || []).length}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>If you recently added a show, make sure its date is stored in a recognized format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY).</Typography>
                      </Box>
                    );
                  }
                  return (
                    <List>
                      {dayItems.map((s) => (
                        <React.Fragment key={s.id}>
                          <ListItem>
                            <ListItemText
                              primary={`${s.title}${s.venue ? ' @ ' + s.venue : ''}`}
                              secondary={`${mounted ? s.start.toLocaleString() : s.start.toISOString()}${s.end ? (mounted ? ' — ' + s.end.toLocaleString() : ' — ' + s.end.toISOString()) : ''}${s.description ? ' — ' + s.description : ''}`}
                            />
                            {isActive(s) ? <Chip label="LIVE" color="error" size="small" /> : (s.start.getTime() - now.getTime()) < 86400000 ? <Chip label="Soon" color="warning" size="small" /> : null}
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  );
                })()
              ) : (
                <Typography variant="body2">No date selected</Typography>
              )}
            </DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
              <Button onClick={() => setDayDialogOpen(false)}>Close</Button>
            </Box>
          </Dialog>
        </Box>
      )}
    </Paper>
  );
}
