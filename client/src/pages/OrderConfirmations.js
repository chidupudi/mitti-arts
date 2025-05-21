import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const OrderConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transaction = JSON.parse(localStorage.getItem('currentTransaction'));
        if (!transaction) {
          setStatus('error');
          return;
        }

        // Get payment status from PhonePe response (in URL params or POST data)
        const urlParams = new URLSearchParams(location.search);
        const paymentStatus = urlParams.get('status') || 'PENDING';

        // Update order status in Firebase
        if (transaction.orderId) {
          await updateDoc(doc(db, 'orders', transaction.orderId), {
            'paymentDetails.status': paymentStatus,
            'paymentDetails.updatedAt': new Date(),
            'paymentDetails.response': urlParams.toString()
          });
        }

        setStatus(paymentStatus === 'SUCCESS' ? 'success' : 'failed');
        localStorage.removeItem('currentTransaction');

      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        {status === 'success' ? (
          <>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography color="text.secondary" paragraph>
              Your order has been confirmed and will be shipped soon.
            </Typography>
          </>
        ) : (
          <>
            <Error color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Payment Failed
            </Typography>
            <Typography color="text.secondary" paragraph>
              There was an issue processing your payment. Please try again.
            </Typography>
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            View Orders
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderConfirmation;