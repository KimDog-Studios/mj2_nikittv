"use client";
import React, { useRef, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import { alpha, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 24,
  background: alpha('#fff', 0.12),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  '&:hover': {
    background: alpha('#fff', 0.22),
  },
  marginLeft: theme.spacing(2),
  width: '240px',
  transition: 'background 0.3s',
  display: 'flex',
  alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.grey[400],
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#fff',
  fontSize: '1rem',
  fontFamily: 'inherit',
  width: '100%',
  paddingLeft: theme.spacing(5),
  borderRadius: 24,
  '.MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
  },
}));

function NavBar() {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const isSearchFocused = searchRef.current && active === searchRef.current;
      if (
        e.key.toLowerCase() === 'f' &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey &&
        !isSearchFocused
      ) {
        if (searchRef.current) {
          searchRef.current.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppBar position="static" elevation={0} sx={{
      background: 'rgba(35,37,38,0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      borderBottom: '1px solid #222',
    }}>
      <Toolbar sx={{ minHeight: 88, px: 2 }}>
        <Box sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Logo.jpg" alt="Logo" style={{ height: 54, marginRight: 20, borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
          </a>
          <Typography variant="h4" component="div" sx={{ fontWeight: 800, letterSpacing: 3, color: '#fff', fontFamily: 'Geist, sans-serif', textShadow: '0 4px 16px rgba(0,0,0,0.18)', mx: 1 }}>
            MJ2 Studios
          </Typography>
          <Button variant="contained" sx={{
            background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 22,
            boxShadow: '0 4px 16px rgba(221,36,118,0.18)',
            px: 3.5,
            py: 1.2,
            textTransform: 'none',
            minWidth: 110,
            fontSize: '1.08rem',
            letterSpacing: 1,
            transition: 'transform 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #dd2476 0%, #ff512f 100%)',
              transform: 'scale(1.06)',
            },
          }}>Home</Button>
          <Button variant="contained" sx={{
            background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 22,
            boxShadow: '0 4px 16px rgba(30,60,114,0.18)',
            px: 3.5,
            py: 1.2,
            textTransform: 'none',
            minWidth: 110,
            fontSize: '1.08rem',
            letterSpacing: 1,
            transition: 'transform 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #2a5298 0%, #1e3c72 100%)',
              transform: 'scale(1.06)',
            },
          }}>About</Button>
          <Button variant="contained" sx={{
            background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 22,
            boxShadow: '0 4px 16px rgba(17,153,142,0.18)',
            px: 3.5,
            py: 1.2,
            textTransform: 'none',
            minWidth: 110,
            fontSize: '1.08rem',
            letterSpacing: 1,
            transition: 'transform 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #38ef7d 0%, #11998e 100%)',
              transform: 'scale(1.06)',
            },
          }}>Contact</Button>
            <Button variant="contained" sx={{
              background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
              color: '#232526',
              fontWeight: 700,
              borderRadius: 22,
              boxShadow: '0 4px 16px rgba(247,151,30,0.18)',
              px: 3.5,
              py: 1.2,
              textTransform: 'none',
              minWidth: 150,
              fontSize: '1.08rem',
              letterSpacing: 1,
              transition: 'transform 0.18s',
              '&:hover': {
                background: 'linear-gradient(90deg, #ffd200 0%, #f7971e 100%)',
                color: '#232526',
                transform: 'scale(1.06)',
              },
            }}>Manage Bookings</Button>
          <Search sx={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)', border: '1.5px solid #444' }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search tributes…"
              inputProps={{ 'aria-label': 'search' }}
              inputRef={searchRef}
              sx={{ fontWeight: 500, fontSize: '1.05rem', letterSpacing: 1, px: 1 }}
            />
            <Box sx={{ ml: 1, color: '#bbb', fontSize: '0.95rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.10)', px: 1.5, py: 0.7, borderRadius: 2, border: '1px solid #444', display: 'flex', alignItems: 'center', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
              F
            </Box>
          </Search>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;