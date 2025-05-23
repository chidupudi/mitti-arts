import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';

// Default admin credentials to initialize
const DEFAULT_ADMINS = [
  { username: 'admin1@mittiarts.com', password: 'admin123@#$2025', role: 'superadmin' },
  { username: 'admin2@mittiarts.com', password: 'admin456@#$2025', role: 'admin' },
  { username: 'admin3@mittiarts.com', password: 'admin789@#$2025', role: 'editor' }
];

// Terracotta color theme
const terracottaTheme = {
  primary: '#D2691E',
  secondary: '#CD853F',
  accent: '#F4A460',
  dark: '#A0522D',
  light: '#FFEEE6',
};

// Main AdminAuth component
const AdminAuth = () => {
  const [form, setForm] = useState({
    adminUsername: '',
    adminPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminsInitialized, setAdminsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize admin credentials on first load
  useEffect(() => {
    const initializeAdmins = async () => {
      try {
        const adminsCollection = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsCollection);
        
        if (adminsSnapshot.empty) {
          console.log('Initializing default admin accounts...');
          
          for (const admin of DEFAULT_ADMINS) {
            try {
              const userCredential = await createUserWithEmailAndPassword(
                auth, 
                admin.username,
                admin.password
              ).catch(async (error) => {
                if (error.code === 'auth/user-not-found') {
                  // Create the admin user if it doesn't exist
                  return await createUserWithEmailAndPassword(
                    auth, 
                    admin.username,
                    admin.password
                  );
                }
                throw error;
              });
              
              await setDoc(doc(db, 'admins', userCredential.user.uid), {
                username: admin.username.split('@')[0],
                email: admin.username,
                isAdmin: true,
                role: admin.role,
                createdAt: new Date().toISOString()
              });
              
              console.log(`Admin user '${admin.username}' created successfully`);
            } catch (error) {
              console.error(`Error creating admin '${admin.username}':`, error.message);
            }
          }
          
          console.log('Admin initialization complete');
        } else {
          console.log('Admin accounts already exist, skipping initialization');
        }
        
        setAdminsInitialized(true);
      } catch (error) {
        console.error('Error during admin initialization:', error);
        setAdminsInitialized(true);
      }
    };
    
    initializeAdmins();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Admin login using Firebase Auth
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    const { adminUsername, adminPassword } = form;

    if (!adminUsername || !adminPassword) {
      setLoading(false);
      return setError('Please enter admin username and password');
    }

    try {
      await setPersistence(auth, browserSessionPersistence);
      
      const adminEmail = adminUsername.includes('@') ? adminUsername : `${adminUsername}@mittiarts.com`;
      
      const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      const adminDoc = await getDoc(doc(db, 'admins', userCred.user.uid));
      
      if (!adminDoc.exists()) {
        await signOut(auth);
        setLoading(false);
        return setError('Not authorized as admin');
      }
      
      const adminData = adminDoc.data();
      
      if (!adminData.isAdmin) {
        await signOut(auth);
        setLoading(false);
        return setError('Not authorized as admin');
      }
      
      const token = await userCred.user.getIdToken();
      
      sessionStorage.setItem('adminToken', token);
      sessionStorage.setItem('adminRole', adminData.role || 'admin');
      sessionStorage.setItem('adminUsername', adminUsername);
      sessionStorage.setItem('isAdmin', 'true');
      
      setSuccess('Admin login successful');
      
      setForm({
        adminUsername: '',
        adminPassword: '',
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Admin login error:', err.code);
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${terracottaTheme.light} 0%, ${terracottaTheme.accent} 50%, ${terracottaTheme.primary} 100%)`,
        py: 4
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          width: 420, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `2px solid ${terracottaTheme.accent}`,
          boxShadow: `0 8px 32px rgba(210, 105, 30, 0.3)`
        }}
      >
        {/* Header with Terracotta Theme */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${terracottaTheme.primary}, ${terracottaTheme.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: `0 4px 20px rgba(210, 105, 30, 0.4)`
            }}
          >
            <AdminPanelSettings 
              sx={{ 
                fontSize: 40, 
                color: 'white',
              }} 
            />
          </Box>
          
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: terracottaTheme.dark,
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            MittiArts Admin
          </Typography>
        </Box>

        <Typography 
          variant="h5" 
          gutterBottom 
          textAlign="center"
          sx={{ 
            color: terracottaTheme.dark,
            mb: 3,
            fontWeight: 'medium'
          }}
        >
          🔐 Admin Login
        </Typography>

        <form onSubmit={handleAdminLogin}>
          <TextField
            label="Admin Username"
            name="adminUsername"
            value={form.adminUsername}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="Enter admin username"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: terracottaTheme.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: terracottaTheme.primary,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: terracottaTheme.primary,
              },
            }}
          />
          <TextField
            label="Admin Password"
            name="adminPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.adminPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="Enter admin password"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: terracottaTheme.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: terracottaTheme.primary,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: terracottaTheme.primary,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !adminsInitialized}
            sx={{ 
              mt: 3,
              py: 1.5,
              backgroundColor: terracottaTheme.dark,
              '&:hover': {
                backgroundColor: terracottaTheme.primary,
              },
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: `0 4px 15px rgba(210, 105, 30, 0.3)`,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              '🔐 Admin Login'
            )}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

// ProtectedRoute component for admin routes
const ProtectedAdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.log('No user is signed in');
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
          
          // Check if user is admin
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            
            if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
              console.log('User is not authorized as admin');
              setIsAuthorized(false);
              setIsLoading(false);
              return;
            }
            
            console.log('Admin access granted');
            setIsAuthorized(true);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAuthorized(false);
          }
          
          setIsLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
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
          🔐 Verifying Admin Access...
        </Typography>
      </Box>
    );
  }

  // Redirect to admin auth if not authorized
  if (!isAuthorized) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export { AdminAuth as default, ProtectedAdminRoute };