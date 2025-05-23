import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useMediaQuery,
  CircularProgress,
  Slide,
  Fade,
  Zoom,
  Paper,
  Divider,
  Tooltip,
  useScrollTrigger,
  Container,
  Stack
} from '@mui/material';
import { alpha, useTheme, styled } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Receipt as ReceiptIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Policy as PolicyIcon,
  ContactSupport as ContactSupportIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  FavoriteBorder as FavoriteIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { signOut } from 'firebase/auth';

// Constants
const TERRACOTTA_PRIMARY = '#E07A5F';
const TERRACOTTA_DARK = '#BE5A38';
const TERRACOTTA_LIGHT = '#F2CC8F';
const COCONUT_LIGHT = '#FFF9F5';
const TEXT_PRIMARY = '#3D405B';
const TEXT_SECONDARY = '#797B8E';

// Create a memoized Logo component
const Logo = memo(({ navigate }) => {
  const logo = require("../assets/logo.jpg");
  
  return (
    <Fade in={true} timeout={800}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' }
        }} 
        onClick={() => navigate('/')}
      >
        <Box
          component="img"
          src={logo}
          alt="MittiArts Logo"
          sx={{
            height: { xs: 40, sm: 50 },
            width: 'auto',
            mr: 1.5,
            borderRadius: '50%',
            border: `2px solid ${TERRACOTTA_PRIMARY}`
          }}
        />
        <LogoTypography variant="h5" sx={{ 
          fontSize: { xs: '1.2rem', sm: '1.6rem' },
          fontFamily: '"Poppins", "Roboto", "Arial", sans-serif'
        }}>
          MittiArts
        </LogoTypography>
      </Box>
    </Fade>
  );
});

// Styled components with optimized styles
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: TERRACOTTA_PRIMARY,
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.5s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.2)',
      opacity: 0,
    },
  },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: TERRACOTTA_PRIMARY,
  textTransform: 'none',
  fontWeight: active ? 600 : 500,
  position: 'relative',
  overflow: 'hidden',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.05),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: active ? '100%' : '0%',
    height: '2px',
    bottom: '2px',
    left: '0',
    backgroundColor: TERRACOTTA_PRIMARY,
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
}));

const LogoTypography = styled(Typography)({
  color: TERRACOTTA_PRIMARY,
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  background: `linear-gradient(45deg, ${TERRACOTTA_DARK} 30%, ${TERRACOTTA_LIGHT} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  backgroundColor: scrolled ? '#fff' : 'rgba(255, 255, 255, 0.95)',
  boxShadow: scrolled ? '0 2px 10px rgba(0, 0, 0, 0.08)' : 'none',
  transition: 'all 0.3s ease-in-out',
  backdropFilter: 'blur(10px)',
}));

// Hide on scroll - memoized component
const HideOnScroll = memo(({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
});

// NavLinks component
const NavLinks = memo(({ links, isActive, navigate, isMobile, handleDrawerToggle }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {links.map((link, index) => (
      <Fade 
        key={link.label} 
        in={true} 
        timeout={(index + 1) * 200}
      >
        <Tooltip title={link.label} enterDelay={500}>
          <NavButton
            onClick={() => {
              navigate(link.path);
              if (isMobile) handleDrawerToggle();
            }}
            active={isActive(link.path) ? 1 : 0}
            sx={{ px: 2 }}
          >
            {link.label}
          </NavButton>
        </Tooltip>
      </Fade>
    ))}
  </Box>
));

// Action buttons component
const ActionButtons = memo(({ isLoggedIn, cartItemCount, navigate, handleAvatarClick, userInitial }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
    <Zoom in={true} timeout={700}>
      <Tooltip title={isLoggedIn ? "Wishlist" : "Sign in to view wishlist"}>
        <IconButton 
          onClick={() => isLoggedIn ? navigate('/wishlist') : navigate('/auth')}
          sx={{
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-3px)' },
            color: TERRACOTTA_PRIMARY
          }}
        >
          <FavoriteIcon sx={{ 
            fontSize: { xs: 24, sm: 26 }
          }} />
        </IconButton>
      </Tooltip>
    </Zoom>

    <Zoom in={true} timeout={800}>
      <Tooltip title={isLoggedIn ? "Cart" : "Sign in to view cart"}>
        <IconButton 
          onClick={() => isLoggedIn ? navigate('/cart') : navigate('/auth')}
          sx={{
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-3px)' },
            color: TERRACOTTA_PRIMARY
          }}
        >
          <StyledBadge 
            badgeContent={cartItemCount} 
            color="primary"
            invisible={!isLoggedIn || cartItemCount === 0}
            max={99}
          >
            <ShoppingCartIcon sx={{ 
              fontSize: { xs: 24, sm: 26 }
            }} />
          </StyledBadge>
        </IconButton>
      </Tooltip>
    </Zoom>

    <Zoom in={true} timeout={900}>
      <Tooltip title={isLoggedIn ? "Account" : "Sign In"}>
        <IconButton 
          onClick={handleAvatarClick}
          sx={{ p: { xs: 0.5, sm: 1 } }}
        >
          <StyledAvatar 
            sx={{ 
              bgcolor: isLoggedIn ? TERRACOTTA_PRIMARY : alpha('#e0e0e0', 0.8),
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              border: isLoggedIn ? `2px solid ${TERRACOTTA_DARK}` : 'none'
            }}
          >
            {isLoggedIn ? (
              userInitial
            ) : (
              <PersonIcon sx={{ color: '#757575' }} />
            )}
          </StyledAvatar>
        </IconButton>
      </Tooltip>
    </Zoom>
  </Box>
));

// User menu component
const UserMenu = memo(({ anchorEl, handleMenuClose, handleProfileClick, handleSignOut, navigate }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleMenuClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{
      elevation: 3,
      sx: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
        mt: 1.5,
        borderRadius: 2,
        minWidth: 180,
        '&:before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          zIndex: 0,
        },
      },
    }}
  >
    <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(TERRACOTTA_LIGHT, 0.2) }}>
      <Typography variant="subtitle2" color="textSecondary" fontWeight={500}>
        Welcome, {localStorage.getItem('userName') || 'User'}
      </Typography>
    </Box>
    <Divider />
    <MenuItem 
      onClick={handleProfileClick}
      sx={{ 
        py: 1.5,
        '&:hover': { backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.08) }
      }}
    >
      <ListItemIcon>
        <AccountCircleIcon fontSize="small" sx={{ color: TERRACOTTA_PRIMARY }} />
      </ListItemIcon>
      <ListItemText primary="Profile" />
    </MenuItem>
    <MenuItem 
      onClick={() => {
        navigate('/orders');
        handleMenuClose();
      }}
      sx={{ 
        py: 1.5,
        '&:hover': { backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.08) }
      }}
    >
      <ListItemIcon>
        <ReceiptIcon fontSize="small" sx={{ color: TERRACOTTA_PRIMARY }} />
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </MenuItem>
    <MenuItem 
      onClick={handleSignOut}
      sx={{ 
        py: 1.5,
        '&:hover': { backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.08) }
      }}
    >
      <ListItemIcon>
        <LogoutIcon fontSize="small" sx={{ color: TERRACOTTA_PRIMARY }} />
      </ListItemIcon>
      <ListItemText primary="Sign Out" />
    </MenuItem>
  </Menu>
));

// Mobile drawer content
const DrawerContent = memo(({ navLinks, isActive, navigate, handleDrawerToggle, isLoggedIn, userInitial, handleSignOut }) => {
  const logo = require("../assets/logo.jpg");
  
  return (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.05)
      }}>
        <Box
          component="img"
          src={logo}
          alt="MittiArts Logo"
          sx={{
            height: 40,
            width: 40,
            mr: 1.5,
            borderRadius: '50%',
            border: `2px solid ${TERRACOTTA_PRIMARY}`
          }}
        />
        <LogoTypography variant="h6">
          MittiArts
        </LogoTypography>
      </Box>
      
      <Divider />
      
      <List sx={{ py: 1 }}>
        {navLinks.map((link, index) => (
          <Fade in={true} timeout={(index + 1) * 150} key={link.label}>
            <ListItem 
              button 
              onClick={() => {
                navigate(link.path);
                handleDrawerToggle();
              }}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 2,
                backgroundColor: isActive(link.path) ? alpha(TERRACOTTA_PRIMARY, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.15),
                }
              }}
            >
              <ListItemIcon sx={{ color: TERRACOTTA_PRIMARY, minWidth: 40 }}>
                {link.icon}
              </ListItemIcon>
              <ListItemText 
                primary={link.label} 
                primaryTypographyProps={{
                  fontWeight: isActive(link.path) ? 600 : 'normal',
                  color: TEXT_PRIMARY
                }}
              />
            </ListItem>
          </Fade>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {isLoggedIn ? (
          <>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.05),
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <StyledAvatar sx={{ bgcolor: TERRACOTTA_PRIMARY, mr: 2 }}>
                {userInitial}
              </StyledAvatar>
              <Box>
                <Typography variant="body2" fontWeight="bold" color={TEXT_PRIMARY}>
                  {localStorage.getItem('userName') || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {localStorage.getItem('userEmail') || ''}
                </Typography>
              </Box>
            </Paper>
            
            <Stack spacing={1.5}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<AccountCircleIcon />}
                onClick={() => {
                  navigate('/profile');
                  handleDrawerToggle();
                }}
                sx={{ 
                  color: TERRACOTTA_PRIMARY, 
                  borderColor: TERRACOTTA_PRIMARY,
                  '&:hover': {
                    borderColor: TERRACOTTA_DARK,
                    backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.04)
                  }
                }}
              >
                Profile
              </Button>
              
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<ReceiptIcon />}
                onClick={() => {
                  navigate('/orders');
                  handleDrawerToggle();
                }}
                sx={{ 
                  color: TERRACOTTA_PRIMARY, 
                  borderColor: TERRACOTTA_PRIMARY,
                  '&:hover': {
                    borderColor: TERRACOTTA_DARK,
                    backgroundColor: alpha(TERRACOTTA_PRIMARY, 0.04)
                  }
                }}
              >
                Orders
              </Button>
              
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<LogoutIcon />}
                onClick={() => {
                  handleSignOut();
                  handleDrawerToggle();
                }}
                sx={{ 
                  backgroundColor: TERRACOTTA_PRIMARY,
                  '&:hover': {
                    backgroundColor: TERRACOTTA_DARK
                  }
                }}
              >
                Sign Out
              </Button>
            </Stack>
          </>
        ) : (
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<LoginIcon />}
            onClick={() => {
              navigate('/auth');
              handleDrawerToggle();
            }}
            sx={{ 
              backgroundColor: TERRACOTTA_PRIMARY,
              '&:hover': {
                backgroundColor: TERRACOTTA_DARK
              }
            }}
          >
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  );
});

// Main Header component - optimized
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInitial, setUserInitial] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Navigation links config
  const navLinks = useMemo(() => [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Products', path: '/products', icon: <CategoryIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
    { label: 'Policies', path: '/policies', icon: <PolicyIcon /> },
    { label: 'Contact Us', path: '/contactus', icon: <ContactSupportIcon /> },
  ], []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth state management
  useEffect(() => {
    let unsubscribeCart = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const name = localStorage.getItem('userName') || user.displayName || 'User';
        setUserInitial(name.charAt(0).toUpperCase());
        setIsLoggedIn(true);
        
        // Subscribe to cart items
        const q = query(
          collection(db, 'cart'),
          where('userId', '==', user.uid)
        );
        
        unsubscribeCart = onSnapshot(q, (querySnapshot) => {
          setCartItemCount(querySnapshot.size);
        });
        
        if (location.pathname === '/auth') {
          navigate('/products');
        }
      } else {
        setUserInitial(null);
        setIsLoggedIn(false);
        setCartItemCount(0);
        
        // Clear all local storage at once
        const keysToRemove = ['authToken', 'userEmail', 'userName', 'adminToken', 'adminUser', 'isAdmin'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        if (location.pathname === '/profile') {
          navigate('/auth');
        }
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, [navigate, location.pathname]);

  // Event handlers - memoized
  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const handleAvatarClick = useCallback((event) => {
    if (!isLoggedIn) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }
    setAnchorEl(event.currentTarget);
  }, [isLoggedIn, navigate, location.pathname]);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      // Clear all local storage at once
      const keysToRemove = ['authToken', 'userEmail', 'userName', 'cart', 'adminToken', 'adminUser', 'isAdmin'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      setUserInitial(null);
      setIsLoggedIn(false);
      handleMenuClose();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [navigate, handleMenuClose]);

  const handleProfileClick = useCallback(() => {
    handleMenuClose();
    navigate('/profile');
  }, [navigate, handleMenuClose]);

  const isActive = useCallback((path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  }, [location.pathname]);

  // Loading state
  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '64px',
        backgroundColor: '#fff' 
      }}>
        <CircularProgress sx={{ color: TERRACOTTA_PRIMARY }} />
      </Box>
    );
  }

  return (
    <>
      <HideOnScroll>
        <StyledAppBar position="sticky" scrolled={scrolled ? 1 : 0}>
          <Container maxWidth="xl">
            <Toolbar sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              py: { xs: 1, md: 0.5 } 
            }}>
              {/* Logo */}
              <Logo navigate={navigate} />

              {/* Navigation or Menu Icon */}
              {isMobile ? (
                <IconButton 
                  edge="end" 
                  onClick={handleDrawerToggle} 
                  sx={{ 
                    color: TERRACOTTA_PRIMARY,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'rotate(180deg)' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <NavLinks 
                  links={navLinks} 
                  isActive={isActive} 
                  navigate={navigate}
                  isMobile={false}
                />
              )}

              {/* Right Icons */}
              <ActionButtons 
                isLoggedIn={isLoggedIn}
                cartItemCount={cartItemCount}
                navigate={navigate}
                handleAvatarClick={handleAvatarClick}
                userInitial={userInitial}
              />

              {/* User Menu */}
              {isLoggedIn && (
                <UserMenu 
                  anchorEl={anchorEl}
                  handleMenuClose={handleMenuClose}
                  handleProfileClick={handleProfileClick}
                  handleSignOut={handleSignOut}
                  navigate={navigate}
                />
              )}
            </Toolbar>
          </Container>
        </StyledAppBar>
      </HideOnScroll>

      {/* Drawer for Mobile Menu */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 12px 12px 0',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DrawerContent 
          navLinks={navLinks}
          isActive={isActive}
          navigate={navigate}
          handleDrawerToggle={handleDrawerToggle}
          isLoggedIn={isLoggedIn}
          userInitial={userInitial}
          handleSignOut={handleSignOut}
        />
      </Drawer>
    </>
  );
};

export default Header;