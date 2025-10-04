import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Show } from './types';
import { formatKey, isActive } from './utils';

interface Props {
  cells: { date: Date; inMonth: boolean; key: string }[];
  map: Record<string, Show[]>;
  now: Date;
  mounted: boolean;
  onOpenDay: (key: string) => void;
}

export default function CalendarView({ cells, map, now, mounted, onOpenDay }: Props) {
  return (
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
              onClick={() => onOpenDay(c.key)}
              sx={{
                p: 1.25,
                minHeight: {xs:120, sm:140},
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

              <Box sx={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {dayShows.slice(0, 5).map((s) => (
                  <Tooltip key={s.id} title={`${s.title} @ ${s.venue || 'N/A'} - ${s.start.toLocaleString()}${s.description ? ' - ' + s.description : ''}`}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 0.5, borderRadius: 0.5, background: 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff', fontSize: 12 }}>{s.title}</Typography>
                        {isActive(s, now) ? <Chip label="LIVE" color="error" size="small" /> : (s.start.getTime() - now.getTime()) < 86400000 ? <Chip label="Soon" color="warning" size="small" /> : null}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {s.venue && <Typography variant="caption" sx={{ color: '#e0e0e0', fontSize: 10 }}>{s.venue}</Typography>}
                        <Typography variant="caption" sx={{ color: '#e0e0e0', fontSize: 10 }}>{mounted ? s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.start.toISOString().slice(11,16)}</Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
                {dayShows.length > 5 ? <Typography variant="caption" sx={{ color: '#ffffff' }}>+{dayShows.length - 5} more</Typography> : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}