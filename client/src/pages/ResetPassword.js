// src/pages/ResetPassword.js (Optional - for URL-based password reset)
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Security, 
  CheckCircle,
  ArrowBack 
} from '@mui/icons-material';

const terracottaTheme = {
  primary: '#D2691E',
  secondary: '#CD853F',
  accent: '#F4A460',
  dark: '#A0522D',
  light: '#FFEEE6',
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  
  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  useEffect(() => {
    if (!token || !userId) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token, userId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(100, strength);
  };

  const getStrengthColor = (strength) => {
    if (strength < 25) return '#f44336';
    if (strength < 50) return '#ff9800';
    if (strength < 75) return '#2196f3';
    return '#4caf50';
  };

  const getStrengthText = (strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/password-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset-password',
          token,
          userId,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (tokenValid === false) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This password reset link is invalid or has expired. Please request a new password reset.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth')}
            sx={{
              backgroundColor: terracottaTheme.primary,
              '&:hover': { backgroundColor: terracottaTheme.dark },
            }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ 
          p: 4, 
          borderRadius: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
        }}>
          <CheckCircle sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 'bold', mb: 2 }}>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#388E3C' }}>
            Your password has been reset successfully. You can now login with your new password.
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Redirecting to login page in 3 seconds...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={6} sx={{ 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 48, color: terracottaTheme.primary, mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: terracottaTheme.dark, fontWeight: 'bold' }}>
            Reset Your Password
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Please enter your new password below
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            name="newPassword"
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            fullWidth
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            margin="normal"
            variant="outlined"
            helperText="Password must be at least 8 characters long"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {formData.newPassword && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Password Strength:
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: getStrengthColor(passwordStrength),
                  fontWeight: 'bold'
                }}>
                  {getStrengthText(passwordStrength)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStrengthColor(passwordStrength),
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            fullWidth
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            margin="normal"
            variant="outlined"
            error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
            helperText={
              formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                ? 'Passwords do not match'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
            sx={{
              mt: 3,
              py: 1.5,
              backgroundColor: terracottaTheme.primary,
              '&:hover': { backgroundColor: terracottaTheme.dark },
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: `0 4px 15px rgba(210, 105, 30, 0.3)`,
            }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth')}
            sx={{ color: terracottaTheme.primary, '&:hover': { color: terracottaTheme.dark } }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;