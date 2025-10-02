import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function HomePageInfo() {
  return (
    <Box sx={{
      width: '100%',
      minHeight: '40vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 2,
    }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
        MJ2 Studios
      </Typography>
      <Typography variant="body1" sx={{ color: '#bbb', maxWidth: 760 }}>
        Professional tribute acts and bookings across South Wales. Browse our areas covered, opening times, and manage your bookings from the navigation above.
      </Typography>
    </Box>
  )
}

export default HomePageInfo