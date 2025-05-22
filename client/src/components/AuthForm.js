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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Visibility, VisibilityOff, Google, AdminPanelSettings } from '@mui/icons-material';
import { auth, db, googleProvider } from '../Firebase/Firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleAdminLogin = async () => {
  setError('');
  setSuccess('');
  
  const { adminUsername, adminPassword } = form;

  if (!adminUsername || !adminPassword) {
    return setError('Please enter admin username and password');
  }

  try {
    // Query admin users collection where username matches
    const adminQuery = query(
      collection(db, 'adminUsers'),
      where('username', '==', adminUsername)
    );
    
    const querySnapshot = await getDocs(adminQuery);
    
    if (querySnapshot.empty) {
      return setError('Invalid admin credentials');
    }

    // Get the first matching admin (assuming usernames are unique)
    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();
    
    if (adminData.password !== adminPassword || !adminData.isActive) {
      return setError('Invalid admin credentials or account disabled');
    }

    // Create admin token and store admin data
    const adminToken = `admin_${adminUsername}_${Date.now()}`;
    
    localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('adminUser', JSON.stringify({
      username: adminUsername,
      name: adminData.name,
      role: adminData.role,
      email: adminData.email
    }));
    localStorage.setItem('isAdmin', 'true');
localStorage.setItem('isAuthenticated', 'true');
    setSuccess('Admin login successful');
    
    // Navigate to dashboard
navigate('/dashboard');
  } catch (err) {
    setError('Error during admin login: ' + err.message);
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdminMode) {
      return handleAdminLogin();
    }

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
        localStorage.setItem('userPhone', phone);
      }

      const token = await userCred.user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', nameToStore);
      localStorage.setItem('userId', userCred.user.uid);
      localStorage.setItem('isAdmin', 'false');

      setForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminUsername: '',
        adminPassword: '',
      });

    } catch (err) {
      setError(err.message);
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
        localStorage.setItem('userPhone', userData.phone);
      } else {
        const existingData = userDoc.data();
        localStorage.setItem('userPhone', existingData.phone || '');
      }

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'Google User');
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('isAdmin', 'false');

      setSuccess('Signed in with Google successfully');
    } catch (err) {
      setError(err.message);
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
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4, width: 400 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <AdminPanelSettings sx={{ mr: 1, color: isAdminMode ? 'primary.main' : 'grey.400' }} />
          <FormControlLabel
            control={
              <Switch
                checked={isAdminMode}
                onChange={handleModeSwitch}
                color="primary"
              />
            }
            label="Admin Mode"
          />
        </Box>

        <Typography variant="h5" gutterBottom textAlign="center">
          {isAdminMode ? 'Admin Login' : (isLogin ? 'Login' : 'Sign Up')}
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
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            color={isAdminMode ? "secondary" : "primary"}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isAdminMode ? 'Admin Login' : (isLogin ? 'Login' : 'Sign Up')}
          </Button>
        </form>

        {!isAdminMode && (
          <>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Google />}
              onClick={handleGoogleSignIn}
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
            sx={{ mt: 2, textAlign: 'center', cursor: 'pointer', color: 'blue' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? 'New user? Click here to Sign Up'
              : 'Already have an account? Click here to Login'}
          </Typography>
        )}

        {isAdminMode && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            
          </Box>
        )}
      </Paper>
    </Box>
  );
}