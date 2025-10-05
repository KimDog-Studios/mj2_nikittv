"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../Utils/firebaseClient';
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BookIcon from '@mui/icons-material/Book';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.15)',
  backdropFilter: 'blur(15px)',
  marginLeft: theme.spacing(3),
  width: '300px',
  height: '44px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  '&:focus-within': {
    background: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(56, 239, 125, 0.6)',
    boxShadow: '0 0 30px rgba(56, 239, 125, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15)',
    width: '340px',
    transform: 'translateY(-1px)',
  },
  '&:hover': {
    borderColor: 'rgba(56, 239, 125, 0.4)',
    boxShadow: '0 0 25px rgba(56, 239, 125, 0.15)',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.6)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#fff',
  fontSize: '0.95rem',
  width: '100%',
  paddingLeft: theme.spacing(4.5),
  fontWeight: 400,
  background: 'transparent',
  '.MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    background: 'transparent',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
  },
  '& input::placeholder': {
    color: 'rgba(255,255,255,0.5)',
    opacity: 1,
    fontWeight: 300,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 500,
  textTransform: 'none',
  padding: '14px 24px',
  borderRadius: 12,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #38ef7d, #11998e, #38ef7d)',
    backgroundSize: '200% 100%',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateX(-50%)',
    animation: 'gradientShift 3s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(56, 239, 125, 0.1), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    background: 'rgba(56, 239, 125, 0.08)',
    borderColor: 'rgba(56, 239, 125, 0.3)',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 8px 25px rgba(56, 239, 125, 0.15)',
    '&::before': {
      width: '90%',
    },
    '&::after': {
      left: '100%',
    },
  },
  '@keyframes gradientShift': {
    '0%, 100%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
  },
}));

// Typewriter Effect Component
const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <AnimatePresence>
        {displayText.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut"
            }}
            style={{
              display: 'inline-block',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit'
            }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.2em',
          background: '#38ef7d',
          marginLeft: '2px',
          borderRadius: '1px',
        }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </Box>
  );
};

const NavBar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [servicesAnchorEl, setServicesAnchorEl] = useState<null | HTMLElement>(null);
  const [aboutAnchorEl, setAboutAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user] = useAuthState(auth);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };



  const centerNavItems = [
    {
      label: 'Services',
      subitems: [
        { href: '/pages/booking', label: 'Book Now' },
        { href: '/pages/manage_booking', label: 'Manage Bookings' },
        { href: '/pages/booking_status', label: 'Booking Status' },
      ]
    },
    {
      label: 'About',
      subitems: [
        { href: '/pages/about-us', label: 'About Us' },
        { href: '/pages/contact', label: 'Contact' },
      ]
    },
  ];

  const rightNavItems: { href: string; label: string }[] = [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // TODO: Implement search functionality
    console.log('Search query:', event.target.value);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => (theme.zIndex?.appBar ?? 1100) + 10,
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(15, 15, 20, 0.95) 50%, rgba(5, 5, 10, 0.98) 100%)',
        backdropFilter: 'blur(25px)',
        borderBottom: '1px solid rgba(56, 239, 125, 0.2)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(56, 239, 125, 0.1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(56, 239, 125, 0.03) 50%, transparent 70%)',
          animation: 'shimmer 4s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%, 100%': { transform: 'translateX(-100%)' },
            '50%': { transform: 'translateX(100%)' },
          },
        },
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 70, md: 80 }, px: { xs: 2, md: 4 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open navigation menu"
          onClick={() => setMobileOpen(true)}
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            color: '#fff',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <MenuIcon />
          </motion.div>
        </IconButton>


        {/* Center Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            gap: 2,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
                whileHover={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <motion.img
                  src="https://raw.githubusercontent.com/KimDog-Studios/mj2_nikittv/main/app/Logo.jpg"
                  alt="MJ2 Studios Logo"
                  style={{
                    height: isMobile ? 42 : 52,
                    borderRadius: 16,
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(56, 239, 125, 0.15)',
                    cursor: 'pointer',
                    border: '2px solid rgba(56, 239, 125, 0.3)',
                  }}
                  whileHover={{
                    boxShadow: '0 8px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 239, 125, 0.25)'
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(56, 239, 125, 0.1) 0%, transparent 50%, rgba(17, 152, 142, 0.1) 100%)',
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>
          </motion.div>

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: 1.5,
              color: '#fff',
              fontFamily: 'Geist, sans-serif',
              fontSize: { xs: '1rem', md: '1.25rem' },
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
            suppressHydrationWarning={true}
          >
            <TypewriterText text="MJ2 Studios" delay={150} />
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 3 }}>
            {centerNavItems.map((item) => (
              <NavButton
                key={item.label}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  if (item.label === 'Services') {
                    setServicesAnchorEl(event.currentTarget);
                  } else if (item.label === 'About') {
                    setAboutAnchorEl(event.currentTarget);
                  }
                }}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem' }} />}
              >
                {item.label}
              </NavButton>
            ))}
          </Box>
        </Box>

        {/* Right Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>

          {rightNavItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <NavButton>
                {item.label}
              </NavButton>
            </Link>
          ))}

          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ fontSize: '1.2rem' }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search tributes..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Search>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, cursor: 'pointer' }} onClick={handleUserMenuClick}>
              <Avatar src={user.photoURL || undefined} alt={user.displayName || 'User'} sx={{ width: 32, height: 32 }} />
              <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>{user.email === 'admin@mj2-studios.co.uk' ? 'Administrator' : (user.displayName || user.email)}</Typography>
            </Box>
          ) : (
            <Link href='/pages/signin-up' style={{ textDecoration: 'none' }}>
              <NavButton sx={{ ml: 2 }}>
                Sign In
              </NavButton>
            </Link>
          )}

          {user && user.email === 'admin@mj2-studios.co.uk' && (
            <Link href='/pages/signin-up' style={{ textDecoration: 'none' }}>
              <NavButton>
                Admin
              </NavButton>
            </Link>
          )}
        </Box>

        {/* Dropdown Menus */}
        <Menu
          anchorEl={servicesAnchorEl}
          open={Boolean(servicesAnchorEl)}
          onClose={() => setServicesAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              minWidth: 200,
            },
            '& .MuiMenuItem-root': {
              color: '#fff',
              fontWeight: 400,
              fontSize: '0.95rem',
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'rgba(56, 239, 125, 0.1)',
              },
            },
          }}
        >
          {centerNavItems.find(item => item.label === 'Services')?.subitems?.map((subitem) => (
            <MenuItem
              key={subitem.href}
              component={Link}
              href={subitem.href}
              onClick={() => setServicesAnchorEl(null)}
            >
              {subitem.label}
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={aboutAnchorEl}
          open={Boolean(aboutAnchorEl)}
          onClose={() => setAboutAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              minWidth: 200,
            },
            '& .MuiMenuItem-root': {
              color: '#fff',
              fontWeight: 400,
              fontSize: '0.95rem',
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'rgba(56, 239, 125, 0.1)',
              },
            },
          }}
        >
          {centerNavItems.find(item => item.label === 'About')?.subitems?.map((subitem) => (
            <MenuItem
              key={subitem.href}
              component={Link}
              href={subitem.href}
              onClick={() => setAboutAnchorEl(null)}
            >
              {subitem.label}
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            '& .MuiPaper-root': {
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              minWidth: 200,
            },
            '& .MuiMenuItem-root': {
              color: '#fff',
              fontWeight: 400,
              fontSize: '0.95rem',
              py: 1.5,
              px: 2,
              '&:hover': {
                background: 'rgba(56, 239, 125, 0.1)',
              },
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose} component={Link} href='/pages/profile'>
            Profile
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose} component={Link} href='/pages/settings'>
            Settings
          </MenuItem>
          <MenuItem onClick={() => { signOut(auth); handleUserMenuClose(); }}>
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <Drawer
              anchor="left"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  background: 'rgba(10, 10, 10, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  width: { xs: '280px', sm: '320px' },
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                  Navigation
                </Typography>
                <IconButton
                  onClick={() => setMobileOpen(false)}
                  sx={{ color: '#fff' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <List sx={{ px: 2 }}>
                {centerNavItems.map((item) => (
                  <Box key={item.label} sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontSize: '0.8rem'
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.subitems?.map((subitem) => (
                      <ListItem key={subitem.href} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          component={Link}
                          href={subitem.href}
                          onClick={() => setMobileOpen(false)}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            pl: 4,
                            '&:hover': {
                              background: 'rgba(56, 239, 125, 0.1)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={subitem.label}
                            primaryTypographyProps={{
                              sx: { color: '#fff', fontWeight: 400 }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </Box>
                ))}

                {rightNavItems.map((item) => (
                  <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        borderRadius: 2,
                        py: 2,
                        '&:hover': {
                          background: 'rgba(56, 239, 125, 0.1)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          sx: { color: '#fff', fontWeight: 500, fontSize: '1.1rem' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}

                {user && user.email === 'admin@mj2-studios.co.uk' && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={Link}
                      href='/pages/signin-up'
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        borderRadius: 2,
                        py: 2,
                        '&:hover': {
                          background: 'rgba(56, 239, 125, 0.1)',
                        },
                      }}
                    >
                      <ListItemText
                        primary='Admin'
                        primaryTypographyProps={{
                          sx: { color: '#fff', fontWeight: 500, fontSize: '1.1rem' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Drawer>
          )}
        </AnimatePresence>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;