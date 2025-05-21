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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Card,
  CardContent,
  Fade,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  styled
} from '@mui/material';

// MUI Icons
import {
  CheckCircleOutline,
  ErrorOutline,
  AccessTimeOutlined,
  ShoppingBag,
  Receipt,
  Home,
  LocalShipping,
  ArrowBack,
  Payment
} from '@mui/icons-material';

// Custom styled components to match your existing styles
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

const StyledBadge = styled(Chip)(({ theme, status }) => {
  const getColor = () => {
    switch (status) {
      case 'SUCCESS':
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.dark
        };
      case 'FAILED':
        return {
          bg: theme.palette.error.light,
          color: theme.palette.error.dark
        };
      default:
        return {
          bg: theme.palette.warning.light,
          color: theme.palette.warning.dark
        };
    }
  };

  const { bg, color } = getColor();

  return {
    backgroundColor: bg,
    color: color,
    fontWeight: 600,
    fontSize: '0.85rem',
    padding: '4px 0',
  };
});

// Payment Status Component
const PaymentStatus = () => {
  // Theme and responsive setup
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
  const { merchantOrderId } = useParams();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [errorMessage, setErrorMessage] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [transactionId, setTransactionId] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  
  // Get the order ID either from the URL or from URL params
  useEffect(() => {
    const fetchOrderId = () => {
      // Try to get from URL path param
      if (merchantOrderId) {
        return merchantOrderId;
      }
      
      // Try to get from URL search params
      const urlParams = new URLSearchParams(location.search);
      const merchantId = urlParams.get('merchantOrderId') || urlParams.get('orderId');
      
      if (merchantId) {
        return merchantId;
      }
      
      // Fallback to localStorage
      return localStorage.getItem('pendingOrderNumber');
    };
    
    const orderId = fetchOrderId();
    
    if (orderId) {
      fetchPaymentStatus(orderId);
    } else {
      setLoading(false);
      setErrorMessage('Order ID not found. Please check your order history.');
    }
  }, [location, merchantOrderId]);
  
  // Fetch payment status from the API
  const fetchPaymentStatus = async (orderId) => {
    try {
      setLoading(true);
      
      // Call your API to check payment status
      const response = await axios.get(`/api/payment-status/${orderId}`);
      
      if (response.data.success) {
        setPaymentStatus(response.data.data.status);
        setTransactionId(response.data.data.transactionId);
        setFormattedAmount(`₹${response.data.data.amount.toFixed(2)}`);
        
        // Once we have the payment status, fetch the order details from Firebase
        fetchOrderDetails(orderId, response.data.data.status);
      } else {
        setPaymentStatus('FAILED');
        setErrorMessage(response.data.message || 'Error processing payment');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setPaymentStatus('FAILED');
      setErrorMessage('Error checking payment status. Please check your order history.');
      setLoading(false);
    }
  };
  
  // Fetch order details from Firebase
  const fetchOrderDetails = async (orderId, status) => {
    try {
      // Try to get order by merchantOrderId
      const ordersQuery = await getDocs(
        query(collection(db, 'orders'), where('orderNumber', '==', orderId))
      );
      
      if (!ordersQuery.empty) {
        const orderDoc = ordersQuery.docs[0];
        const orderData = orderDoc.data();
        
        // Update order with payment status
        await updateDoc(doc(db, 'orders', orderDoc.id), {
          status: status === 'SUCCESS' ? 'CONFIRMED' : 
                 status === 'FAILED' ? 'CANCELLED' : 'PENDING',
          paymentStatus: status,
          updatedAt: Timestamp.now()
        });
        
        // Store order items
        setOrderItems(orderData.orderDetails?.items || []);
        
        // Store order details
        setOrderDetails({
          id: orderDoc.id,
          orderNumber: orderData.orderNumber,
          ...orderData
        });
      } else {
        setErrorMessage('Order not found in our records.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setErrorMessage('Error loading order details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
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
  
  // Render functions based on payment status
  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case 'SUCCESS':
        return <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main' }} />;
      case 'FAILED':
        return <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />;
      default:
        return <AccessTimeOutlined sx={{ fontSize: 64, color: 'warning.main' }} />;
    }
  };
  
  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case 'SUCCESS':
        return 'Your payment was successful! Your order has been confirmed.';
      case 'FAILED':
        return 'Payment failed. Please try again or choose a different payment method.';
      default:
        return 'Your payment is being processed. Please wait a moment...';
    }
  };

  const renderActionButtons = () => {
    const buttons = [];
    
    // Add different buttons based on status
    if (paymentStatus === 'SUCCESS') {
      buttons.push(
        <Button
          key="view-orders"
          variant="contained"
          startIcon={<ShoppingBag />}
          size={isMobile ? "large" : "medium"}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            py: isMobile ? 1.5 : 1,
            minWidth: 150
          }}
          onClick={() => navigate('/orders')}
        >
          View Orders
        </Button>
      );
    } else if (paymentStatus === 'FAILED') {
      buttons.push(
        <Button
          key="try-again"
          variant="contained"
          startIcon={<Payment />}
          size={isMobile ? "large" : "medium"}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            py: isMobile ? 1.5 : 1,
            minWidth: 150
          }}
          onClick={() => navigate('/checkout')}
        >
          Try Again
        </Button>
      );
    }
    
    // Add home button for all statuses
    buttons.push(
      <Button
        key="home"
        variant="outlined"
        startIcon={<Home />}
        size={isMobile ? "large" : "medium"}
        sx={{
          color: theme.palette.secondary.main,
          borderColor: theme.palette.secondary.main,
          '&:hover': {
            borderColor: theme.palette.secondary.dark,
          },
          py: isMobile ? 1.5 : 1,
          ml: 2,
          minWidth: 150
        }}
        onClick={() => navigate('/')}
      >
        Continue Shopping
      </Button>
    );
    
    return (
      <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: isMobile ? 2 : 0, justifyContent: 'center' }}>
        {buttons}
      </Box>
    );
  };

  // Main render
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
        {/* Payment Status Header */}
        <StyledPaper sx={{ mb: 3, textAlign: 'center', py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2
          }}>
            {renderStatusIcon()}
            
            <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              {paymentStatus === 'SUCCESS' ? 'Payment Successful!' : 
               paymentStatus === 'FAILED' ? 'Payment Failed' : 'Processing Payment'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              {renderStatusMessage()}
            </Typography>
          </Box>
          
          {errorMessage && (
            <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">Order ID</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {merchantOrderId || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formattedAmount || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <StyledBadge 
                    label={paymentStatus} 
                    status={paymentStatus} 
                    variant="filled"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Action Buttons */}
          {renderActionButtons()}
        </StyledPaper>
        
        {/* Order Details if available */}
        {orderDetails && (
          <StyledPaper>
            <SectionHeading>Order Details</SectionHeading>
            
            {orderItems && orderItems.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <List disablePadding>
                  {orderItems.map((item, index) => (
                    <React.Fragment key={item.id || index}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          width: '100%',
                          alignItems: 'center'
                        }}>
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: 1,
                            overflow: 'hidden',
                            mr: 2,
                            backgroundImage: `url(${item.image || 'https://via.placeholder.com/50'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid #eee'
                          }} />
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {item.quantity} x ₹{item.price?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                          
                          <Typography variant="subtitle2">
                            ₹{item.totalItemPrice?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {index < orderItems.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
            
            {orderDetails.orderDetails && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Shipping Address
                      </Typography>
                      
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
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Order Summary
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Subtotal
                        </Typography>
                        <Typography variant="body2">
                          ₹{orderDetails.orderDetails.cartData?.subtotal?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Shipping
                        </Typography>
                        <Typography variant="body2">
                          ₹{orderDetails.orderDetails.cartData?.shippingCost?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                      
                      {orderDetails.orderDetails.cartData?.discount > 0 && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          mb: 1
                        }}>
                          <Typography variant="body2" color="success.main">
                            Discount
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            -₹{orderDetails.orderDetails.cartData.discount.toFixed(2)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1
                      }}>
                        <Typography variant="subtitle2">
                          Total
                        </Typography>
                        <Typography variant="subtitle2">
                          ₹{orderDetails.orderDetails.cartData?.totalPrice?.toFixed(2) || 
                           orderDetails.orderDetails.totalAmount?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mt: 2
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body2">
                          {orderDetails.paymentMethod || 'Online Payment'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mt: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Order Date
                        </Typography>
                        <Typography variant="body2">
                          {orderDetails.createdAt ? formatDate(orderDetails.createdAt) : 'N/A'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </StyledPaper>
        )}
      </Container>
    </Fade>
  );
};

export default PaymentStatus;