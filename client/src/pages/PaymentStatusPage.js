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
  getDocs,
  addDoc 
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  LocalShipping,
  CreditCard,
  Receipt,
  ExpandMore,
  ReceiptLong,
  EventNote,
  CancelOutlined,
  InfoOutlined,
  ArrowBack,
  ShoppingCartOutlined
} from '@mui/icons-material';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  background: '#FFFFFF',
  overflow: 'hidden'
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

const StatusBanner = styled(Box)(({ theme, status }) => {
  const getBackground = () => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`;
      case 'FAILED':
      case 'FAILURE':
        return `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`;
      default:
        return `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`;
    }
  };

  return {
    background: getBackground(),
    color: '#fff',
    padding: theme.spacing(2, 3),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
    marginTop: theme.spacing(-3),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
});

const ErrorDetailCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.dark,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiCardContent-root': {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  }
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const PaymentDetailItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
}));

// Enhanced PaymentStatusPage Component
const PaymentStatusPage = () => {
  // Theme and responsive setup (keep as is)
  const theme = useTheme();
  theme.palette.primary = {
    ...theme.palette.primary,
    main: '#E07A5F', // Terracotta primary color 
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
  const [errorDetails, setErrorDetails] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: 0,
    transactionId: '',
    orderId: '',
    merchantOrderId: '',
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
        try {
          // First fetch payment details from API to get complete transaction info
          const response = await axios.get(`/api/payment-status/${orderId}`);
          
          if (response.data && response.data.data) {
            const paymentData = response.data.data;
            const transactionDetails = paymentData.paymentDetails || [];
            
            // Update Firebase order status with transaction details
            await updateDoc(doc(db, 'orders', firebaseOrderId), {
              status: statusNormalized === 'SUCCESS' || statusNormalized === 'COMPLETED' ? 'CONFIRMED' : 
                      statusNormalized === 'FAILED' || statusNormalized === 'FAILURE' ? 'CANCELLED' : 'PENDING',
              paymentStatus: statusNormalized,
              transactionId: paymentData.transactionId || '',
              paymentDetails: transactionDetails,
              rawTransactionData: paymentData.fullResponse || {},
              updatedAt: Timestamp.now()
            });
            
            // Store detailed transaction information in a separate collection
            if (transactionDetails && transactionDetails.length > 0) {
              try {
                await Promise.all(transactionDetails.map(async (detail) => {
                  await addDoc(collection(db, 'transactions'), {
                    orderId: firebaseOrderId,
                    orderNumber: orderId,
                    userId: auth.currentUser?.uid || '',
                    transactionId: detail.transactionId || '',
                    paymentMode: detail.paymentMode || '',
                    amount: detail.amount || 0,
                    payableAmount: detail.payableAmount || 0,
                    feeAmount: detail.feeAmount || 0,
                    state: detail.state || '',
                    errorCode: detail.errorCode || '',
                    detailedErrorCode: detail.detailedErrorCode || '',
                    timestamp: detail.timestamp ? new Date(detail.timestamp) : Timestamp.now(),
                    createdAt: Timestamp.now()
                  });
                }));
              } catch (err) {
                console.error('Error storing transaction details:', err);
              }
            }
            
            // Set transaction details for UI
            setTransactionDetails(transactionDetails);
            
            if (statusNormalized === 'FAILED' && (paymentData.fullResponse || paymentData.paymentDetails?.[0])) {
              // Extract error details for failed payments
              const errorSource = paymentData.paymentDetails?.[0] || paymentData.fullResponse;
              setErrorDetails({
                errorCode: errorSource.errorCode || '',
                detailedErrorCode: errorSource.detailedErrorCode || '',
                message: response.data.message || 'Payment failed'
              });
            }
            
            // Set payment info from the response
            setPaymentInfo({
              amount: paymentData.amount || 0,
              transactionId: paymentData.transactionId || '',
              orderId: paymentData.orderId || orderId,
              merchantOrderId: paymentData.merchantOrderId || orderId,
              timestamp: paymentData.updatedAt ? new Date(paymentData.updatedAt) : new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
        
        // Fetch order details from Firebase
        const orderDoc = await getDoc(doc(db, 'orders', firebaseOrderId));
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrderDetails(data);
          
          // Update payment info with order data if API data not available
          if (!paymentInfo.amount) {
            setPaymentInfo(prev => ({
              ...prev,
              amount: data.orderDetails?.totalAmount || 0,
              transactionId: data.transactionId || orderId,
              orderId: data.orderNumber,
              merchantOrderId: orderId,
              timestamp: data.updatedAt
            }));
          }
        }
      } else {
        // If no Firebase orderId, just set basic info
        setPaymentInfo({
          orderId,
          merchantOrderId: orderId,
          transactionId: orderId,
          timestamp: new Date()
        });
      }
      
      // Clean up localStorage
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingOrderNumber');
      
      // Now fetch more details from API if needed
      if (!transactionDetails.length) {
        fetchPaymentStatus(orderId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error handling payment status:', error);
      setErrorMessage('Error updating order status');
      setLoading(false);
    }
  };
  
  // Fetch payment status from the API
  const fetchPaymentStatus = async (orderId) => {
    try {
      // Call the payment status API
      const response = await axios.get(`/api/payment-status/${orderId}`);
      
      if (response.data) {
        // Set payment status
        const status = response.data.data.status;
        setPaymentStatus(status);
        
        // Set payment info
        setPaymentInfo({
          ...paymentInfo,
          amount: response.data.data.amount,
          transactionId: response.data.data.transactionId,
          orderId: response.data.data.orderId,
          merchantOrderId: response.data.data.merchantOrderId,
          timestamp: response.data.data.updatedAt || new Date()
        });
        
        // Set transaction details if available
        if (response.data.data.paymentDetails && response.data.data.paymentDetails.length > 0) {
          setTransactionDetails(response.data.data.paymentDetails);
        }
        
        // Set error details if payment failed
        if (status === 'FAILED') {
          // Extract error details from the first payment detail
          const paymentDetail = response.data.data.paymentDetails?.[0] || {};
          setErrorDetails({
            errorCode: paymentDetail.errorCode || response.data.data.fullResponse?.errorCode,
            detailedErrorCode: paymentDetail.detailedErrorCode || response.data.data.fullResponse?.detailedErrorCode,
            message: response.data.message
          });
        }
        
        // Fetch order details from Firebase
        if (!orderDetails) {
          fetchOrderFromFirebase(orderId, status, response.data.data);
        } else {
          setLoading(false);
        }
      } else {
        setErrorMessage(response.data?.message || 'Error checking payment status');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setErrorMessage('Error checking payment status');
      setLoading(false);
    }
  };
  
  // Fetch order details from Firebase
  const fetchOrderFromFirebase = async (orderId, status, paymentData) => {
    try {
      // Query orders collection for the order number
      const ordersQuery = await getDocs(
        query(collection(db, 'orders'), where('orderNumber', '==', orderId))
      );
      
      if (!ordersQuery.empty) {
        const orderDoc = ordersQuery.docs[0];
        const orderData = orderDoc.data();
        
        // Extract transaction details
        const transactionDetails = paymentData?.paymentDetails || [];
        
        // Update order status in Firebase with transaction details
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          status: status === 'SUCCESS' || status === 'COMPLETED' ? 'CONFIRMED' : 
                 status === 'FAILED' || status === 'FAILURE' ? 'CANCELLED' : 'PENDING',
          paymentStatus: status,
          transactionId: paymentData?.transactionId || '',
          paymentDetails: transactionDetails,
          rawTransactionData: paymentData?.fullResponse || {},
          updatedAt: Timestamp.now()
        });
        
        // Store detailed transaction information in a separate collection
        if (transactionDetails && transactionDetails.length > 0) {
          try {
            await Promise.all(transactionDetails.map(async (detail) => {
              await addDoc(collection(db, 'transactions'), {
                orderId: orderDoc.id,
                orderNumber: orderId,
                userId: orderData.userId || auth.currentUser?.uid || '',
                transactionId: detail.transactionId || '',
                paymentMode: detail.paymentMode || '',
                amount: detail.amount || 0,
                payableAmount: detail.payableAmount || 0,
                feeAmount: detail.feeAmount || 0,
                state: detail.state || '',
                errorCode: detail.errorCode || '',
                detailedErrorCode: detail.detailedErrorCode || '',
                timestamp: detail.timestamp ? new Date(detail.timestamp) : Timestamp.now(),
                createdAt: Timestamp.now()
              });
            }));
          } catch (err) {
            console.error('Error storing transaction details:', err);
          }
        }
        
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
    if (!amount && amount !== 0) return '₹0.00';
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

  // Helper function to get a user-friendly error message
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'TXN_CANCELLED': 'Transaction was cancelled by the user.',
      'REQUEST_CANCEL_BY_REQUESTER': 'Payment request was cancelled.',
      'PAYMENT_DECLINED': 'Payment was declined by the bank.',
      'INSUFFICIENT_FUNDS': 'Insufficient funds in your account.',
      'GATEWAY_ERROR': 'There was an issue with the payment gateway.',
      'NETWORK_ERROR': 'Network connectivity issues occurred.',
      'INVALID_PAYMENT_METHOD': 'The selected payment method is invalid.',
      'AUTHORIZATION_FAILED': 'Payment authorization failed.',
      'SESSION_EXPIRED': 'Payment session expired.'
    };
    
    return errorMessages[errorCode] || 'There was an issue with your payment.';
  };
  
  // Get transaction steps
  const getTransactionSteps = () => {
    const steps = [];
    
    // Add order created step
    steps.push({
      label: 'Order Created',
      description: `Order #${paymentInfo.merchantOrderId || paymentInfo.orderId} was created`,
      date: orderDetails?.createdAt ? formatDate(orderDetails.createdAt) : formatDate(paymentInfo.timestamp),
      completed: true
    });
    
    // Add payment initiated step
    steps.push({
      label: 'Payment Initiated',
      description: `Payment of ${formatAmount(paymentInfo.amount)} was initiated`,
      date: transactionDetails[0]?.timestamp ? formatDate(transactionDetails[0].timestamp) : formatDate(paymentInfo.timestamp),
      completed: true
    });
    
    // Add payment status step
    if (paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED') {
      steps.push({
        label: 'Payment Successful',
        description: 'Your payment was processed successfully',
        date: formatDate(paymentInfo.timestamp),
        completed: true
      });
      
      // Add order processing step
      steps.push({
        label: 'Order Processing',
        description: 'Your order is being processed',
        completed: true
      });
      
      // Add shipping step
      steps.push({
        label: 'Order Shipping',
        description: 'Your order will be shipped soon',
        completed: false
      });
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'FAILURE') {
      steps.push({
        label: 'Payment Failed',
        description: errorDetails?.message || 'Your payment could not be processed',
        date: formatDate(paymentInfo.timestamp),
        completed: true,
        error: true
      });
    } else {
      steps.push({
        label: 'Payment Pending',
        description: 'Your payment is being processed',
        date: formatDate(paymentInfo.timestamp),
        completed: false
      });
    }
    
    return steps;
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
  
  // The complete render method remains the same as you provided
  return (
    <Fade in={true}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <StyledPaper>
          {/* Status Banner */}
          <StatusBanner status={paymentStatus}>
            {paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED' ? (
              <CheckCircle sx={{ fontSize: 28 }} />
            ) : paymentStatus === 'FAILED' || paymentStatus === 'FAILURE' ? (
              <Error sx={{ fontSize: 28 }} />
            ) : (
              <AccessTime sx={{ fontSize: 28 }} />
            )}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED' ? 'Payment Successful' : 
                paymentStatus === 'FAILED' || paymentStatus === 'FAILURE' ? 'Payment Failed' : 
                'Payment Processing'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Order #{paymentInfo.merchantOrderId || paymentInfo.orderId || 'Unknown'}
              </Typography>
            </Box>
          </StatusBanner>
          
          {/* Error Details for Failed Payments */}
          {(paymentStatus === 'FAILED' || paymentStatus === 'FAILURE') && errorDetails && (
            <ErrorDetailCard variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CancelOutlined sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {errorDetails.errorCode || 'Payment Error'}
                    </Typography>
                    <Typography variant="body2">
                      {getErrorMessage(errorDetails.detailedErrorCode) || errorDetails.message}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </ErrorDetailCard>
          )}
          
          {/* Payment Information Card */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Payment Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {paymentInfo.transactionId || 'N/A'}
                    </Typography>
                  </InfoItem>
                  
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatAmount(paymentInfo.amount)}
                    </Typography>
                  </InfoItem>
                  
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(paymentInfo.timestamp)}
                    </Typography>
                  </InfoItem>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {paymentInfo.merchantOrderId || paymentInfo.orderId || 'N/A'}
                    </Typography>
                  </InfoItem>
                  
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={paymentStatus} 
                      size="small"
                      color={
                        paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED' ? 'success' : 
                        paymentStatus === 'FAILED' || paymentStatus === 'FAILURE' ? 'error' : 'warning'
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </InfoItem>
                  
                  <InfoItem>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {transactionDetails[0]?.paymentMode || 'Online Payment'}
                    </Typography>
                  </InfoItem>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Keep the rest of the render method as is */}
          {/* Transaction Timeline */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Order Timeline
            </Typography>
            
            <Stepper orientation="vertical" sx={{ ml: -1 }}>
              {getTransactionSteps().map((step, index) => (
                <Step key={index} active={true} completed={step.completed}>
                  <StepLabel
                    StepIconProps={{
                      sx: step.error ? { color: theme.palette.error.main } : {}
                    }}
                  >
                    <Typography variant="subtitle2">{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    {step.date && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {step.date}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {/* Technical Details Accordion (for detailed payment info) */}
          {transactionDetails.length > 0 && (
            <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" fontWeight={500}>
                  Transaction Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List disablePadding>
                  {transactionDetails.map((detail, index) => (
                    <PaymentDetailItem key={index} alignItems="flex-start" disablePadding sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ReceiptLong color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" fontWeight={500}>
                              Transaction {index + 1}
                            </Typography>
                            <Chip
                              label={detail.state}
                              size="small"
                              color={
                                detail.state === 'SUCCESS' || detail.state === 'COMPLETED' ? 'success' :
                                detail.state === 'FAILED' || detail.state === 'FAILURE' ? 'error' : 'warning'
                              }
                              sx={{ fontWeight: 500, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Transaction ID
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                  {detail.transactionId}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Payment Mode
                                </Typography>
                                <Typography variant="body2">
                                  {detail.paymentMode}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Amount
                                </Typography>
                                <Typography variant="body2">
                                  {formatAmount(detail.amount / 100)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Timestamp
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(detail.timestamp)}
                                </Typography>
                              </Grid>
                              {detail.errorCode && (
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="error" display="block">
                                    Error: {detail.errorCode} - {detail.detailedErrorCode}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        }
                      />
                    </PaymentDetailItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                color: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.dark,
                }
              }}
            >
              Back to Home
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED' ? (
                <Button
                  variant="contained"
                  startIcon={<ShoppingBag />}
                  onClick={() => navigate('/orders')}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  View Orders
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartOutlined />}
                  onClick={() => navigate('/checkout')}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                >
                  Try Again
                </Button>
              )}
            </Box>
          </Box>
        </StyledPaper>
        
        {/* Order Details - Only show for successful payments */}
        {orderDetails && orderDetails.orderDetails && (paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED') && (
          <StyledPaper sx={{ mt: 3 }}>
            {/* Keep the order details section as is */}
            <SectionHeading>Order Details</SectionHeading>
            
            {/* Display order items if available */}
            {orderDetails.orderDetails.items && orderDetails.orderDetails.items.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <List disablePadding>
                  {orderDetails.orderDetails.items.map((item, index) => (
                    <ListItem 
                      key={item.id || index}
                      sx={{ py: 1, px: 0, borderBottom: index < orderDetails.orderDetails.items.length - 1 ? '1px solid #eee' : 'none' }}
                      disablePadding
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        width: '100%',
                        alignItems: 'center' 
                      }}>
                        <Box 
                          component="img"
                          src={item.image || 'https://via.placeholder.com/40'}
                          alt={item.name}
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            mr: 2,
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={500}>
                          {formatAmount(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Shipping & Payment Summary */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <LocalShipping sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="subtitle2">Shipping Address</Typography>
                    </Box>
                    
                    <Typography variant="body2">
                      {orderDetails.orderDetails.personalInfo?.fullName}<br />
                      {orderDetails.orderDetails.deliveryAddress?.addressLine1}<br />
                      {orderDetails.orderDetails.deliveryAddress?.addressLine2 && 
                        `${orderDetails.orderDetails.deliveryAddress.addressLine2}<br />`}
                      {orderDetails.orderDetails.deliveryAddress?.landmark && 
                        `Landmark: ${orderDetails.orderDetails.deliveryAddress.landmark}<br />`}
                      {orderDetails.orderDetails.deliveryAddress?.city}, {' '}
                      {orderDetails.orderDetails.deliveryAddress?.state} {' '}
                      {orderDetails.orderDetails.deliveryAddress?.pincode}<br />
                      Phone: {orderDetails.orderDetails.personalInfo?.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Receipt sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="subtitle2">Order Summary</Typography>
                    </Box>
                    
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body2">
                        {orderDetails.paymentMethod || 'Online Payment'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">Order Date</Typography>
                      <Typography variant="body2">
                        {orderDetails.createdAt ? formatDate(orderDetails.createdAt) : 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </StyledPaper>
        )}
        
        {/* Help Section */}
        <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoOutlined sx={{ mt: 0.5, color: theme.palette.info.main }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Need Assistance?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {paymentStatus === 'FAILED' || paymentStatus === 'FAILURE'
                    ? 'If you faced issues with the payment, please try again or use a different payment method. You can also contact our support team for help.'
                    : paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED'
                    ? 'If you have any questions about your order, our customer support team is here to help.'
                    : 'If your payment status is still pending, please wait a while and refresh this page. Feel free to contact our support if the issue persists.'
                  }
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  sx={{ mt: 1, color: theme.palette.primary.main }}
                  onClick={() => navigate('/contact-us')}
                >
                  Contact Support
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
};

export default PaymentStatusPage;