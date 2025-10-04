import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import Chip from '@mui/material/Chip';
import { Show } from './types';
import { isActive, formatKey } from './utils';

interface Props {
  open: boolean;
  selectedDay: string | null;
  map: Record<string, Show[]>;
  now: Date;
  mounted: boolean;
  onClose: () => void;
}

export default function DayDialog({ open, selectedDay, map, now, mounted, onClose }: Props) {
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
      <DialogTitle sx={{ color: '#ffffff' }}>Shows on {selectedDay}</DialogTitle>
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
              <List sx={{ p: 0 }}>
                {dayItems.map((s) => (
                  <React.Fragment key={s.id}>
                    <ListItem sx={{ borderBottom: 1, borderColor: 'divider', p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1 }}>
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
                            {mounted ? s.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.start.toISOString().slice(11,16)}
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
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Dialog>
  );
}