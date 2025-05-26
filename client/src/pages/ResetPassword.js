// src/pages/ResetPassword.js - COMPLETE RESET PASSWORD PAGE
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

// Terracotta theme
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
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Get token and userId from URL
  const token = searchParams.get('token');
  const userId = searchParams.get('id');

  useEffect(() => {
    // Validate token presence
    if (!token || !userId) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidatingToken(false);
      return;
    }

    // Simple token format validation
    if (token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
      setError('Invalid reset token format.');
      setValidatingToken(false);
      return;
    }

    setTokenValid(true);
    setValidatingToken(false);
  }, [token, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain uppercase letters, lowercase letters, and numbers');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

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
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth', { 
            state: { 
              message: 'Password reset successfully! Please login with your new password.' 
            }
          });
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '#e0e0e0' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { strength: 1, label: 'Very Weak', color: '#f44336' },
      { strength: 2, label: 'Weak', color: '#ff9800' },
      { strength: 3, label: 'Fair', color: '#ffc107' },
      { strength: 4, label: 'Good', color: '#4caf50' },
      { strength: 5, label: 'Strong', color: '#2e7d32' }
    ];

    return levels[score - 1] || levels[0];
  };

  if (validatingToken) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: terracottaTheme.primary }} />
          <Typography variant="h6" sx={{ mt: 2, color: terracottaTheme.dark }}>
            Validating reset link...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={8} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#f44336', mb: 2 }}>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/auth')}
            sx={{
              backgroundColor: terracottaTheme.primary,
              '&:hover': { backgroundColor: terracottaTheme.dark }
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
        <Paper elevation={8} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#4caf50', mb: 2 }}>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Your password has been updated successfully. You will be redirected to the login page shortly.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} sx={{ color: terracottaTheme.primary }} />
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/auth')}
            sx={{
              borderColor: terracottaTheme.primary,
              color: terracottaTheme.primary,
              '&:hover': {
                borderColor: terracottaTheme.dark,
                backgroundColor: terracottaTheme.light
              }
            }}
          >
            Go to Login Now
          </Button>
        </Paper>
      </Container>
    );
  }

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${terracottaTheme.light} 0%, ${terracottaTheme.accent} 50%, ${terracottaTheme.primary} 100%)`,
        py: 4,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `2px solid ${terracottaTheme.accent}`,
            boxShadow: `0 8px 32px rgba(210, 105, 30, 0.3)`
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: terracottaTheme.dark,
                fontWeight: 'bold',
                mb: 1
              }}
            >
              🏺 MittiArts
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: terracottaTheme.dark,
                fontWeight: 'medium'
              }}
            >
              🔒 Reset Your Password
            </Typography>
          </Box>

          {/* Progress Stepper */}
          <Stepper activeStep={1} sx={{ mb: 4 }}>
            <Step completed>
              <StepLabel>Email Sent</StepLabel>
            </Step>
            <Step>
              <StepLabel>Reset Password</StepLabel>
            </Step>
          </Stepper>

          <form onSubmit={handleSubmit}>
            <TextField
              name="newPassword"
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              autoComplete="new-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: terracottaTheme.primary },
                  '&.Mui-focused fieldset': { borderColor: terracottaTheme.primary },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: terracottaTheme.primary },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: terracottaTheme.primary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 4,
                      backgroundColor: '#e0e0e0',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                  Use 8+ characters with uppercase, lowercase, and numbers
                </Typography>
              </Box>
            )}

            <TextField
              name="confirmPassword"
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              autoComplete="new-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: terracottaTheme.primary },
                  '&.Mui-focused fieldset': { borderColor: terracottaTheme.primary },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: terracottaTheme.primary },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: terracottaTheme.primary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <Box sx={{ mt: 1, mb: 2 }}>
                {formData.newPassword === formData.confirmPassword ? (
                  <Typography variant="caption" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16 }} />
                    Passwords match
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ErrorIcon sx={{ fontSize: 16 }} />
                    Passwords don't match
                  </Typography>
                )}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
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
                '&:hover': { backgroundColor: terracottaTheme.dark },
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: `0 4px 15px rgba(210, 105, 30, 0.3)`,
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Resetting Password...
                </Box>
              ) : (
                '🔐 Reset Password'
              )}
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/auth')}
              sx={{
                mt: 2,
                color: terracottaTheme.primary,
                '&:hover': {
                  backgroundColor: terracottaTheme.light,
                  color: terracottaTheme.dark
                }
              }}
            >
              ← Back to Login
            </Button>
          </form>

          {/* Security Notice */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            backgroundColor: terracottaTheme.light, 
            borderRadius: 2,
            border: `1px solid ${terracottaTheme.accent}`
          }}>
            <Typography variant="caption" sx={{ color: terracottaTheme.dark, fontWeight: 'bold' }}>
              🔒 Security Notice:
            </Typography>
            <Typography variant="caption" sx={{ color: terracottaTheme.dark, display: 'block', mt: 0.5 }}>
              This reset link will expire in 1 hour. After resetting your password, you'll be automatically logged out from all devices for security.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;