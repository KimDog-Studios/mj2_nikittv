import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function NavBar() {
  return (
    <AppBar position="static" color="primary" sx={{ boxShadow: 2 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="" alt="Logo" style={{ height: 40, marginRight: 16, borderRadius: 8 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            MJ2 NikitTV
          </Typography>
        </Box>
        {/* Add more items to the right if needed */}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;