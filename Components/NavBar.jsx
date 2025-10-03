"use client";
import React, { useRef, useEffect, useState } from 'react';
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
  borderRadius: 32,
  background: 'rgba(255,255,255,0.10)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  border: '2px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(8px)',
  marginLeft: theme.spacing(2),
  minWidth: '260px',
  maxWidth: '340px',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  display: 'flex',
  alignItems: 'center',
  '&:focus-within': {
    background: 'rgba(255,255,255,0.18)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
    borderColor: '#38ef7d',
    minWidth: '340px',
  },
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
  fontSize: '1.15rem',
  fontFamily: 'inherit',
  width: '100%',
  paddingLeft: theme.spacing(5),
  borderRadius: 32,
  fontWeight: 500,
  letterSpacing: 1,
  background: 'transparent',
  '.MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
  },
  '& input::placeholder': {
    color: '#e0e0e0',
    opacity: 1,
    fontWeight: 400,
    letterSpacing: 1,
  },
}));

function NavBar() {
  const searchRef = useRef(null);
  const [typedText, setTypedText] = useState('');
  const fullText = 'MJ2 Studios';

  useEffect(() => {
    let i = 0;
    let direction = 1; // 1: typing, -1: deleting
    let timeoutId;
    setTypedText('');

    const typeLoop = () => {
      if (direction === 1) {
        if (i < fullText.length) {
          i++;
          setTypedText(fullText.slice(0, i));
          timeoutId = setTimeout(typeLoop, 400);
        } else {
          direction = -1;
          timeoutId = setTimeout(typeLoop, 1200);
        }
      } else {
        if (i > 0) {
          i--;
          setTypedText(fullText.slice(0, i));
          timeoutId = setTimeout(typeLoop, 400);
        } else {
          direction = 1;
          timeoutId = setTimeout(typeLoop, 800);
        }
      }
    };
    typeLoop();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const isSearchFocused = searchRef.current && active === searchRef.current;
      // guard e.key in case it's undefined (some events may not have it)
      const key = typeof e.key === 'string' ? e.key.toLowerCase() : null;
      if (
        key === 'f' &&
        !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey &&
        !isSearchFocused
      ) {
        if (searchRef.current && typeof searchRef.current.focus === 'function') {
          searchRef.current.focus();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppBar position="sticky" elevation={6} sx={{
      top: 0,
      zIndex: (theme) => (theme.zIndex?.appBar ?? 1100) + 10,
      background: 'rgba(35,37,38,0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
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
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: 2,
              color: '#fff',
              fontFamily: 'Geist, sans-serif',
              textShadow: '0 4px 16px rgba(0,0,0,0.18)',
              mx: 1,
              minWidth: '170px',
              width: '170px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ display: 'inline-block', textAlign: 'left', fontSize: '1.1em' }}>
              {typedText}
              <span style={{
                display: 'inline-block',
                width: '1ch',
                background: 'none',
                color: '#38ef7d',
                fontWeight: 900,
                fontSize: '1em',
                marginLeft: '2px',
                animation: 'blink 1s steps(1) infinite',
                position: 'relative',
                left: 0,
              }}>|</span>
            </span>
          </Typography>
          <style>{`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}</style>
          <Button
            variant="contained"
            sx={{
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
            }}
            onClick={() => window.location.href = '/'}
          >Home</Button>
          <Button
            variant="contained"
            sx={{
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
            }}
            onClick={() => window.location.href = '/about-us'}
          >About</Button>
          <Button
            variant="contained"
            sx={{
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
            }}
            onClick={() => window.location.href = '/'}
          >Contact</Button>
            <Button
              variant="contained"
              sx={{
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
              }}
              onClick={() => window.location.href = '/manage_booking'}
            >
              Manage Bookings
            </Button>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search tributes…"
              inputProps={{ 'aria-label': 'search' }}
              inputRef={searchRef}
            />
            <Box sx={{ ml: 1, color: '#bbb', fontSize: '1rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.15)', px: 1.7, py: 0.8, borderRadius: 2.5, border: '1.5px solid #444', display: 'flex', alignItems: 'center', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', letterSpacing: 1 }}>F</Box>
          </Search>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;