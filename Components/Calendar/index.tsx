"use client";
import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarView from './CalendarView';
import UpcomingView from './UpcomingView';
import DayDialog from './DayDialog';
import { db, rtdb } from '../Utils/firebaseClient';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref as rref, onValue, DataSnapshot } from 'firebase/database';
import { Show } from './types';
import { parseTime, formatKey, normalizeDateToISO } from './utils';

function ShowsCalendar() {
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

      unsubShows = onValue(showsRef, (snap: DataSnapshot) => {
        const val = snap.val() || {};
        latestShows = Object.entries(val).map(([k, v]) => {
          const s = parseTime((v as any).start) ?? new Date();
          const e = parseTime((v as any).end) ?? null;
          return { id: k, title: (v as any).title ?? 'Show', start: s, end: e, venue: (v as any).venue, description: (v as any).description } as Show;
        });
        mergeAndSet(latestShows, latestBookings);
      }, (err: unknown) => setError(err instanceof Error && err.message ? err.message : 'RTDB shows error'));

      unsubBookings = onValue(bookingsRef, (snap: DataSnapshot) => {
        const val = snap.val() || {};
        latestBookings = Object.entries(val).map(([k, v]) => {
          // build a start Date from booking.date + booking.time when available using numeric parts (local time)
          const dateISO = normalizeDateToISO((v as any).date || '');
          let start = parseTime((v as any).createdAt) ?? new Date();
          if (dateISO) {
            const [yy, mm, dd] = dateISO.split('-').map(Number);
            if ((v as any).time) {
              const [hh, min] = ((v as any).time || '00:00').split(':').map(Number);
              const dt = new Date(yy, mm - 1, dd, hh || 0, min || 0, 0);
              if (!isNaN(dt.getTime())) start = dt;
            } else {
              start = new Date(yy, mm - 1, dd, 0, 0, 0);
            }
          }
          return { id: `booking-${k}`, title: (v as any).name ?? (v as any).location ?? 'Booking', start, end: null, venue: (v as any).location, description: (v as any).message } as Show;
        });
        mergeAndSet(latestShows, latestBookings);
      }, (err: unknown) => setError(err instanceof Error && err.message ? err.message : 'RTDB bookings error'));
    } else {
      try {
        const qShows = query(collection(db, 'shows'), orderBy('start'));
        const qBookings = query(collection(db, 'bookings'));
        let latestShows: Show[] = [];
        let latestBookings: Show[] = [];

        unsubShows = onSnapshot(qShows, (snap) => {
          latestShows = snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            const s = parseTime(data.start) ?? new Date();
            const e = parseTime(data.end) ?? null;
            return { id: d.id, title: data.title ?? 'Show', start: s, end: e, venue: data.venue, description: data.description } as Show;
          });
          mergeAndSet(latestShows, latestBookings);
        }, (err) => setError(err?.message ?? 'Firestore shows error'));

        unsubBookings = onSnapshot(qBookings, (snap) => {
          latestBookings = snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            const dateISO = normalizeDateToISO(data.date || '');
            let start = parseTime(data.createdAt) ?? new Date();
            if (dateISO) {
              const [yy, mm, dd] = dateISO.split('-').map(Number);
              if (data.time) {
                const timeStr = typeof data.time === 'string' ? data.time : '00:00';
                const [hh, min] = (timeStr || '00:00').split(':').map(Number);
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
      } catch (err: unknown) {
        setError(err instanceof Error && err.message ? err.message : 'Shows/Bookings read error');
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
    const cursor = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const end = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
    while (cursor <= end) {
      const key = formatKey(cursor);
      if (!map[key]) map[key] = [];
      map[key].push(s);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

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
    console.debug('openDay', key, 'mapCount', Object.keys(map).length, 'itemsForDay', (map[key] || []).length);
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
        {viewMode === 'calendar' && upcomingShows.length > 0 && (
          <Box sx={{ mt: 1, p: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600 }}>Next Upcoming Shows</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 0.5, overflowX: { xs: 'hidden', sm: 'auto' } }}>
              {upcomingShows.slice(0, 3).map((s) => (
                <Box key={s.id} sx={{ minWidth: { xs: '100%', sm: 200 }, p: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>{s.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#e0e0e0' }}>{s.start.toLocaleDateString()} {s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                  {s.venue && <Typography variant="caption" sx={{ color: '#e0e0e0' }}>{s.venue}</Typography>}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
      <Divider sx={{ my: 1 }} />

      {error ? <Typography color="error">{error}</Typography> : viewMode === 'upcoming' ? (
        <UpcomingView
          filteredUpcoming={filteredUpcoming}
          venueFilter={venueFilter}
          dateRangeFilter={dateRangeFilter}
          onVenueFilterChange={setVenueFilter}
          onDateRangeFilterChange={setDateRangeFilter}
          now={now}
          mounted={mounted}
        />
      ) : (
        <CalendarView cells={cells} map={map} now={now} mounted={mounted} onOpenDay={openDay} />
      )}

      <DayDialog open={dayDialogOpen} selectedDay={selectedDay} map={map} now={now} mounted={mounted} onClose={() => setDayDialogOpen(false)} />
    </Paper>
  );
}

export default ShowsCalendar;