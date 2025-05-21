import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  People,
  Store,
  TrendingUp,
  AssignmentTurnedIn,
  Refresh,
  LocalShipping,
  CheckCircle,
  InventoryRounded
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc, increment, writeBatch } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

// Styled components
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  boxShadow: theme.shadows[3],
  background: 'linear-gradient(90deg, #E07A5F 0%, #F2D0C2 100%)',
  color: '#fff',
  minHeight: 120,
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: theme.shadows[2],
  background: '#fff',
}));

const getOrderDate = (order) => {
  try {
    if (order.createdAt?.toDate) {
      return order.createdAt.toDate();
    }
    if (order.createdAt?.seconds) {
      return new Date(order.createdAt.seconds * 1000);
    }
    return new Date(order.createdAt || new Date());
  } catch (e) {
    return new Date();
  }
};

const DeliveryDetailsDialog = ({ open, onClose, orderId, onSave, initialData }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    company: '',
    consignmentNumber: '',
    tentativeDate: '',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setDeliveryDetails(initialData);
    } else {
      setDeliveryDetails({
        company: '',
        consignmentNumber: '',
        tentativeDate: '',
        remarks: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!deliveryDetails.company || !deliveryDetails.consignmentNumber) {
      alert('Please fill in required fields (Company and Consignment Number)');
      return;
    }
    onSave(orderId, deliveryDetails);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Update Delivery Details' : 'Add Delivery Details'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              required
              fullWidth
              label="Delivery Company"
              name="company"
              value={deliveryDetails.company}
              onChange={handleChange}
              variant="outlined"
            >
              {['DTDC', 'Blue Dart', 'Delhivery', 'FedEx', 'DHL', 'Amazon Logistics', 'Other'].map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Consignment Number"
              name="consignmentNumber"
              value={deliveryDetails.consignmentNumber}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Tentative Delivery Date"
              name="tentativeDate"
              value={deliveryDetails.tentativeDate}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarks"
              name="remarks"
              value={deliveryDetails.remarks}
              onChange={handleChange}
              variant="outlined"
              placeholder="Any special instructions or notes for delivery"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {initialData ? 'Update' : 'Save'} Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    wishlist: 0,
    sales: 0,
    recentOrders: [],
    topProducts: [],
    orderTrends: [],
  });
  const [userMap, setUserMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [deliveryDetailsMap, setDeliveryDetailsMap] = useState({});
  // New state for delivered orders
  const [deliveredOrders, setDeliveredOrders] = useState({});
  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // State for processing orders to prevent double-clicks
  const [processingOrder, setProcessingOrder] = useState(null);

  const handlePaymentToggle = async (orderId) => {
    try {
      const newStatus = !paymentStatuses[orderId];
      setPaymentStatuses(prev => ({ ...prev, [orderId]: newStatus }));
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        paymentStatus: newStatus ? 'COMPLETED' : 'PENDING'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating payment status',
        severity: 'error'
      });
    }
  };

  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryDetails: details
      });
      setDeliveryDetailsMap(prev => ({
        ...prev,
        [orderId]: details
      }));
      setSnackbar({
        open: true,
        message: 'Delivery details updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving delivery details:', error);
      setSnackbar({
        open: true,
        message: 'Error saving delivery details',
        severity: 'error'
      });
    }
  };
const handleMarkDelivered = async (orderId) => {
  if (processingOrder === orderId) return; // Prevent double processing
  
  try {
    setProcessingOrder(orderId);
    
    // Get the order data
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderSnap.data();
    
    // Check for items in multiple possible locations (for compatibility)
    let items = [];
    if (orderData.orderDetails?.items && orderData.orderDetails.items.length > 0) {
      items = orderData.orderDetails.items;
    } else if (orderData.orderDetails?.cartData?.items && orderData.orderDetails.cartData.items.length > 0) {
      items = orderData.orderDetails.cartData.items;
    } else if (orderData.items && orderData.items.length > 0) {
      items = orderData.items;
    }
    
    if (items.length === 0) {
      throw new Error('No items found in this order');
    }
    
    // Use batch write to update product stock for all items in the order
    const batch = writeBatch(db);
    
    // Flag to check if any stock updates were needed
    let hasUpdates = false;
    
    // Process each item in the order
    for (const item of items) {
      // Try to get product ID from either id or productId field
      const productId = item.id || item.productId;
      
      // Skip if no product ID is found
      if (!productId) {
        console.warn('Product ID not found for item:', item);
        continue;
      }
      
      // Reference to the product
      const productRef = doc(db, 'products', productId);
      
      // Verify the product exists before updating
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        console.warn(`Product ${productId} not found in database`);
        continue;
      }
      
      // Update stock by decrementing the quantity
      batch.update(productRef, {
        stock: increment(-item.quantity) // Decrement stock by the quantity ordered
      });
      
      console.log(`Updating stock for product ${productId}, decreasing by ${item.quantity}`);
      hasUpdates = true;
    }
    
    // Update order to mark as delivered
    batch.update(orderRef, {
      deliveryStatus: 'DELIVERED',
      deliveredAt: new Date(),
    });
    
    // Commit all updates
    await batch.commit();
    
    // Update local state
    setDeliveredOrders(prev => ({
      ...prev,
      [orderId]: true
    }));
    
    // Show success message
    setSnackbar({
      open: true,
      message: hasUpdates 
        ? 'Order marked as delivered and product stock updated' 
        : 'Order marked as delivered',
      severity: 'success'
    });
    
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    setSnackbar({
      open: true,
      message: `Error: ${error.message || 'Failed to mark as delivered'}`,
      severity: 'error'
    });
  } finally {
    setProcessingOrder(null);
  }
};

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch stats
  useEffect(() => {
    setLoading(true);

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, products: snap.size }));
    });

    const unsubWishlist = onSnapshot(collection(db, 'wishlist'), (snap) => {
      setStats(prev => ({ ...prev, wishlist: snap.size }));
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      let sales = 0;
      let orderTrends = [];
      let recentOrders = [];
      const newDeliveryDetails = {};
      const newDeliveredOrders = {};
      
      snap.docs.forEach((doc) => {
        const data = doc.data();
        sales += data?.orderDetails?.totalAmount || 0;
        
        const orderDate = getOrderDate(data);
        const dateString = orderDate.toLocaleDateString();
        
        const found = orderTrends.find(o => o.date === dateString);
        if (found) {
          found.amount += data?.orderDetails?.totalAmount || 0;
        } else {
          orderTrends.push({ date: dateString, amount: data?.orderDetails?.totalAmount || 0 });
        }

        recentOrders.push({
          id: doc.id,
          ...data,
        });

        setPaymentStatuses(prev => ({
          ...prev,
          [doc.id]: data.paymentStatus === 'COMPLETED'
        }));

        if (data.deliveryDetails) {
          newDeliveryDetails[doc.id] = data.deliveryDetails;
        }
        
        // Track delivery status
        if (data.deliveryStatus === 'DELIVERED') {
          newDeliveredOrders[doc.id] = true;
        }
      });

      orderTrends.sort((a, b) => new Date(a.date) - new Date(b.date));
      recentOrders.sort((a, b) => getOrderDate(b) - getOrderDate(a));

      setStats(prev => ({
        ...prev,
        orders: snap.size,
        sales,
        orderTrends,
        recentOrders: recentOrders.slice(0, 5),
      }));
      setDeliveryDetailsMap(newDeliveryDetails);
      setDeliveredOrders(newDeliveredOrders);
      setLoading(false);
    });

    const fetchTopProducts = async () => {
      const wishlistSnap = await getDocs(collection(db, 'wishlist'));
      const productCounts = {};
      wishlistSnap.forEach((doc) => {
        const pid = doc.data().productId;
        productCounts[pid] = (productCounts[pid] || 0) + 1;
      });

      const productsSnap = await getDocs(collection(db, 'products'));
      const productsArr = [];
      productsSnap.forEach((doc) => {
        const data = doc.data();
        productsArr.push({
          id: doc.id,
          ...data,
          wishlistCount: productCounts[data.id] || 0,
        });
      });
      productsArr.sort((a, b) => b.wishlistCount - a.wishlistCount);
      setStats(prev => ({ ...prev, topProducts: productsArr.slice(0, 5) }));
    };

    const fetchLookups = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = {};
      usersSnap.forEach(doc => {
        users[doc.id] = doc.data().name || doc.data().email || doc.id;
      });
      setUserMap(users);

      const productsSnap = await getDocs(collection(db, 'products'));
      const products = {};
      productsSnap.forEach(doc => {
        products[doc.id] = doc.data().name || doc.id;
      });
      setProductMap(products);
    };

    fetchTopProducts();
    fetchLookups();

    return () => {
      unsubUsers();
      unsubProducts();
      unsubWishlist();
      unsubOrders();
    };
  }, []);

  // Chart data
  const chartData = {
    labels: stats.orderTrends.map(o => o.date),
    datasets: [{
      label: 'Sales (₹)',
      data: stats.orderTrends.map(o => o.amount),
      fill: true,
      backgroundColor: 'rgba(224,122,95,0.15)',
      borderColor: '#E07A5F',
      tension: 0.4,
    }],
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4, background: '#F8F9FA', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#3D405B' }}>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stat Cards */}
          <Grid item xs={12} md={3}>
            <StatCard>
              <Avatar sx={{ bgcolor: '#fff', color: '#E07A5F', width: 56, height: 56 }}>
                <People fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6">Users</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.users}</Typography>
              </Box>
            </StatCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard>
              <Avatar sx={{ bgcolor: '#fff', color: '#3D405B', width: 56, height: 56 }}>
                <Store fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6">Products</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.products}</Typography>
              </Box>
            </StatCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard>
              <Avatar sx={{ bgcolor: '#fff', color: '#43A047', width: 56, height: 56 }}>
                <AssignmentTurnedIn fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6">Orders</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.orders}</Typography>
              </Box>
            </StatCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard>
              <Avatar sx={{ bgcolor: '#fff', color: '#D7263D', width: 56, height: 56 }}>
                <Favorite fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6">Wishlists</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.wishlist}</Typography>
              </Box>
            </StatCard>
          </Grid>

          {/* Sales Chart */}
          <Grid item xs={12} md={8}>
            <SectionPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: '#E07A5F', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Sales Trends
                </Typography>
                <Chip
                  label={`Total Sales: ₹${stats.sales.toLocaleString()}`}
                  color="success"
                  sx={{ ml: 2, fontWeight: 'bold' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }} />
              </Box>
            </SectionPaper>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} md={4}>
            <SectionPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Store sx={{ color: '#3D405B', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Top Wishlisted Products
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {stats.topProducts.length === 0 ? (
                <Typography color="text.secondary">No data</Typography>
              ) : (
                stats.topProducts.map(prod => (
                  <Box key={prod.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={prod.imgUrl || (prod.images?.[0] || '')}
                      alt={prod.name}
                      sx={{ mr: 2, bgcolor: '#E07A5F' }}
                    >
                      {prod.name?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight="bold">{prod.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {prod.code}
                      </Typography>
                    </Box>
                    <Chip
                      icon={<Favorite sx={{ color: '#D7263D' }} />}
                      label={prod.wishlistCount}
                      color="error"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                ))
              )}
            </SectionPaper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <SectionPaper>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart sx={{ color: '#43A047', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Recent Orders
                </Typography>
                
                <DatePicker
                  value={dateFilter ? moment(dateFilter) : null}
                  onChange={(date) => setDateFilter(date ? date.toDate() : null)}
                  suffixIcon={<CalendarOutlined style={{ color: theme.palette.primary.main }} />}
                  style={{ 
                    width: 180,
                    marginLeft: 16,
                    borderColor: theme.palette.grey[400],
                    borderRadius: 4
                  }}
                  allowClear
                  format="DD/MM/YYYY"
                />
                
                <Button
                  startIcon={<Refresh />}
                  sx={{ 
                    ml: 'auto', 
                    color: '#E07A5F', 
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: 'rgba(224, 122, 95, 0.08)' }
                  }}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {stats.recentOrders
                  .filter(order => {
                    if (!dateFilter) return true;
                    const orderDate = getOrderDate(order);
                    const filterDate = new Date(dateFilter);
                    return (
                      orderDate.getDate() === filterDate.getDate() &&
                      orderDate.getMonth() === filterDate.getMonth() &&
                      orderDate.getFullYear() === filterDate.getFullYear()
                    );
                  })
                  .length === 0 ? (
                    <Grid item xs={12}>
                      <Typography color="text.secondary">
                        {dateFilter ? 'No orders found for selected date' : 'No recent orders'}
                      </Typography>
                    </Grid>
                  ) : (
                    stats.recentOrders
                      .filter(order => {
                        if (!dateFilter) return true;
                        const orderDate = getOrderDate(order);
                        const filterDate = new Date(dateFilter);
                        return (
                          orderDate.getDate() === filterDate.getDate() &&
                          orderDate.getMonth() === filterDate.getMonth() &&
                          orderDate.getFullYear() === filterDate.getFullYear()
                        );
                      })
                      .map(order => (
                        <Grid item xs={12} md={6} key={order.id}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              mb: 1,
                              background: deliveredOrders[order.id] 
                                ? '#E8F5E9' 
                                : (paymentStatuses[order.id] ? '#F8F9FA' : '#FFF3E0'),
                              borderLeft: `4px solid ${
                                deliveredOrders[order.id] 
                                  ? '#2E7D32' // Dark green for delivered
                                  : (paymentStatuses[order.id] ? '#43A047' : '#FFA000')
                              }`,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                            }}
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          >
                            <Box display="flex" justifyContent="space-between">
                              <Box>
                                <Typography 
                                  fontWeight="bold" 
                                  color={
                                    deliveredOrders[order.id] 
                                      ? '#2E7D32' 
                                      : (paymentStatuses[order.id] ? '#43A047' : '#FFA000')
                                  }
                                >
                                  Order #{order.id.slice(-6).toUpperCase()}
                                </Typography>
                                <Typography variant="body2">
                                  <b>Customer:</b> {order.orderDetails?.personalInfo?.fullName || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  <b>Amount:</b> ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
                                </Typography>
                                {dateFilter && (
                                  <Typography variant="caption" color="text.secondary">
                                    {getOrderDate(order).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                              <Box>
                                {!deliveredOrders[order.id] && (
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={paymentStatuses[order.id] || false}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handlePaymentToggle(order.id);
                                        }}
                                        color="success"
                                        disabled={deliveredOrders[order.id]}
                                      />
                                    }
                                    label={paymentStatuses[order.id] ? 'Paid' : 'Pending'}
                                    labelPlacement="top"
                                  />
                                )}
                                {deliveredOrders[order.id] && (
                                  <Chip
                                    label="Delivered"
                                    color="success"
                                    icon={<CheckCircle />}
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                )}
                              </Box>
                            </Box>

                            {/* Delivery Details and Delivery Button */}
                            {paymentStatuses[order.id] && !deliveredOrders[order.id] && (
                              <Box mt={1}>
                                {deliveryDetailsMap[order.id] ? (
                                  <Box sx={{ 
                                    p: 1, 
                                    background: theme.palette.grey[100], 
                                    borderRadius: 1,
                                    borderLeft: `3px solid ${theme.palette.primary.main}`
                                  }}>
                                    <Box display="flex" alignItems="center">
                                      <LocalShipping sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                      <Typography variant="subtitle2">Delivery Details</Typography>
                                    </Box>
                                    <Typography variant="body2">
                                      <b>Company:</b> {deliveryDetailsMap[order.id].company}<br />
                                      <b>Consignment #:</b> {deliveryDetailsMap[order.id].consignmentNumber}<br />
                                      {deliveryDetailsMap[order.id].tentativeDate && (
                                        <>
                                          <b>Tentative Date:</b> {new Date(deliveryDetailsMap[order.id].tentativeDate).toLocaleDateString()}<br />
                                        </>
                                      )}
                                      {deliveryDetailsMap[order.id].remarks && (
                                        <>
                                          <b>Remarks:</b> {deliveryDetailsMap[order.id].remarks}
                                        </>
                                      )}
                                    </Typography>
                                    
                                    {/* Action Buttons */}
                                    <Box display="flex" gap={1} mt={1}>
                                      <Button 
                                        size="small" 
                                        color="primary" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedOrderForDelivery(order.id);
                                          setDeliveryDialogOpen(true);
                                        }}
                                      >
                                        Update Delivery
                                      </Button>
                                      
                                      <Button
                                        size="small" 
                                        color="success"
                                        variant="contained"
                                        startIcon={<CheckCircle />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkDelivered(order.id);
                                        }}
                                        disabled={processingOrder === order.id}
                                      >
                                        {processingOrder === order.id ? 'Processing...' : 'Mark Delivered'}
                                      </Button>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box display="flex" gap={1}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="primary"
                                      startIcon={<LocalShipping />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedOrderForDelivery(order.id);
                                        setDeliveryDialogOpen(true);
                                      }}
                                    >
                                      Add Delivery Details
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            )}
                            
                            {/* Delivery Status Badge */}
                            {deliveredOrders[order.id] && (
                              <Box mt={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  icon={<InventoryRounded />}
                                  label="Stock Updated" 
                                  color="info"
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {order.deliveredAt ? new Date(order.deliveredAt.seconds * 1000).toLocaleString() : 'Recently delivered'}
                                </Typography>
                              </Box>
                            )}

                            {expandedOrder === order.id && (
                              <Box mt={2}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" gutterBottom>Contact Details</Typography>
                                <Grid container spacing={1}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2"><b>Phone:</b> {order.orderDetails?.personalInfo?.phone || 'N/A'}</Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2"><b>Email:</b> {order.orderDetails?.personalInfo?.email || 'N/A'}</Typography>
                                  </Grid>
                                </Grid>

                                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Delivery Address</Typography>
                                <Typography variant="body2">
                                  {order.orderDetails?.deliveryAddress?.addressLine1 || 'N/A'}<br />
                                  {order.orderDetails?.deliveryAddress?.addressLine2 || ''}<br />
                                  {order.orderDetails?.deliveryAddress?.landmark && (
                                    <>Landmark: {order.orderDetails.deliveryAddress.landmark}<br /></>
                                  )}
                                  {order.orderDetails?.deliveryAddress?.city}, {order.orderDetails?.deliveryAddress?.state}<br />
                                  Pincode: {order.orderDetails?.deliveryAddress?.pincode}
                                </Typography>

                                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Order Items</Typography>
                                {order.orderDetails?.items?.map((item, index) => (
                                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar 
                                      src={item.image || ''} 
                                      sx={{ width: 40, height: 40, mr: 2 }}
                                    >
                                      {item.name?.[0]}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2"><b>{item.name}</b></Typography>
                                      <Typography variant="body2">
                                        ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      ))
                  )}
              </Grid>
            </SectionPaper>
          </Grid>
        </Grid>
      )}

      {/* Delivery Details Dialog */}
      <DeliveryDetailsDialog
        open={deliveryDialogOpen}
        onClose={() => setDeliveryDialogOpen(false)}
        orderId={selectedOrderForDelivery}
        onSave={handleSaveDeliveryDetails}
        initialData={selectedOrderForDelivery ? deliveryDetailsMap[selectedOrderForDelivery] : null}
      />
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          elevation={6} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;