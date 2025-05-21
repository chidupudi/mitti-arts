import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import axios from 'axios';

const PaymentStatus = () => {
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Please wait while we confirm your payment');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        // For GET redirects
        const params = new URLSearchParams(location.search);
        const transactionId = params.get('transactionId');
        
        // For POST callbacks (check location.state)
        const callbackData = location.state?.paymentData || {};
        
        if (transactionId || callbackData.transactionId) {
          const txnId = transactionId || callbackData.transactionId;
          setTransactionId(txnId);
          
          // Verify payment status with backend
          const response = await axios.post('/api/payment/status', {
            transactionId: txnId
          });

          if (response.data.code === 'PAYMENT_SUCCESS') {
            setStatus('success');
            setMessage('Payment successful! Thank you for your purchase.');
          } else {
            setStatus('failed');
            setMessage(response.data.message || 'Payment failed. Please try again.');
          }
        } else {
          setStatus('failed');
          setMessage('Invalid payment response. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Error verifying payment. Please check your order history or contact support.');
      }
    };

    handlePaymentResult();
  }, [location]);

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      {status === 'processing' ? (
        <>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 2 }}>Processing Payment...</Typography>
        </>
      ) : status === 'success' ? (
        <>
          <Typography variant="h4" color="success.main" sx={{ mb: 2 }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1">{message}</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Transaction ID: {transactionId}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h4" color="error.main" sx={{ mb: 2 }}>
            Payment Failed
          </Typography>
          <Typography variant="body1">{message}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => window.location.href = '/checkout'}
          >
            Try Again
          </Button>
        </>
      )}
    </Box>
  );
};

export default PaymentStatus;