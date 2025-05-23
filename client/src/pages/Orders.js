import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Container,
  Paper,
  CircularProgress,
  Chip,
  useMediaQuery,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  ShoppingBagOutlined,
  ArrowForward,
  LocalShippingOutlined,
  ReceiptOutlined,
  InventoryOutlined,
  CheckCircleOutlined,
  InfoOutlined,
  OpenInNewOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  CreditCardOutlined,
  ScheduleOutlined
} from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

// Custom theme with terracotta colors
const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#E07A5F', // Terracotta
      light: '#F2CC8F', // Light terracotta/sand
      dark: '#BE5A38', // Dark terracotta
    },
    secondary: {
      main: '#81B29A', // Sage green accent
    },
    background: {
      default: '#FFF9F5', // Very light coconut
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3D405B', // Dark blue-grey
      secondary: '#797B8E', // Medium blue-grey
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
  },
});

// OrderItem component (memoized)
const OrderItem = memo(({ item }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 1.5,
      p: 1.5,
      borderRadius: 2,
      backgroundColor: 'rgba(0,0,0,0.02)',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.04)'
      }
    }}
  >
    <Avatar
      src={item.image || ''}
      alt={item.name}
      variant="rounded"
      sx={{ 
        width: 56, 
        height: 56, 
        mr: 2,
        backgroundColor: 'grey.200'
      }}
    >
      {item.name?.[0]}
    </Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography fontWeight="bold">{item.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
      </Typography>
    </Box>
    <Typography fontWeight="bold">
      ₹{(item.price * item.quantity).toFixed(2)}
    </Typography>
  </Box>
));

// EmptyOrders component (memoized)
const EmptyOrders = memo(({ navigate }) => (
  <Box sx={{ 
    py: 8, 
    textAlign: 'center',
    backgroundColor: 'background.default',
    borderRadius: 2
  }}>
    <ShoppingBagOutlined sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="textSecondary" gutterBottom>
      You haven't placed any orders yet
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
      Start shopping to discover our products and see your orders here
    </Typography>
    <Button 
      variant="contained" 
      color="primary"
      size="large"
      onClick={() => navigate('/products')}
    >
      Shop Now
    </Button>
  </Box>
));

// Main Orders component
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Courier tracking URLs mapping
  const courierTrackingUrls = {
    'Delhivery': 'https://www.delhivery.com/track/package/',
    'DTDC': 'https://www.dtdc.in/tracking.asp',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'BlueDart': 'https://www.bluedart.com/tracking',
    'Amazon': 'https://www.amazon.in/trackpkg/',
    'XpressBees': 'https://track.xpressbees.com/',
    'Ecom Express': 'https://ecomexpress.in/tracking/',
    'Ekart': 'https://ekartlogistics.com/track/'
  };

  // Auth state management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      await fetchOrders(currentUser.uid);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [navigate]);

  // Fetch orders
  const fetchOrders = useCallback(async (uid) => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const ordersData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || Date.now());
        
        // Create a somewhat random but reasonable delivery date
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 2) + 3);
        
        // Add mock order status based on dates
        const today = new Date();
        let status = 'Ordered';
        if (today > deliveryDate) {
          status = 'Delivered';
        } else if (today > orderDate && (today - orderDate) / (1000 * 60 * 60 * 24) > 1) {
          status = 'Shipped';
        } else if (today > orderDate) {
          status = 'Processing';
        }
        
        ordersData.push({
          id: doc.id,
          ...data,
          orderDate,
          deliveryDate,
          status,
          paymentStatus: data.paymentStatus || 'INITIATED',
          deliveryDetails: data.deliveryDetails || {
            company: 'Not assigned yet',
            consignmentNumber: 'Not generated yet',
            tentativeDate: deliveryDate,
            remarks: 'Order is being processed'
          }
        });
      });

      // Sort by date, newest first
      ordersData.sort((a, b) => b.orderDate - a.orderDate);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  // Toggle order details
  const toggleOrderDetails = useCallback((orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  }, [expandedOrder]);

  // Track package handler
  const handleTrackPackage = useCallback((deliveryDetails) => {
    if (!deliveryDetails?.company || !deliveryDetails?.consignmentNumber) {
      alert('Tracking information not available yet');
      return;
    }

    const courierName = deliveryDetails.company.toLowerCase();
    let trackingUrl = '';

    // Find the matching courier URL
    for (const [key, url] of Object.entries(courierTrackingUrls)) {
      if (courierName.includes(key.toLowerCase())) {
        trackingUrl = url + deliveryDetails.consignmentNumber;
        break;
      }
    }

    if (!trackingUrl) {
      // If no specific courier found, try to open a generic tracking site
      trackingUrl = `https://www.google.com/search?q=track+${deliveryDetails.consignmentNumber}+${deliveryDetails.company}`;
    }

    window.open(trackingUrl, '_blank');
  }, [courierTrackingUrls]);

  // Format date
  const formatDate = useCallback((date) => {
    if (!date) return 'Not available';
    if (typeof date === 'string') return date;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Get payment status chip color
  const getPaymentStatusColor = useCallback((status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'INITIATED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Get status active step
  const getActiveStep = useCallback((status) => {
    switch (status) {
      case 'Delivered':
        return 3;
      case 'Shipped':
        return 2;
      case 'Processing':
        return 1;
      default:
        return 0;
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={terracottaTheme}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh'
        }}>
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: 2,
          mb: 4
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: { xs: 'center', sm: 'space-between' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: { xs: 2, sm: 0 }
            }}>
              <ShoppingBagOutlined sx={{ 
                mr: 1.5, 
                color: 'primary.main',
                fontSize: 28
              }} />
              <Typography variant="h4" component="h1">
                My Orders
              </Typography>
              <Chip 
                label={orders.length} 
                color="primary"
                size="small"
                sx={{ ml: 1.5 }}
              />
            </Box>

            <Button 
              variant="outlined" 
              color="primary"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {orders.length === 0 ? (
            <EmptyOrders navigate={navigate} />
          ) : (
            <Stack spacing={3}>
              {orders.map((order) => {
                // Get active step based on order status
                const activeStep = getActiveStep(order.status);
                
                return (
                <Card 
                  key={order.id} 
                  sx={{ 
                    boxShadow: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Order header */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="bold">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </Typography>
                          <Chip
                            label={order.status}
                            color={
                              order.status === 'Delivered' ? 'success' : 
                              order.status === 'Shipped' ? 'info' : 
                              order.status === 'Processing' ? 'warning' : 
                              'default'
                            }
                            size="small"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Placed on {formatDate(order.orderDate)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={`₹${order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}`}
                          color="primary"
                          size="medium"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <IconButton 
                          onClick={() => toggleOrderDetails(order.id)}
                          sx={{ ml: 1 }}
                          aria-label={expandedOrder === order.id ? "Collapse order details" : "Expand order details"}
                        >
                          {expandedOrder === order.id ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Order items (compact summary) */}
                    <Box sx={{ 
                      mb: 2, 
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: 'rgba(0,0,0,0.02)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1 
                      }}>
                        <Typography variant="body2" fontWeight="bold">Items</Typography>
                        <Typography variant="body2" fontWeight="bold">Price</Typography>
                      </Box>
                      
                      {(order.orderDetails?.items || []).slice(0, 2).map((item, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            py: 0.5
                          }}
                        >
                          <Typography variant="body2" noWrap sx={{ maxWidth: { xs: '200px', sm: '300px' } }}>
                            {item.quantity}× {item.name}
                          </Typography>
                          <Typography variant="body2">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                      
                      {(order.orderDetails?.items || []).length > 2 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          +{(order.orderDetails?.items.length - 2)} more items
                        </Typography>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between'
                      }}>
                        <Typography variant="body1" fontWeight="bold">Total:</Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Order status timeline */}
                    <Box sx={{ mt: 2, mb: expandedOrder === order.id ? 2 : 0 }}>
                      <Stepper 
                        activeStep={activeStep} 
                        alternativeLabel={!isMobile}
                        orientation={isMobile ? "vertical" : "horizontal"}
                        sx={{ 
                          '& .MuiStepConnector-line': {
                            borderColor: 'rgba(224, 122, 95, 0.3)'
                          },
                          '& .MuiStepIcon-text': {
                            fill: '#fff'
                          },
                          '& .MuiStepIcon-root.Mui-active': {
                            color: 'primary.main'
                          },
                          '& .MuiStepIcon-root.Mui-completed': {
                            color: 'success.main'
                          }
                        }}
                      >
                        <Step completed={activeStep >= 0}>
                          <StepLabel>Ordered</StepLabel>
                        </Step>
                        <Step completed={activeStep >= 1}>
                          <StepLabel>Processing</StepLabel>
                        </Step>
                        <Step completed={activeStep >= 2}>
                          <StepLabel>Shipped</StepLabel>
                        </Step>
                        <Step completed={activeStep >= 3}>
                          <StepLabel>Delivered</StepLabel>
                        </Step>
                      </Stepper>
                    </Box>
                    
                    {/* Order details (collapsible) */}
                    <Collapse in={expandedOrder === order.id}>
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Payment and delivery info */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              borderRadius: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <CreditCardOutlined sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="subtitle1" fontWeight="bold">
                                Payment Information
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ ml: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Status:</Typography>
                                <Chip 
                                  label={order.paymentStatus} 
                                  size="small" 
                                  color={getPaymentStatusColor(order.paymentStatus)}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Method:</Typography>
                                <Typography variant="body2">{order.paymentMethod || 'Online'}</Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Date:</Typography>
                                <Typography variant="body2">{formatDate(order.orderDate)}</Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              borderRadius: 2
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <LocalShippingOutlined sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="subtitle1" fontWeight="bold">
                                Shipping Information
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ ml: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Courier:</Typography>
                                <Typography variant="body2">{order.deliveryDetails?.company || 'Not assigned'}</Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Tracking #:</Typography>
                                <Typography variant="body2">{order.deliveryDetails?.consignmentNumber || 'Not generated'}</Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ScheduleOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                                    Est. Delivery:
                                  </Box>
                                </Typography>
                                <Typography variant="body2">{formatDate(order.deliveryDate)}</Typography>
                              </Box>
                              
                              {order.deliveryDetails?.company && order.deliveryDetails?.consignmentNumber && (
                                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewOutlined />}
                                    onClick={() => handleTrackPackage(order.deliveryDetails)}
                                  >
                                    Track Package
                                  </Button>
                                </Box>
                              )}
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      {/* Order items (full list) */}
                      {(order.orderDetails?.items?.length > 0) && (
                        <>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                            All Order Items
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            {order.orderDetails.items.map((item, index) => (
                              <OrderItem key={index} item={item} />
                            ))}
                          </Box>
                        </>
                      )}
                      
                      {/* Order totals */}
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default', 
                          borderRadius: 2,
                          mt: 2
                        }}
                      >
                        <Stack spacing={1}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                          }}>
                            <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                            <Typography variant="body2">₹{order.orderDetails?.subtotal?.toFixed(2) || '0.00'}</Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                          }}>
                            <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                            <Typography variant="body2">₹{order.orderDetails?.shippingCost?.toFixed(2) || '0.00'}</Typography>
                          </Box>
                          
                          {order.orderDetails?.discount > 0 && (
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                            }}>
                              <Typography variant="body2" color="success.main">Discount:</Typography>
                              <Typography variant="body2" color="success.main">-₹{order.orderDetails?.discount?.toFixed(2) || '0.00'}</Typography>
                            </Box>
                          )}
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                          }}>
                            <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                      
                      {/* Additional notes */}
                      {(order.notes || order.deliveryDetails?.remarks) && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoOutlined fontSize="small" sx={{ mr: 1 }} />
                            Additional Notes
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            {order.notes || order.deliveryDetails?.remarks}
                          </Typography>
                        </Box>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              )})}
            </Stack>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Orders;