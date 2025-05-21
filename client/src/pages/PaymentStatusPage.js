import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// MUI components
import { Box, Typography, Paper, Alert, CircularProgress, Chip, Button } from '@mui/material';
import { CheckCircle, Error, Help, ArrowBack, Receipt } from '@mui/icons-material';

// Secret key for checksum operations
const SECRET_KEY = 'your-very-strong-secret-key-min-32-chars';

// Utility function to generate checksums - same as in CheckoutFlow
const generateChecksum = (data) => {
  const sortedData = sortObjectKeys(data);
  const dataString = JSON.stringify(sortedData);
  return CryptoJS.HmacSHA256(dataString, SECRET_KEY).toString();
};

// Verify checksum - same as in CheckoutFlow
const verifyChecksum = (data, providedChecksum) => {
  const { checksum, securityHash, ...dataWithoutChecksum } = data;
  const calculatedChecksum = generateChecksum(dataWithoutChecksum);
  return calculatedChecksum === (providedChecksum || securityHash);
};

// Sort object keys - same as in CheckoutFlow
const sortObjectKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
};

const PaymentStatusPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [error, setError] = useState('');
  const [securityVerified, setSecurityVerified] = useState(false);

  useEffect(() => {
    const verifyAndFetchStatus = async () => {
      try {
        setLoading(true);
        
        // Get status from URL params
        const urlParams = new URLSearchParams(location.search);
        const status = urlParams.get('status');
        
        // Get verification data from navigation state
        const verificationData = location.state?.verificationData;
        const verificationHash = location.state?.verificationHash;
        
        // Check if we have verification data
        if (verificationData && verificationHash) {
          // Verify the data hasn't been tampered with
          const isVerified = generateChecksum(verificationData) === verificationHash;
          
          if (!isVerified) {
            setError('Security verification failed. The payment data may have been tampered with.');
            setLoading(false);
            return;
          }
          
          setSecurityVerified(true);
        }
        
        // Find the order in Firebase
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderNumber', '==', orderNumber));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Order not found');
          setLoading(false);
          return;
        }
        
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        setOrder(orderData);
        
        // Now call the payment status API with security verification
        const securityVerificationData = {
          orderNumber,
          returnedStatus: status,
          timestamp: Date.now()
        };
        
        // Generate checksum for verification
        const checksum = generateChecksum(securityVerificationData);
        
        // Call payment status API
        const response = await axios.post(`/api/payment-status/${orderNumber}`, {
          merchantOrderId: orderNumber,
          verificationData: securityVerificationData,
          checksum
        });
        
        // Verify response checksum
        if (response.data && response.data.checksum) {
          const isValid = verifyChecksum(response.data, response.data.checksum);
          
          if (!isValid) {
            setError('Security warning: Payment status response may have been tampered with');
            setLoading(false);
            return;
          }
        }
        
        // Update order status in Firebase based on payment status
        const paymentData = response.data;
        setPaymentStatus(paymentData.data.status);
        
        // Create transaction record with verification data
        await addDoc(collection(db, 'transactions'), {
          orderId: orderDoc.id,
          orderNumber,
          userId: auth.currentUser.uid,
          transactionId: paymentData.data.transactionId || '',
          gatewayOrderId: paymentData.data.orderId || '',
          amount: paymentData.data.amount || orderData.orderDetails.totalAmount,
          status: paymentData.data.status,
          rawStatus: paymentData.data.rawStatus,
          paymentDetails: paymentData.data.paymentDetails || [],
          responseChecksum: paymentData.checksum,
          verificationChecksum: checksum,
          securityVerified,
          timestamp: Timestamp.now(),
          createdAt: Timestamp.now()
        });
        
        // Update order status
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          status: paymentData.data.status === 'SUCCESS' ? 'CONFIRMED' : 'PAYMENT_FAILED',
          paymentStatus: paymentData.data.status,
          transactionId: paymentData.data.transactionId || '',
          paymentDetails: paymentData.data.paymentDetails || [],
          rawTransactionData: paymentData.data,
          updatedAt: Timestamp.now()
        });
        
        // Clear localStorage data
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingOrderNumber');
        localStorage.removeItem('paymentVerificationData');
        localStorage.removeItem('paymentVerificationHash');
        
        setLoading(false);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment status. Please contact customer support.');
        setLoading(false);
      }
    };

    if (orderNumber) {
      verifyAndFetchStatus();
    }
  }, [orderNumber, location]);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, py: 5 }}>
      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Verifying Payment Status...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we securely verify your payment
          </Typography>
        </Paper>
      ) : error ? (
        <Paper sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            View My Orders
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 4 }}>
          {securityVerified && (
            <Chip 
              label="Secure Transaction Verified" 
              color="success" 
              size="small" 
              sx={{ mb: 2 }} 
            />
          )}
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {paymentStatus === 'SUCCESS' ? (
              <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            ) : paymentStatus === 'FAILED' ? (
              <Error color="error" sx={{ fontSize: 64, mb: 2 }} />
            ) : (
              <Help color="warning" sx={{ fontSize: 64, mb: 2 }} />
            )}
            
            <Typography variant="h5" gutterBottom>
              {paymentStatus === 'SUCCESS' 
                ? 'Payment Successful!' 
                : paymentStatus === 'FAILED'
                ? 'Payment Failed'
                : 'Payment Status: ' + paymentStatus}
            </Typography>
            
            <Typography variant="body1" paragraph>
              Order #{orderNumber}
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 3 }}>
              Amount: ₹{order?.orderDetails?.totalAmount.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={() => navigate(`/orders/${orderNumber}`)}
              color={paymentStatus === 'SUCCESS' ? 'primary' : 'secondary'}
            >
              {paymentStatus === 'SUCCESS' ? 'View Order Details' : 'Try Payment Again'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PaymentStatusPage;