import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid,
  useMediaQuery,
  useTheme,
  Chip,
  Fade
} from '@mui/material';
import { 
  Home as HomeIcon, 
  ArrowBack as ArrowBackIcon, 
  Search as SearchIcon,
  ErrorOutline as ErrorIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const NotFound = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [attemptedPath, setAttemptedPath] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Extract the path user was trying to access
  useEffect(() => {
    setAttemptedPath(location.pathname);

    // Generate suggestions based on the attempted path
    generateSuggestions(location.pathname);

    // Countdown for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.pathname, navigate]);

  // Generate navigation suggestions based on attempted path
  const generateSuggestions = (path) => {
    const pathLower = path.toLowerCase();
    const newSuggestions = [];

    // Add suggestions based on path segments
    if (pathLower.includes('product')) {
      newSuggestions.push({
        label: 'Browse Products', 
        path: '/products',
        icon: <SearchIcon fontSize="small" />
      });
    }
    
    if (pathLower.includes('order') || pathLower.includes('payment')) {
      newSuggestions.push({
        label: 'View Orders', 
        path: '/orders',
        icon: <SearchIcon fontSize="small" />
      });
    }
    
    if (pathLower.includes('account') || pathLower.includes('profile') || pathLower.includes('user')) {
      newSuggestions.push({
        label: 'Your Profile', 
        path: '/profile',
        icon: <SearchIcon fontSize="small" />
      });
    }

    // Always include these common destinations
    newSuggestions.push({
      label: 'Shopping Cart', 
      path: '/cart',
      icon: <SearchIcon fontSize="small" />
    });
    
    newSuggestions.push({
      label: 'Contact Support', 
      path: '/contactus',
      icon: <HelpIcon fontSize="small" />
    });

    setSuggestions(newSuggestions.slice(0, 4)); // Limit to 4 suggestions
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="lg" sx={{ py: 8, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Paper 
          elevation={0} 
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 2,
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: 'linear-gradient(90deg, #E07A5F 0%, #3D405B 100%)'
            }
          }}
        >
          <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
            {/* Left side - Error message and navigation */}
            <Grid item xs={12} md={7}>
              <Box>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#3D405B',
                    mb: 1,
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -5,
                      left: 0,
                      width: '40%',
                      height: '4px',
                      backgroundColor: '#E07A5F',
                      borderRadius: '2px'
                    }
                  }}
                >
                  404
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 500, 
                    mb: 3,
                    color: '#555'
                  }}
                >
                  Page Not Found
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
                  The page <strong>"{attemptedPath}"</strong> doesn't exist or has been moved.
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  You'll be redirected to the home page in <Chip 
                    label={countdown} 
                    size="small" 
                    color="primary"
                    sx={{ fontWeight: 'bold', ml: 0.5, mr: 0.5 }}
                  /> seconds.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<HomeIcon />}
                    component={Link}
                    to="/"
                    sx={{
                      backgroundColor: '#E07A5F',
                      '&:hover': {
                        backgroundColor: '#C85A3D',
                      },
                    }}
                  >
                    Go Home
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                      borderColor: '#3D405B',
                      color: '#3D405B',
                      '&:hover': {
                        borderColor: '#3D405B',
                        backgroundColor: 'rgba(61, 64, 91, 0.04)',
                      },
                    }}
                  >
                    Go Back
                  </Button>
                </Box>
                
                {suggestions.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>
                      You might be looking for:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          icon={suggestion.icon}
                          label={suggestion.label}
                          component={Link}
                          to={suggestion.path}
                          clickable
                          sx={{ 
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(224, 122, 95, 0.1)',
                            } 
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Right side - Illustration */}
            <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'inline-block',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(0px)' }
                  },
                  animation: 'float 4s ease-in-out infinite'
                }}
              >
                <ErrorIcon 
                  sx={{ 
                    fontSize: isMobile ? 180 : 240, 
                    color: 'rgba(61, 64, 91, 0.15)', 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%) scale(1.2)', 
                    zIndex: 0,
                  }} 
                />
                <svg width={isMobile ? "200" : "260"} height={isMobile ? "200" : "260"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" stroke="#3D405B" strokeWidth="2" />
                  <path d="M9 9L15 15" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15 9L9 15" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Box>
              
              <Box 
                sx={{ 
                  mt: 4, 
                  backgroundColor: 'rgba(61, 64, 91, 0.05)',
                  borderRadius: '8px',
                  p: 2,
                  textAlign: 'left'
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  "The page you're looking for is missing. Perhaps it wandered off to find itself. 
                  Maybe it needed a break from all the clicks. Don't worry, we all get lost sometimes."
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default NotFound;