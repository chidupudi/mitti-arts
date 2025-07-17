// components/ScrollingBanner.js
import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';

const ScrollingBanner = ({ 
  message = "📅 Book before Aug 7th to get 15% OFF! 🎨 Get Mitti Arts Alive with your order! 🌟",
  height = "40px",
  speed = 20 // seconds for one complete scroll
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollAnimation = `
    @keyframes scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `;

  return (
    <>
      <style>
        {scrollAnimation}
      </style>
      <Box
        sx={{
          width: '100%',
          height: { xs: '36px', sm: height },
          overflow: 'hidden',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          whiteSpace: 'nowrap',
          position: 'relative',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Typography
          component="div"
          sx={{
            display: 'inline-block',
            paddingLeft: '100%',
            animation: `scroll ${isMobile ? speed - 5 : speed}s linear infinite`,
            fontWeight: 600,
            fontSize: { xs: 'clamp(0.75rem, 1.8vw, 0.875rem)', sm: 'clamp(0.875rem, 2vw, 1rem)' },
            lineHeight: 1.2,
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {message}
        </Typography>
      </Box>
    </>
  );
};

// Alternative version with multiple messages
export const MultiMessageBanner = ({ 
  messages = [
    "📅 Book before Aug 7th to get 15% OFF!",
    "🎨 Get Mitti Arts Alive with your order!",
    "🌟 Limited time offer - Don't miss out!"
  ],
  height = "40px",
  speed = 11
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const combinedMessage = messages.join(' • ');

  const scrollAnimation = `
    @keyframes scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `;

  return (
    <>
      <style>
        {scrollAnimation}
      </style>
      <Box
        sx={{
          width: '100%',
          height: { xs: '36px', sm: height },
          overflow: 'hidden',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          whiteSpace: 'nowrap',
          position: 'relative',
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Typography
          component="div"
          sx={{
            display: 'inline-block',
            paddingLeft: '100%',
            animation: `scroll ${isMobile ? speed - 5 : speed}s linear infinite`,
            fontWeight: 600,
            fontSize: { xs: 'clamp(0.75rem, 1.8vw, 0.875rem)', sm: 'clamp(0.875rem, 2vw, 1rem)' },
            lineHeight: 1.2,
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {combinedMessage}
        </Typography>
      </Box>
    </>
  );
};

export default ScrollingBanner;