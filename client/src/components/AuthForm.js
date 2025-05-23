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
  Divider,
  FormControlLabel,
  Switch,
  CircularProgress, 
} from '@mui/material';
import { Visibility, VisibilityOff, Google, AdminPanelSettings } from '@mui/icons-material';
import { auth, db, googleProvider } from '../Firebase/Firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';

// Default admin credentials to initialize
const DEFAULT_ADMINS = [
  { username: 'admin1@mittiarts.com', password: 'admin123@#$2025', role: 'superadmin' },
  { username: 'admin2@mittiarts.com', password: 'admin456@#$2025', role: 'admin' },
  { username: 'admin3@mittiarts.com', password: 'admin789@#$2025', role: 'editor' }
];

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminUsername: '',
    adminPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminsInitialized, setAdminsInitialized] = useState(false);
  const navigate = useNavigate();

  // Terracotta color theme
  const terracottaTheme = {
    primary: '#D2691E',
    secondary: '#CD853F',
    accent: '#F4A460',
    dark: '#A0522D',
    light: '#FFEEE6',
  };
// Initialize admin credentials on first load
useEffect(() => {
  const initializeAdmins = async () => {
    try {
      // Check if admins are already initialized
      const adminsCollection = collection(db, 'admins');
      const adminsSnapshot = await getDocs(adminsCollection);
      
      if (adminsSnapshot.empty) {
        console.log('Initializing default admin accounts...');
        
        // Create admin accounts
        for (const admin of DEFAULT_ADMINS) {
          try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              admin.username, // Use the email directly
              admin.password
            );
            
            // Add admin record to Firestore
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
              username: admin.username.split('@')[0], // Extract username part from email
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
      setAdminsInitialized(true); // Set to true anyway to avoid infinite retries
    }
  };
  
  initializeAdmins();
}, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
// Admin login using Firebase Auth
const handleAdminLogin = async () => {
  setError('');
  setSuccess('');
  
  const { adminUsername, adminPassword } = form;

  if (!adminUsername || !adminPassword) {
    return setError('Please enter admin username and password');
  }

  try {
    // Set persistence to session (ends when window closes)
    await setPersistence(auth, browserSessionPersistence);
    
    // Use the admin username as email directly
    const adminEmail = adminUsername.includes('@') ? adminUsername : `${adminUsername}@mittiarts.com`;
    
    // Authenticate with Firebase
    const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    
    // Check if user exists in admins collection
    const adminDoc = await getDoc(doc(db, 'admins', userCred.user.uid));
    
    if (!adminDoc.exists()) {
      // Sign out if not an admin
      await auth.signOut();
      return setError('Not authorized as admin');
    }
    
    // Get admin data
    const adminData = adminDoc.data();
    
    if (!adminData.isAdmin) {
      await auth.signOut();
      return setError('Not authorized as admin');
    }
    
    // Get secure token
    const token = await userCred.user.getIdToken();
    
    // Store auth data in sessionStorage (more secure than localStorage)
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminRole', adminData.role || 'admin');
    sessionStorage.setItem('adminUsername', adminUsername);
    sessionStorage.setItem('isAdmin', 'true');
    
    setSuccess('Admin login successful');
    
    // Clear form
    setForm({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      adminUsername: '',
      adminPassword: '',
    });
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  } catch (err) {
    console.error('Admin login error:', err.code);
    setError('Invalid admin credentials');
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdminMode) {
      return handleAdminLogin();
    }

    // Regular user login/signup
    setError('');
    setSuccess('');

    const { name, phone, email, password, confirmPassword } = form;

    if (!isLogin && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      // Set persistence to session
      await setPersistence(auth, browserSessionPersistence);
      
      let userCred;
      let nameToStore = name;

      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        nameToStore = userData.name || 'User';

        sessionStorage.setItem('userPhone', userData.phone || '');
        setSuccess('Logged in successfully');
      } else {
        userCred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, 'users', userCred.user.uid), {
          name,
          phone,
          email,
          createdAt: new Date().toISOString(),
        });

        setSuccess('Signed up successfully');
        sessionStorage.setItem('userPhone', phone);
      }

      const token = await userCred.user.getIdToken();
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userName', nameToStore);
      sessionStorage.setItem('userId', userCred.user.uid);
      sessionStorage.setItem('isAdmin', 'false');

      setForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminUsername: '',
        adminPassword: '',
      });
      
      // Navigate to home after login
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      console.error('Auth error:', err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (isAdminMode) {
      setError('Google sign-in not available for admin mode');
      return;
    }

    setError('');
    setSuccess('');
    try {
      // Set persistence to session
      await setPersistence(auth, browserSessionPersistence);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const userData = {
          name: user.displayName || 'Google User',
          email: user.email,
          phone: user.phoneNumber || '',
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        sessionStorage.setItem('userPhone', userData.phone);
      } else {
        const existingData = userDoc.data();
        sessionStorage.setItem('userPhone', existingData.phone || '');
      }

      const token = await user.getIdToken();
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userEmail', user.email);
      sessionStorage.setItem('userName', user.displayName || 'Google User');
      sessionStorage.setItem('userId', user.uid);
      sessionStorage.setItem('isAdmin', 'false');

      setSuccess('Signed in with Google successfully');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Google sign-in error:', err.code);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleModeSwitch = () => {
    setIsAdminMode(!isAdminMode);
    setError('');
    setSuccess('');
    setForm({
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      adminUsername: '',
      adminPassword: '',
    });
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
                filter: isAdminMode ? 'none' : 'grayscale(100%)'
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
            MittiArts
          </Typography>
        </Box>

        {/* Admin Mode Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isAdminMode}
                onChange={handleModeSwitch}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: terracottaTheme.primary,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: terracottaTheme.primary,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: terracottaTheme.dark, fontWeight: 'medium' }}>
                Admin Mode
              </Typography>
            }
          />
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
          {isAdminMode ? '🔐 Admin Login' : (isLogin ? '👋 Welcome Back' : '✨ Join Us')}
        </Typography>

        <form onSubmit={handleSubmit}>
          {isAdminMode ? (
            // Admin Login Form
            <>
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
            </>
          ) : (
            // Regular User Form
            <>
              {!isLogin && (
                <>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
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
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
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
                </>
              )}

              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
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
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
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

              {!isLogin && (
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
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
              )}
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 3,
              py: 1.5,
              backgroundColor: isAdminMode ? terracottaTheme.dark : terracottaTheme.primary,
              '&:hover': {
                backgroundColor: isAdminMode ? terracottaTheme.primary : terracottaTheme.dark,
              },
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: `0 4px 15px rgba(210, 105, 30, 0.3)`,
            }}
          >
            {isAdminMode ? '🔐 Admin Login' : (isLogin ? '🚀 Login' : '✨ Sign Up')}
          </Button>
        </form>

        {!isAdminMode && (
          <>
            <Divider sx={{ my: 3, color: terracottaTheme.primary }}>OR</Divider>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
              sx={{
                borderColor: terracottaTheme.primary,
                color: terracottaTheme.primary,
                '&:hover': {
                  borderColor: terracottaTheme.dark,
                  backgroundColor: terracottaTheme.light,
                },
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Sign In with Google
            </Button>
          </>
        )}

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

        {!isAdminMode && (
          <Typography
            variant="body2"
            sx={{ 
              mt: 3, 
              textAlign: 'center', 
              cursor: 'pointer', 
              color: terracottaTheme.primary,
              '&:hover': {
                color: terracottaTheme.dark,
                textDecoration: 'underline'
              }
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? '✨ New user? Click here to Sign Up'
              : '👋 Already have an account? Click here to Login'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

// ProtectedRoute component
export const ProtectedRoute = ({ children, adminOnly = false }) => {
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
    const checkAuth = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.log('No user is signed in');
            setIsAuthorized(false);
            setIsLoading(false);
            return;
          }
          
          // Check if this is an admin route
          if (adminOnly) {
            try {
              // Check if user is in admins collection
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
          } else {
            // Regular user route - any authenticated user is allowed
            setIsAuthorized(true);
          }
          
          setIsLoading(false);
        });
        
        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [adminOnly]);

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
          {adminOnly ? '🔐 Verifying Admin Access...' : '🔒 Verifying Access...'}
        </Typography>
      </Box>
    );
  }

  // If not authorized, redirect to auth page
  if (!isAuthorized) {
    return <Navigate to="/auth" replace />;
  }

  // All good - show the protected content
  return <>{children}</>;
};

// Utility functions
export const authUtils = {
  // Check if user is admin
  isAdmin: async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return false;
      }
      
      // Check admin status in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        return false;
      }
      
      return adminDoc.data().isAdmin === true;
    } catch (error) {
      console.error("Admin check error:", error);
      return false;
    }
  },

  // Get username
  getUsername: async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return '';
      }
      
      // Check if admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        return adminDoc.data().username || '';
      }
      
      // Regular user
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        return userDoc.data().name || '';
      }
      
      return '';
    } catch (error) {
      console.error("Get username error:", error);
      return '';
    }
  },

  // Secure logout
  logout: async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear session storage
      sessionStorage.clear();
      
      // Redirect to auth
      window.location.href = '/auth';
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
};

// React hook for auth status
export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUsername('');
          setIsLoading(false);
          return;
        }
        
        setIsLoggedIn(true);
        
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setIsAdmin(true);
          setUsername(adminDoc.data().username || '');
        } else {
          setIsAdmin(false);
          
          // Regular user
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUsername(userDoc.data().name || '');
          } else {
            setUsername('');
          }
        }
      } catch (error) {
        console.error("Auth status check error:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsername('');
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return { isLoggedIn, isAdmin, username, isLoading };
};