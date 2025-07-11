import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Badge,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import Chip from '@mui/material/Chip';
import { Visibility, VisibilityOff, Security } from '@mui/icons-material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const Profile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    initial: '',
  });
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [openNameDialog, setOpenNameDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const phone = localStorage.getItem('userPhone');
    const uid = localStorage.getItem('userId');

    if (!token || !name || !email) {
      navigate('/auth');
    } else {
      setUserData({
        name,
        email,
        phone: phone || 'Not provided',
        initial: name.charAt(0).toUpperCase(),
      });
      setUserId(uid);
      
      if (!phone || phone === '') {
        setNotification(true);
      }
    }
  }, [navigate]);

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      setPasswordLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      setSuccessMessage('Password changed successfully!');
      setShowSuccessAlert(true);
      setOpenPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordError('Current password is incorrect');
          break;
        case 'auth/weak-password':
          setPasswordError('Password is too weak');
          break;
        case 'auth/requires-recent-login':
          setPasswordError('Please login again to change your password');
          break;
        default:
          setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePhone = async () => {
    try {
      if (!newPhone) return;
      
      setLoading(true);
      
      await updateDoc(doc(db, 'users', userId), {
        phone: newPhone
      });

      localStorage.setItem('userPhone', newPhone);

      setUserData(prev => ({
        ...prev,
        phone: newPhone
      }));

      setOpenPhoneDialog(false);
      setNewPhone('');
      setSuccessMessage('Phone number updated successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error updating phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    try {
      if (!newName) return;
      
      setLoading(true);
      
      await updateDoc(doc(db, 'users', userId), {
        name: newName
      });

      localStorage.setItem('userName', newName);

      setUserData(prev => ({
        ...prev,
        name: newName,
        initial: newName.charAt(0).toUpperCase(),
      }));

      setOpenNameDialog(false);
      setNewName('');
      setSuccessMessage('Name updated successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(false);
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: isMobile ? 2 : 5, px: isMobile ? 1 : 2 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          borderRadius: 4, 
          p: isMobile ? 3 : 4,
          background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(135deg, #a1887f 0%, #795548 100%)',
            zIndex: 0
          }}
        />
        
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} position="relative" zIndex={1} mt={4}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                size="small"
                sx={{
                  bgcolor: '#795548',
                  color: 'white',
                  '&:hover': { bgcolor: '#5D4037' },
                  width: 28,
                  height: 28
                }}
                onClick={() => {
                  setNewName(userData.name);
                  setOpenNameDialog(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <Avatar 
              sx={{ 
                bgcolor: '#795548', 
                width: 100, 
                height: 100, 
                fontSize: 40,
                boxShadow: '0 4px 12px rgba(121, 85, 72, 0.4)',
                border: '4px solid white'
              }}
            >
              {userData.initial || <PersonIcon fontSize="large" />}
            </Avatar>
          </Badge>
          
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#4E342E', mt: 1 }}>
            {userData.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#795548', fontStyle: 'italic' }}>
            {userData.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ p: 2 }}>
          <Card 
            elevation={2} 
            sx={{ 
              mb: 2, 
              borderRadius: 2, 
              border: '1px solid #E0E0E0',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ color: '#795548', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#8D6E63', fontWeight: 500 }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {userData.name}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                color="primary" 
                sx={{ 
                  bgcolor: '#EFEBE9', 
                  '&:hover': { bgcolor: '#D7CCC8' } 
                }}
                onClick={() => {
                  setNewName(userData.name);
                  setOpenNameDialog(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </CardContent>
          </Card>

          <Card 
            elevation={2} 
            sx={{ 
              mb: 2, 
              borderRadius: 2, 
              border: '1px solid #E0E0E0',
              bgcolor: '#F9F9F9'
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ color: '#795548', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#8D6E63', fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {userData.email}
                  </Typography>
                </Box>
              </Box>
              {userData.email && (
                <Chip 
                  icon={<LockIcon fontSize="small" />} 
                  label="Verified" 
                  size="small"
                  sx={{
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 500
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card 
            elevation={2} 
            sx={{ 
              mb: 2,
              borderRadius: 2, 
              border: userData.phone === 'Not provided' ? '1px dashed #BDBDBD' : '1px solid #E0E0E0',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ color: '#795548', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#8D6E63', fontWeight: 500 }}>
                    Phone
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: userData.phone === 'Not provided' ? '#9E9E9E' : 'inherit',
                      fontStyle: userData.phone === 'Not provided' ? 'italic' : 'normal'
                    }}
                  >
                    {userData.phone}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={userData.phone === 'Not provided' ? null : <EditIcon />}
                size="small"
                onClick={() => {
                  setNewPhone(userData.phone === 'Not provided' ? '' : userData.phone);
                  setOpenPhoneDialog(true);
                }}
                sx={{
                  bgcolor: userData.phone === 'Not provided' ? '#795548' : '#EFEBE9',
                  color: userData.phone === 'Not provided' ? 'white' : '#795548',
                  '&:hover': {
                    bgcolor: userData.phone === 'Not provided' ? '#5D4037' : '#D7CCC8'
                  },
                  fontWeight: 500,
                  boxShadow: userData.phone === 'Not provided' ? 'initial' : 'none'
                }}
              >
                {userData.phone === 'Not provided' ? 'Add Phone' : 'Edit'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Security Card */}
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2, 
              border: '1px solid #E0E0E0',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security sx={{ color: '#795548', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#8D6E63', fontWeight: 500 }}>
                    Password
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#9E9E9E' }}>
                    ••••••••••
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                size="small"
                onClick={() => setOpenPasswordDialog(true)}
                sx={{
                  bgcolor: '#795548',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#5D4037'
                  },
                  fontWeight: 500
                }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Name Dialog */}
      <Dialog 
        open={openNameDialog} 
        onClose={() => setOpenNameDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#EFEBE9', color: '#4E342E', fontWeight: 600 }}>
          Edit Your Name
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <BadgeIcon sx={{ mr: 1, color: '#795548' }} />,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenNameDialog(false)}
            sx={{ color: '#9E9E9E' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveName} 
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#795548',
              '&:hover': { bgcolor: '#5D4037' },
              px: 3
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Number Dialog */}
      <Dialog 
        open={openPhoneDialog} 
        onClose={() => setOpenPhoneDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#EFEBE9', color: '#4E342E', fontWeight: 600 }}>
          {userData.phone === 'Not provided' ? 'Add Phone Number' : 'Edit Phone Number'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: '#795548' }} />,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenPhoneDialog(false)}
            sx={{ color: '#9E9E9E' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSavePhone} 
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#795548',
              '&:hover': { bgcolor: '#5D4037' },
              px: 3
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#EFEBE9', 
          color: '#4E342E', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Security />
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Please enter your current password and choose a new secure password.
          </Typography>
          
          <form onSubmit={handleChangePassword}>
            <TextField
              margin="dense"
              name="currentPassword"
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              fullWidth
              value={passwordForm.currentPassword}
              onChange={handlePasswordFormChange}
              required
              variant="outlined"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="dense"
              name="newPassword"
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              fullWidth
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              required
              variant="outlined"
              sx={{ mb: 2 }}
              helperText="Password must be at least 8 characters long"
              InputProps={{
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
            
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange}
              required
              variant="outlined"
              InputProps={{
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
            
            {passwordError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {passwordError}
              </Alert>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpenPasswordDialog(false);
              setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setPasswordError('');
            }}
            sx={{ color: '#9E9E9E' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            sx={{
              bgcolor: '#795548',
              '&:hover': { bgcolor: '#5D4037' },
              px: 3
            }}
          >
            {passwordLoading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Missing Phone Notification */}
      <Snackbar
        open={notification}
        autoHideDuration={10000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ 
            width: '100%',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setOpenPhoneDialog(true);
                setNotification(false);
              }}
              sx={{ fontWeight: 'bold' }}
            >
              Add Now
            </Button>
          }
        >
          Please add your phone number to complete your profile
        </Alert>
      </Snackbar>

      {/* Success Notification */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={4000}
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{ 
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onClose={handleCloseSuccessAlert}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;