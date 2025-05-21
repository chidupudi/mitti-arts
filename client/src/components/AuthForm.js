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
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { auth, db, googleProvider } from '../Firebase/Firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AuthForm() {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, phone, email, password, confirmPassword } = form;

    if (!isLogin && password !== confirmPassword) {
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

    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          {isLogin ? 'Login' : 'Sign Up'}
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
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
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
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
        >
          Sign In with Google
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
          sx={{ mt: 2, textAlign: 'center', cursor: 'pointer', color: 'blue' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? 'New user? Click here to Sign Up'
            : 'Already have an account? Click here to Login'}
        </Typography>
      </Paper>
    </Box>
  );
}
