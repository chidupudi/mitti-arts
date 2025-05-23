import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper 
} from '@mui/material';

const AdminProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Terracotta theme colors
  const terracottaTheme = {
    primary: '#D2691E',
    secondary: '#CD853F',
    accent: '#F4A460',
    dark: '#A0522D',
    light: '#FFEEE6',
  };

  useEffect(() => {
    const checkAdminAccess = () => {
      console.log('🔍 Checking admin access...');
      
      // Get the 3 simple localStorage items
      const adminToken = localStorage.getItem('adminToken');
      const isAdmin = localStorage.getItem('isAdmin');
      const adminUsername = localStorage.getItem('adminUsername');

      console.log('adminToken:', adminToken);
      console.log('isAdmin:', isAdmin);
      console.log('adminUsername:', adminUsername);

      // SUPER SIMPLE CHECK - Just check if all 3 exist and isAdmin is 'true'
      if (adminToken && isAdmin === 'true' && adminUsername) {
        // Extra check: token should start with 'ADMIN_LOGGED_IN_'
        if (adminToken.startsWith('ADMIN_LOGGED_IN_')) {
          console.log('✅ Admin access granted!');
          setIsAuthorized(true);
        } else {
          console.log('❌ Invalid admin token format');
          setIsAuthorized(false);
        }
      } else {
        console.log('❌ Missing admin credentials');
        setIsAuthorized(false);
      }

      setIsLoading(false);
    };

    // Small delay to simulate loading (makes it feel more natural)
    setTimeout(checkAdminAccess, 500);
  }, []);

  // Show loading spinner
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: `linear-gradient(135deg, ${terracottaTheme.light} 0%, ${terracottaTheme.accent} 50%, ${terracottaTheme.primary} 100%)`,
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: terracottaTheme.primary,
            mb: 2
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: terracottaTheme.dark,
            fontWeight: 'bold'
          }}
        >
          🔐 Checking Admin Access...
        </Typography>
      </Box>
    );
  }

  // If not authorized, show access denied and redirect
  if (!isAuthorized) {
    return (
      <>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{
            background: `linear-gradient(135deg, ${terracottaTheme.light} 0%, ${terracottaTheme.accent} 50%, ${terracottaTheme.primary} 100%)`,
            p: 2
          }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              p: 4, 
              maxWidth: 500, 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: `2px solid ${terracottaTheme.accent}`,
              boxShadow: `0 8px 32px rgba(210, 105, 30, 0.3)`
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${terracottaTheme.primary}, ${terracottaTheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: `0 4px 20px rgba(210, 105, 30, 0.4)`
              }}
            >
              <Typography sx={{ fontSize: '2rem' }}>🔒</Typography>
            </Box>
            
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                color: terracottaTheme.dark,
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Access Denied
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: terracottaTheme.primary,
                mb: 2
              }}
            >
              🚫 Admin Login Required
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: terracottaTheme.dark,
                mb: 2
              }}
            >
              You need administrator privileges to access this page.
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: terracottaTheme.secondary
              }}
            >
              Please login as admin to continue.
            </Typography>
          </Paper>
        </Box>
        <Navigate to="/auth" replace />
      </>
    );
  }

  // All good - show the protected content
  return <>{children}</>;
};

// Simple utility functions
export const adminUtils = {
  // Check if user is admin (super simple)
  isAdmin: () => {
    const adminToken = localStorage.getItem('adminToken');
    const isAdmin = localStorage.getItem('isAdmin');
    return adminToken && isAdmin === 'true' && adminToken.startsWith('ADMIN_LOGGED_IN_');
  },

  // Get admin username
  getAdminUsername: () => {
    return localStorage.getItem('adminUsername');
  },

  // Simple logout
  logout: () => {
    // Clear the 3 admin items
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUsername');
    

    // Redirect to auth
    window.location.href = '/auth';
  }
};

// Simple React hook to get admin status
export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    const checkStatus = () => {
      setIsAdmin(adminUtils.isAdmin());
      setAdminUsername(adminUtils.getAdminUsername() || '');
    };

    checkStatus();
    
    // Check every 2 seconds (in case user logs out in another tab)
    const interval = setInterval(checkStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return { isAdmin, adminUsername };
};

export default AdminProtectedRoute;