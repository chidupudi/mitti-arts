import React, { useState, useEffect } from 'react';
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
  Grow,
  Paper,
  Divider,
  Tooltip,
  useScrollTrigger,
  Container
} from '@mui/material';
import { alpha, useTheme, styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Add this with other icon imports
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import PolicyIcon from '@mui/icons-material/Policy';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../Firebase/Firebase';
import { signOut } from 'firebase/auth';
const Logo =require("../assets/logo.jpg")

// Custom styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
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
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: '#5D4037',
  textTransform: 'none',
  fontWeight: active ? 700 : 500,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: alpha('#5D4037', 0.04),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: active ? '100%' : '0%',
    height: '2px',
    bottom: '0',
    left: '0',
    backgroundColor: '#5D4037',
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  color: '#5D4037',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  background: 'linear-gradient(45deg, #5D4037 30%, #A1887F 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  backgroundColor: scrolled ? '#fff' : 'rgba(255, 255, 255, 0.95)',
  boxShadow: scrolled ? theme.shadows[4] : 'none',
  transition: 'all 0.3s ease-in-out',
  backdropFilter: 'blur(10px)',
}));

// Hide on scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = (props) => {
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

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
         localStorage.removeItem('adminToken'); // Add this line
    localStorage.removeItem('adminUser'); // Add this line
    localStorage.removeItem('isAdmin'); // Add this line
        if (location.pathname === '/profile') {
          navigate('/auth');
        }
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) {
        unsubscribeCart();
      }
    };
  }, [navigate, location.pathname]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleAvatarClick = (event) => {
    if (!isLoggedIn) {
      navigate('/auth', { state: { from: location.pathname } });
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('cart');
      localStorage.removeItem('adminToken'); // Add this line
    localStorage.removeItem('adminUser'); // Add this line
    localStorage.removeItem('isAdmin'); // Add this line
      setUserInitial(null);
      setIsLoggedIn(false);
      handleMenuClose();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Products', path: '/products', icon: <CategoryIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
    { label: 'Policies', path: '/policies', icon: <PolicyIcon /> },
    { label: 'Contact Us', path: '/contactus', icon: <ContactSupportIcon /> },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };

  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '64px',
        backgroundColor: '#fff' 
      }}>
        <CircularProgress sx={{ color: '#5D4037' }} />
      </Box>
    );
  }

  return (
    <>
      <HideOnScroll {...props}>
        <StyledAppBar position="sticky" scrolled={scrolled ? 1 : 0}>
          <Container maxWidth="xl">
            <Toolbar sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              py: { xs: 1, md: 0.5 } 
            }}>
              {/* Logo */}
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
      src={ Logo } // or require('../assets/logo.jpg') if using require
      alt="MittiArts Logo"
      sx={{
        height: { xs: 40, sm: 50 },
        width: 'auto',
        mr: 1,
        borderRadius: '50%',
        border: '2px solid #5D4037'
      }}
    />
                  <LogoTypography variant="h5" sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.5rem' },
                    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif'
                  }}>
                    MittiArts
                  </LogoTypography>
                </Box>
              </Fade>

              {/* Navigation or Menu Icon */}
              {isMobile ? (
                <IconButton 
                  edge="end" 
                  onClick={handleDrawerToggle} 
                  sx={{ 
                    color: '#5D4037',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'rotate(180deg)' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <Grow in={true} timeout={1000}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {navLinks.map((link, index) => (
                      <Fade 
                        key={link.label} 
                        in={true} 
                        timeout={(index + 1) * 200}
                      >
                        <Tooltip title={link.label} enterDelay={500}>
                          <NavButton
                            onClick={() => navigate(link.path)}
                            active={isActive(link.path) ? 1 : 0}
                            sx={{ px: 2 }}
                          >
                            {link.label}
                          </NavButton>
                        </Tooltip>
                      </Fade>
                    ))}
                  </Box>
                </Grow>
              )}

              {/* Right Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Zoom in={true} timeout={800}>
                  <Tooltip title={isLoggedIn ? "Wishlist" : "Sign in to view wishlist"}>
                    <IconButton 
                      onClick={() => isLoggedIn ? navigate('/wishlist') : navigate('/auth')}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-3px)' }
                      }}
                    >
                      <StyledBadge 
                        badgeContent={0} // You might want to fetch and display the wishlist item count here
                        color="secondary"
                        invisible={!isLoggedIn} // Adjust visibility based on whether the user is logged in and has items in the wishlist
                        max={99}
                      >
                        <FavoriteIcon sx={{ 
                          color: '#5D4037',
                          fontSize: { xs: 24, sm: 26 }
                        }} />
                      </StyledBadge>
                    </IconButton>
                  </Tooltip>
                </Zoom>

                <Zoom in={true} timeout={800}>
                  <Tooltip title={isLoggedIn ? "Cart" : "Sign in to view cart"}>
                    <IconButton 
                      onClick={() => isLoggedIn ? navigate('/cart') : navigate('/auth')}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-3px)' }
                      }}
                    >
                      <StyledBadge 
                        badgeContent={cartItemCount} 
                        color="secondary"
                        invisible={!isLoggedIn || cartItemCount === 0}
                        max={99}
                      >
                        <ShoppingCartIcon sx={{ 
                          color: '#5D4037',
                          fontSize: { xs: 24, sm: 26 }
                        }} />
                      </StyledBadge>
                    </IconButton>
                  </Tooltip>
                </Zoom>

                <Zoom in={true} timeout={1000}>
                  <Tooltip title={isLoggedIn ? "Account" : "Sign In"}>
                    <IconButton 
                      onClick={handleAvatarClick}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <StyledAvatar 
                        sx={{ 
                          bgcolor: isLoggedIn ? '#A1887F' : alpha('#e0e0e0', 0.8),
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          border: isLoggedIn ? '2px solid #5D4037' : 'none'
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

                {isLoggedIn && (
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      elevation: 4,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        borderRadius: 2,
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
                    <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5' }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Welcome, {localStorage.getItem('userName') || 'User'}
                      </Typography>
                    </Box>
                    <Divider />
                   <MenuItem 
  onClick={handleProfileClick}
  sx={{ 
    py: 1.5,
    '&:hover': { backgroundColor: alpha('#5D4037', 0.08) }
  }}
>
  <ListItemIcon>
    <AccountCircleIcon fontSize="small" sx={{ color: '#5D4037' }} />
  </ListItemIcon>
  <ListItemText primary="Profile" />
</MenuItem>
{/* Add this new MenuItem for Orders */}
<MenuItem 
  onClick={() => {
    navigate('/orders');
    handleMenuClose();
  }}
  sx={{ 
    py: 1.5,
    '&:hover': { backgroundColor: alpha('#5D4037', 0.08) }
  }}
>
  <ListItemIcon>
    <ReceiptIcon fontSize="small" sx={{ color: '#5D4037' }} />
  </ListItemIcon>
  <ListItemText primary="Orders" />
</MenuItem>
<MenuItem 
  onClick={handleSignOut}
  sx={{ 
    py: 1.5,
    '&:hover': { backgroundColor: alpha('#5D4037', 0.08) }
  }}
>
  <ListItemIcon>
    <LogoutIcon fontSize="small" sx={{ color: '#5D4037' }} />
  </ListItemIcon>
  <ListItemText primary="Sign Out" />
</MenuItem> 
                  </Menu>
                )}
              </Box>
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
        <Box sx={{ width: '100%' }} role="presentation">
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: alpha('#5D4037', 0.05)
          }}>
            <Box
    component="img"
    src={Logo} // or require('../assets/logo.jpg') if using require
    alt="MittiArts Logo"
    sx={{
      height: 40,
      width: 40,
      mr: 1,
      borderRadius: '50%',
      border: '2px solid #5D4037'
    }}
  />
  <LogoTypography variant="h6">
    MittiArts
  </LogoTypography>
          </Box>
          
          <Divider />
          
          <List>
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
                    backgroundColor: isActive(link.path) ? alpha('#5D4037', 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha('#5D4037', 0.15),
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: '#5D4037', minWidth: 40 }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={link.label} 
                    primaryTypographyProps={{
                      fontWeight: isActive(link.path) ? 'bold' : 'normal'
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
                    backgroundColor: alpha('#5D4037', 0.05),
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <StyledAvatar sx={{ bgcolor: '#A1887F', mr: 2 }}>
                    {userInitial}
                  </StyledAvatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {localStorage.getItem('userName') || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {localStorage.getItem('userEmail') || ''}
                    </Typography>
                  </Box>
                </Paper>
                
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<AccountCircleIcon />}
                  onClick={() => {
                    navigate('/profile');
                    handleDrawerToggle();
                  }}
                  sx={{ 
                    mb: 1, 
                    color: '#5D4037', 
                    borderColor: '#5D4037',
                    '&:hover': {
                      borderColor: '#5D4037',
                      backgroundColor: alpha('#5D4037', 0.04)
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
    mb: 1, 
    color: '#5D4037', 
    borderColor: '#5D4037',
    '&:hover': {
      borderColor: '#5D4037',
      backgroundColor: alpha('#5D4037', 0.04)
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
                    backgroundColor: '#5D4037',
                    '&:hover': {
                      backgroundColor: '#4E342E'
                    }
                  }}
                >
                  Sign Out
                </Button>
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
                  backgroundColor: '#5D4037',
                  '&:hover': {
                    backgroundColor: '#4E342E'
                  }
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;