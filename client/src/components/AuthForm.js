import React, { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { auth, db, googleProvider } from '../Firebase/Firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Terracotta color theme
const terracottaTheme = {
  primary: '#D2691E',
  secondary: '#CD853F',
  accent: '#F4A460',
  dark: '#A0522D',
  light: '#FFEEE6',
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Regular user login/signup
    setError('');
    setSuccess('');
    setLoading(true);

    const { name, phone, email, password, confirmPassword } = form;

    if (!isLogin && password !== confirmPassword) {
      setLoading(false);
      return setError('Passwords do not match');
    }

    try {
      let userCred;
      let nameToStore = name;

      if (isLogin) {
        userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        nameToStore = userData.name || 'User';

        // Store phone number from userData
        localStorage.setItem('userPhone', userData.phone || '');
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

        // Add phone number to localStorage after successful signup
        localStorage.setItem('userPhone', phone);
      }

      const token = await userCred.user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', nameToStore);
      localStorage.setItem('userId', userCred.user.uid);

      setForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Navigate based on action - login goes to home, signup stays on auth page but switches to login
      if (isLogin) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Sign out the user after signup so they have to login manually
        setTimeout(async () => {
          await signOut(auth);
          localStorage.clear(); // Clear stored data
          setIsLogin(true);
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err.code);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get user data from Firestore if exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document with Google profile data
        const userData = {
          name: user.displayName || 'Google User',
          email: user.email,
          phone: user.phoneNumber || '', // Get phone from Google profile if available
          createdAt: new Date().toISOString(),
        };

        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), userData);
        
        // Save to localStorage
        localStorage.setItem('userPhone', userData.phone);
      } else {
        // User exists, get their phone number
        const existingData = userDoc.data();
        localStorage.setItem('userPhone', existingData.phone || '');
      }

      // Save other user data to localStorage
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'Google User');
      localStorage.setItem('userId', user.uid);

      setSuccess('Signed in with Google successfully');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Google sign-in error:', err.code);
      setError(err.message);
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
          {isLogin ? '👋 Welcome Back' : '✨ Join Us'}
        </Typography>

        <form onSubmit={handleSubmit}>
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ 
              mt: 3,
              py: 1.5,
              backgroundColor: terracottaTheme.primary,
              '&:hover': {
                backgroundColor: terracottaTheme.dark,
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
              isLogin ? '🚀 Login' : '✨ Sign Up'
            )}
          </Button>
        </form>

        <Divider sx={{ my: 3, color: terracottaTheme.primary }}>OR</Divider>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
          disabled={loading}
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
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign In with Google"
          )}
        </Button>

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
      </Paper>
    </Box>
  );
}