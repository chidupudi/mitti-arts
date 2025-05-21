import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  Timestamp, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import axios from 'axios';

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Fade,
  useMediaQuery,
  useTheme,
  styled
} from '@mui/material';

// MUI Icons
import {
  CheckCircle,
  Error,
  AccessTime,
  ShoppingBag,
  Home,
  Payment,
  LocalShipping
} from '@mui/icons-material';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  background: '#FFFFFF'
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  margin: theme.spacing(2, 0),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 60,
    height: 3,
    backgroundColor: theme.palette.primary.main,
  }
}));

const StatusIconContainer = styled(Box)(({ theme, status }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: status === 'SUCCESS' 
    ? theme.palette.success.light 
    : status === 'FAILED' 
      ? theme.palette.error.light 
      : theme.palette.warning.light,
}));

const PaymentStatusPage = () => {
  // Theme setup
  const theme = useTheme();
  theme.palette.primary = {
    ...theme.palette.primary,
    main: '#E07A5F', // Terracotta primary color (match your CheckoutFlow)
    light: '#F2D0C2',
    dark: '#C85A3D',
    contrastText: '#FFFFFF'
  };
  
  theme.palette.secondary = {
    ...theme.palette.secondary,
    main: '#3D405B', // Dark blue secondary color
    light: '#6C6F94',
    dark: '#2A2C3F',
    contrastText: '#FFFFFF'
  };
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Navigation and location hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({
    amount: 0,
    transactionId: '',
    orderId: '',
    timestamp: null
  });
  
  // Extract order ID from URL or localStorage
  useEffect(() => {
    const getOrderId = () => {
      // First try from URL params
      if (orderId) return orderId;
      
      // Next try from query string
      const urlParams = new URLSearchParams(location.search);
      const orderIdFromQuery = urlParams.get('orderId') || urlParams.get('merchantOrderId');
      if (orderIdFromQuery) return orderIdFromQuery;
      
      // Finally try from localStorage
      return localStorage.getItem('pendingOrderNumber');
    };
    
    const currentOrderId = getOrderId();
    
    if (currentOrderId) {
      // First check payment status from URL params
      const urlParams = new URLSearchParams(location.search);
      const statusFromUrl = urlParams.get('status');
      
      if (statusFromUrl) {
        handlePaymentStatusFromUrl(statusFromUrl, currentOrderId);
      } else {
        fetchPaymentStatus(currentOrderId);
      }
    } else {
      setLoading(false);
      setErrorMessage('Order ID not found');
    }
  }, [location, orderId]);
  
  // Handle payment status from URL params (redirect from payment gateway)
  const handlePaymentStatusFromUrl = async (status, orderId) => {
    try {
      const statusNormalized = status.toUpperCase();
      setPaymentStatus(statusNormalized);
      
      // Get the orderId from localStorage
      const firebaseOrderId = localStorage.getItem('pendingOrderId');
      
      if (firebaseOrderId) {
        // Update Firebase order status
        await updateDoc(doc(db, 'orders', firebaseOrderId), {
          status: statusNormalized === 'SUCCESS' ? 'CONFIRMED' : 
                  statusNormalized === 'FAILED' ? 'CANCELLED' : 'PENDING',
          paymentStatus: statusNormalized,
          updatedAt: Timestamp.now()
        });
        
        // Fetch order details from Firebase
        const orderDoc = await getDoc(doc(db, 'orders', firebaseOrderId));
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrderDetails(data);
          
          // Set payment info
          setPaymentInfo({
            amount: data.orderDetails?.totalAmount || 0,
            transactionId: orderId,
            orderId: data.orderNumber,
            timestamp: data.updatedAt
          });
        }
      } else {
        // If no Firebase orderId, just set basic info
        setPaymentInfo({
          orderId,
          transactionId: orderId,
          timestamp: new Date()
        });
      }
      
      // Clean up localStorage
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingOrderNumber');
      
      setLoading(false);
    } catch (error) {
      console.error('Error handling payment status:', error);
      setErrorMessage('Error updating order status');
      setLoading(false);
    }
  };
  
  // Fetch payment status from the API for cases when not redirected with status
  const fetchPaymentStatus = async (orderId) => {
    try {
      // Call the payment status API
      const response = await axios.get(`/api/payment-status/${orderId}`);
      
      if (response.data.success) {
        const { status, amount, transactionId, orderId: responseOrderId } = response.data.data;
        setPaymentStatus(status);
        
        setPaymentInfo({
          amount,
          transactionId,
          orderId: responseOrderId,
          timestamp: new Date()
        });
        
        // Fetch order details from Firebase
        fetchOrderFromFirebase(orderId, status);
      } else {
        setErrorMessage(response.data.message || 'Error checking payment status');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setErrorMessage('Error checking payment status');
      setLoading(false);
    }
  };
  
  // Fetch order details from Firebase
  const fetchOrderFromFirebase = async (orderId, status) => {
    try {
      // Query orders collection for the order number
      const ordersQuery = await getDocs(
        query(collection(db, 'orders'), where('orderNumber', '==', orderId))
      );
      
      if (!ordersQuery.empty) {
        const orderDoc = ordersQuery.docs[0];
        const orderData = orderDoc.data();
        
        // Update order status in Firebase
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          status: status === 'SUCCESS' ? 'CONFIRMED' : 
                 status === 'FAILED' ? 'CANCELLED' : 'PENDING',
          paymentStatus: status,
          updatedAt: Timestamp.now()
        });
        
        setOrderDetails(orderData);
      }
    } catch (error) {
      console.error('Error fetching order from Firebase:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format amount
  const formatAmount = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${Number(amount).toFixed(2)}`;
  };
  
  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp instanceof Timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp);
      
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} color="primary" />
        <Typography variant="h6" color="text.secondary">
          Verifying Payment Status...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Fade in={true}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper sx={{ textAlign: 'center', py: 4 }}>
          {/* Status Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <StatusIconContainer status={paymentStatus}>
              {paymentStatus === 'SUCCESS' ? (
                <CheckCircle sx={{ fontSize: 40, color: 'success.dark' }} />
              ) : paymentStatus === 'FAILED' ? (
                <Error sx={{ fontSize: 40, color: 'error.dark' }} />
              ) : (
                <AccessTime sx={{ fontSize: 40, color: 'warning.dark' }} />
              )}
            </StatusIconContainer>
          </Box>
          
          {/* Status Title */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {paymentStatus === 'SUCCESS' ? 'Payment Successful!' : 
             paymentStatus === 'FAILED' ? 'Payment Failed' : 
             'Payment Processing'}
          </Typography>
          
          {/* Status Message */}
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            {paymentStatus === 'SUCCESS' ? 
              'Your payment has been successfully processed. Your order is confirmed!' : 
             paymentStatus === 'FAILED' ? 
              'There was an issue processing your payment. Please try again or choose a different payment method.' : 
              'Your payment is being processed. This may take a moment...'}
          </Typography>
          
          {/* Error Message if any */}
          {errorMessage && (
            <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          {/* Payment Information */}
          <Card variant="outlined" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Order ID</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {paymentInfo.orderId || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatAmount(paymentInfo.amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(paymentInfo.timestamp)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={paymentStatus} 
                    color={
                      paymentStatus === 'SUCCESS' ? 'success' : 
                      paymentStatus === 'FAILED' ? 'error' : 'warning'
                    }
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            {paymentStatus === 'SUCCESS' && (
              <Button
                variant="contained"
                startIcon={<ShoppingBag />}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  py: 1.2,
                  px: 3,
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                onClick={() => navigate('/orders')}
              >
                View Orders
              </Button>
            )}
            
            {paymentStatus === 'FAILED' && (
              <Button
                variant="contained"
                startIcon={<Payment />}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  py: 1.2,
                  px: 3,
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                onClick={() => navigate('/checkout')}
              >
                Try Again
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Home />}
              sx={{
                color: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.dark,
                },
                py: 1.2,
                px: 3,
                minWidth: isMobile ? '100%' : 'auto'
              }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Box>
          
          {/* Shipping Info for successful payments */}
          {paymentStatus === 'SUCCESS' && (
            <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
              <LocalShipping sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="body1">
                Your order will be processed and shipped soon.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                You will receive an email with delivery details.
              </Typography>
            </Box>
          )}
        </StyledPaper>
        
        {/* Order Details Card (shown only when we have order details) */}
        {orderDetails && orderDetails.orderDetails && (
          <StyledPaper sx={{ mt: 3 }}>
            <SectionHeading>Order Summary</SectionHeading>
            
            {/* Item List */}
            {orderDetails.orderDetails.items && orderDetails.orderDetails.items.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {orderDetails.orderDetails.items.map((item, idx) => (
                  <Box 
                    key={item.id || idx}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: idx < orderDetails.orderDetails.items.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="img"
                        src={item.image || 'https://via.placeholder.com/40'}
                        alt={item.name}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          mr: 2,
                          objectFit: 'cover'
                        }}
                      />
                      <Box>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {formatAmount(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Price Summary */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Delivery Address</Typography>
                    <Typography variant="body2">
                      {orderDetails.orderDetails.personalInfo?.fullName}<br />
                      {orderDetails.orderDetails.deliveryAddress?.addressLine1}<br />
                      {orderDetails.orderDetails.deliveryAddress?.addressLine2 && 
                        `${orderDetails.orderDetails.deliveryAddress.addressLine2}<br />`}
                      {orderDetails.orderDetails.deliveryAddress?.city}, {' '}
                      {orderDetails.orderDetails.deliveryAddress?.state} {' '}
                      {orderDetails.orderDetails.deliveryAddress?.pincode}<br />
                      Phone: {orderDetails.orderDetails.personalInfo?.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Price Details</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2">
                        {formatAmount(orderDetails.orderDetails.cartData?.subtotal)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Shipping</Typography>
                      <Typography variant="body2">
                        {formatAmount(orderDetails.orderDetails.cartData?.shippingCost)}
                      </Typography>
                    </Box>
                    
                    {orderDetails.orderDetails.cartData?.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="success.main">Discount</Typography>
                        <Typography variant="body2" color="success.main">
                          -{formatAmount(orderDetails.orderDetails.cartData.discount)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">Total Amount</Typography>
                      <Typography variant="subtitle2">
                        {formatAmount(orderDetails.orderDetails.cartData?.totalPrice || 
                                    orderDetails.orderDetails.totalAmount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </StyledPaper>
        )}
      </Container>
    </Fade>
  );
};

export default PaymentStatusPage;