import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  Paper 
} from '@mui/material';

const AdminProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateAdminAccess = async () => {
      try {
        setIsLoading(true);
        setError('');

                const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated !== 'true') {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Check if user is marked as admin
        const isAdmin = localStorage.getItem('isAdmin');
        if (isAdmin !== 'true') {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }


        // Get admin token and user data
        const adminToken = localStorage.getItem('adminToken');
        const adminUserData = localStorage.getItem('adminUser');

        if (!adminToken || !adminUserData) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Parse admin user data
        const adminUser = JSON.parse(adminUserData);
        
        // Query admin users collection to find the admin by username
        const q = query(
          collection(db, 'adminUsers'),
          where('username', '==', adminUser.username)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Admin user no longer exists in database
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('isAdmin');
          setError('Admin account no longer exists');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Get the first matching admin document (assuming usernames are unique)
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();

        // Check if admin account is still active
        if (!adminData.isActive) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('isAdmin');
          setError('Admin account has been disabled');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Check role-based access if required
        if (requiredRole && adminData.role !== requiredRole) {
          // Check role hierarchy
          const roleHierarchy = {
            'super_admin': 3,
            'admin': 2,
            'moderator': 1
          };

          const userRoleLevel = roleHierarchy[adminData.role] || 0;
          const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

          if (userRoleLevel < requiredRoleLevel) {
            setError(`Access denied. Required role: ${requiredRole}, Your role: ${adminData.role}`);
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
        }

        // Validate token format (basic check)
        const tokenParts = adminToken.split('_');
        if (tokenParts.length !== 3 || tokenParts[0] !== 'admin' || tokenParts[1] !== adminUser.username) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('isAdmin');
          setError('Invalid admin token');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Check token age (optional - expire after 24 hours)
        const tokenTimestamp = parseInt(tokenParts[2]);
        const currentTime = Date.now();
        const tokenAge = currentTime - tokenTimestamp;
        const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours

        if (tokenAge > maxTokenAge) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('isAdmin');
          setError('Admin session expired. Please login again.');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setIsLoading(false);

      } catch (err) {
        console.error('Error validating admin access:', err);
        setError('Error validating admin access');
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    validateAdminAccess();
  }, [requiredRole]);

  // Show loading spinner while validating
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Validating Admin Access...
        </Typography>
      </Box>
    );
  }

  // Show error if validation failed
  if (!isAuthorized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="grey.50"
        p={2}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" color="text.secondary">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Navigate to="/login" replace />
          </Box>
        </Paper>
      </Box>
    );
  }

  // Render protected content if authorized
  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAdminProtection = (Component, requiredRole = null) => {
  return (props) => (
    <AdminProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </AdminProtectedRoute>
  );
};

// Hook to get current admin user data
export const useAdminUser = () => {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const adminUserData = localStorage.getItem('adminUser');
    if (adminUserData) {
      setAdminUser(JSON.parse(adminUserData));
    }
  }, []);

  return adminUser;
};

// Utility functions for admin authentication
export const adminAuthUtils = {
  // Check if current user is admin
  isAdmin: () => {
    return localStorage.getItem('isAdmin') === 'true';
  },

  // Get admin user data
  getAdminUser: () => {
    const adminUserData = localStorage.getItem('adminUser');
    return adminUserData ? JSON.parse(adminUserData) : null;
  },

  // Check if admin has specific role
  hasRole: (role) => {
    const adminUser = adminAuthUtils.getAdminUser();
    return adminUser && adminUser.role === role;
  },

  // Check if admin has minimum role level
  hasMinimumRole: (minimumRole) => {
    const adminUser = adminAuthUtils.getAdminUser();
    if (!adminUser) return false;

    const roleHierarchy = {
      'super_admin': 3,
      'admin': 2,
      'moderator': 1
    };

    const userRoleLevel = roleHierarchy[adminUser.role] || 0;
    const minimumRoleLevel = roleHierarchy[minimumRole] || 0;

    return userRoleLevel >= minimumRoleLevel;
  },

  // Logout admin user
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login';
  }
};

export default AdminProtectedRoute;