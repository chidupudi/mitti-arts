import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationSnackbar = ({ snackbar, onClose }) => {
  return (
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity={snackbar.severity} 
        elevation={6} 
        variant="filled"
        sx={{ borderRadius: 2 }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;