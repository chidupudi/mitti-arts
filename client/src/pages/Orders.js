import React, { useEffect, useState } from 'react';
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
  Badge,
  Tooltip
} from '@mui/material';
import { 
  ShoppingBag,
  LocalShipping,
  Payment,
  CheckCircle,
  Pending,
  Error,
  ArrowForward,
  LocalShippingOutlined,
  InfoOutlined,
  AssignmentOutlined,
  OpenInNew
} from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Courier tracking URLs mapping
  const courierTrackingUrls = {
    'Delhivery': 'https://www.delhivery.com/track/package/',
    'DTDC': 'https://www.dtdc.in/tracking.asp',
    'FedEx': 'https://www.fedex.com/fedextrack/?trknbr=',
    'BlueDart': 'https://www.bluedart.com/tracking.html',
    'Amazon Shipping': 'https://www.amazon.in/trackpkg/',
    'XpressBees': 'https://track.xpressbees.com/',
    'Ecom Express': 'https://ecomexpress.in/tracking/',
    'Shadowfax': 'https://track.shadowfax.in/',
    'Ekart': 'https://ekartlogistics.com/track/'
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
      } else {
        setUser(currentUser);
        await fetchOrders(currentUser.uid);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const fetchOrders = async (uid) => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const ordersData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate 
          ? data.createdAt.toDate() 
          : new Date(data.createdAt || new Date());
        
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 2) + 3);
        
        ordersData.push({
          id: doc.id,
          ...data,
          orderDate,
          deliveryDate,
         
          
          paymentStatus: data.paymentStatus || 'PENDING',
          deliveryDetails: data.deliveryDetails || {
            company: 'Not assigned yet',
            consignmentNumber: 'Not generated yet',
            tentativeDate: 'Not available',
            remarks: 'No remarks'
          }
        });
      });

      ordersData.sort((a, b) => b.orderDate - a.orderDate);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle color="success" />;
      case 'Shipped':
        return <LocalShipping color="info" />;
      case 'Processing':
        return <Pending color="warning" />;
      default:
        return <Error color="error" />;
    }
  };

  const getPaymentIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Payment color="success" />;
      case 'PENDING':
        return <Payment color="warning" />;
      case 'FAILED':
        return <Payment color="error" />;
      default:
        return <Payment color="info" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    if (typeof date === 'string') return date;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTrackPackage = (deliveryDetails) => {
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
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh'
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        boxShadow: theme.shadows[3],
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
            <ShoppingBag sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Orders
            </Typography>
            <Badge 
              badgeContent={orders.length} 
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>

          <Button 
            variant="text" 
            color="primary"
            startIcon={<ArrowForward />}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {orders.length === 0 ? (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center',
            backgroundColor: theme.palette.grey[50],
            borderRadius: 2
          }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You haven't placed any orders yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Start shopping to see your orders here
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              startIcon={<ShoppingBag />}
              onClick={() => navigate('/products')}
            >
              Shop Now
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Placed on {formatDate(order.orderDate)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`₹${order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}`}
                        color="primary"
                        size="medium"
                        sx={{ mt: { xs: 1, sm: 0 } }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        
                       
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getPaymentIcon(order.paymentStatus)}
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            <b>Payment:</b> {order.paymentStatus}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          <b>Method:</b> {order.paymentMethod || 'Not specified'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                          <LocalShippingOutlined fontSize="small" sx={{ mr: 0.5 }} />
                          Delivery Info
                        </Typography>
                        <Typography variant="body2">
                          <b>Courier:</b> {order.deliveryDetails?.company || 'Not assigned'}
                        </Typography>
                        <Typography variant="body2">
                          <b>Tracking #:</b> {order.deliveryDetails?.consignmentNumber || 'Not generated'}
                        </Typography>
                        {order.deliveryDetails?.company && order.deliveryDetails?.consignmentNumber && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<OpenInNew />}
                            sx={{ mt: 1 }}
                            onClick={() => handleTrackPackage(order.deliveryDetails)}
                          >
                            Track Package
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                          <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
                          Additional Info
                        </Typography>
                        <Typography variant="body2">
                          <b>Tentative Date:</b> {formatDate(order.deliveryDetails?.tentativeDate)}
                        </Typography>
                        {order.deliveryDetails?.remarks && (
                          <Typography variant="body2">
                            <b>Remarks:</b> {order.deliveryDetails.remarks}
                          </Typography>
                        )}
                        {order.notes && (
                          <Tooltip title={order.notes}>
                            <Typography variant="body2" noWrap>
                              <b>Order Notes:</b> {order.notes}
                            </Typography>
                          </Tooltip>
                        )}
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      <AssignmentOutlined sx={{ mr: 1 }} />
                      Order Items
                    </Typography>
                    
                    {order.orderDetails?.items?.map((item, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <Avatar
                          src={item.image || ''}
                          alt={item.name}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mr: 2,
                            backgroundColor: theme.palette.grey[200]
                          }}
                        >
                          {item.name?.[0]}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography fontWeight="bold">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography fontWeight="bold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      mt: 3,
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      <Typography variant="body1">
                        <b>Subtotal:</b> ₹{order.orderDetails?.subtotal?.toFixed(2) || '0.00'}
                      </Typography>
                      <Typography variant="body1">
                        <b>Shipping:</b> ₹{order.orderDetails?.shippingCost?.toFixed(2) || '0.00'}
                      </Typography>
                      {order.orderDetails?.discount > 0 && (
                        <Typography variant="body1" color="success.main">
                          <b>Discount:</b> -₹{order.orderDetails?.discount?.toFixed(2) || '0.00'}
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight="bold">
                        Total: ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Order;