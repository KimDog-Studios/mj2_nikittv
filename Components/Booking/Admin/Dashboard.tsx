import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { motion } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Props {
  totalBookings: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
}

export default function Dashboard({ totalBookings, pendingCount, confirmedCount, cancelledCount }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#ffffff', fontWeight: 700 }}>Dashboard Overview</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            color: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }
          }}>
            <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
              <BarChartIcon sx={{ fontSize: 40, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{totalBookings}</Typography>
              <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Total Bookings</Typography>
            </Box>
          </Paper>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,165,0,0.2) 0%, rgba(255,165,0,0.1) 100%)',
            color: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(255,165,0,0.2)',
            border: '1px solid rgba(255,165,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(255,165,0,0.3)' }
          }}>
            <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,165,0,0.1)' }}>
              <PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{pendingCount}</Typography>
              <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Pending</Typography>
            </Box>
          </Paper>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.1) 100%)',
            color: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(76,175,80,0.2)',
            border: '1px solid rgba(76,175,80,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(76,175,80,0.3)' }
          }}>
            <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(76,175,80,0.1)' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{confirmedCount}</Typography>
              <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Confirmed</Typography>
            </Box>
          </Paper>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Paper sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.1) 100%)',
            color: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(244,67,54,0.2)',
            border: '1px solid rgba(244,67,54,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(244,67,54,0.3)' }
          }}>
            <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(244,67,54,0.1)' }}>
              <CancelIcon sx={{ fontSize: 40, color: '#f44336' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{cancelledCount}</Typography>
              <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.9rem' }}>Cancelled</Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
}