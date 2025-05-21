import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Collapse,
  Tooltip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Snackbar,
  Alert,
  TablePagination
} from '@mui/material';

import {
  FilterList,
  Sort,
  Search,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  LocalShipping,
  Refresh,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Payment,
  Person,
  LocationOn,
  ReceiptLong,
  Close,
  KeyboardArrowRight,
  OpenInNew,
  ArrowBack
} from '@mui/icons-material';

import { DatePicker, Space } from 'antd';
import moment from 'moment';
import { styled } from '@mui/material/styles';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, where, Timestamp } from 'firebase/firestore';

// Styled components
const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  }
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  textTransform: 'none'
}));

const CardStyled = styled(Card)(({ theme, status }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `5px solid ${
    status === 'DELIVERED' 
      ? theme.palette.success.main 
      : status === 'CONFIRMED' 
        ? theme.palette.info.main 
        : status === 'CANCELLED' 
          ? theme.palette.error.main 
          : theme.palette.warning.main
  }`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-3px)'
  }
}));

const getOrderDate = (order) => {
  try {
    if (!order.createdAt) return new Date();
    if (order.createdAt?.toDate) {
      return order.createdAt.toDate();
    }
    if (order.createdAt?.seconds) {
      return new Date(order.createdAt.seconds * 1000);
    }
    return new Date(order.createdAt);
  } catch (e) {
    console.error("Error parsing date:", e);
    return new Date();
  }
};

// Dialog component for delivery details
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

// Order Details Dialog
const OrderDetailsDialog = ({ open, onClose, order, searchQuery }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <ReceiptLong sx={{ mr: 1, color: theme.palette.primary.main }} />
          Order Details #{order.orderNumber}
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2"><b>Order ID:</b> {order.id}</Typography>
              <Typography variant="body2"><b>Order Number:</b> {order.orderNumber}</Typography>
              <Typography variant="body2">
                <b>Date:</b> {getOrderDate(order).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <b>Total Amount:</b> ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2">
                <b>Payment Method:</b> {order.paymentMethod || 'N/A'}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip 
                  label={order.paymentStatus || 'PENDING'} 
                  color={
                    order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'COMPLETED' 
                      ? 'success' 
                      : order.paymentStatus === 'FAILED' 
                        ? 'error' 
                        : 'warning'
                  }
                  size="small"
                />
                <Chip 
                  label={order.status || 'PENDING'} 
                  color={
                    order.status === 'DELIVERED' || order.status === 'CONFIRMED' 
                      ? 'success' 
                      : order.status === 'CANCELLED' 
                        ? 'error' 
                        : 'warning'
                  }
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Customer Information */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, fontSize: 20 }} /> Customer Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <b>Name:</b> {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <b>Email:</b> {order.orderDetails?.personalInfo?.email || order.customerEmail || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <b>Phone:</b> {order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A'}
              </Typography>
              {order.alternatePhone && (
                <Typography variant="body2">
                  <b>Alternate Phone:</b> {order.alternatePhone}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Delivery Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 20 }} /> Delivery Address
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 1,
                backgroundColor: searchQuery && order.orderDetails?.deliveryAddress && 
                  Object.values(order.orderDetails.deliveryAddress).some(
                    value => typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
                  ) ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
              }}
            >
              {order.orderDetails?.deliveryAddress ? (
                <>
                  <Typography variant="body2">
                    {order.orderDetails.deliveryAddress.addressLine1 || 'N/A'}
                    {searchQuery && order.orderDetails.deliveryAddress.addressLine1 && 
                      order.orderDetails.deliveryAddress.addressLine1.toLowerCase().includes(searchQuery.toLowerCase()) && (
                        <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                      )}
                  </Typography>
                  
                  {order.orderDetails.deliveryAddress.addressLine2 && (
                    <Typography variant="body2">
                      {order.orderDetails.deliveryAddress.addressLine2}
                      {searchQuery && 
                        order.orderDetails.deliveryAddress.addressLine2.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                        )}
                    </Typography>
                  )}
                  
                  {order.orderDetails.deliveryAddress.landmark && (
                    <Typography variant="body2">
                      <b>Landmark:</b> {order.orderDetails.deliveryAddress.landmark}
                      {searchQuery && 
                        order.orderDetails.deliveryAddress.landmark.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                        )}
                    </Typography>
                  )}
                  
                  <Typography variant="body2">
                    {order.orderDetails.deliveryAddress.city && (
                      <>
                        {order.orderDetails.deliveryAddress.city}
                        {searchQuery && 
                          order.orderDetails.deliveryAddress.city.toLowerCase().includes(searchQuery.toLowerCase()) && (
                            <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                          )}
                      </>
                    )}
                    
                    {order.orderDetails.deliveryAddress.state && (
                      <>
                        , {order.orderDetails.deliveryAddress.state}
                        {searchQuery && 
                          order.orderDetails.deliveryAddress.state.toLowerCase().includes(searchQuery.toLowerCase()) && (
                            <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                          )}
                      </>
                    )}
                    
                    {order.orderDetails.deliveryAddress.pincode && (
                      <>
                        <br />Pincode: {order.orderDetails.deliveryAddress.pincode}
                        {searchQuery && 
                          order.orderDetails.deliveryAddress.pincode.toString().includes(searchQuery) && (
                            <Chip size="small" label="Match" color="success" sx={{ ml: 1, height: 20 }} />
                          )}
                      </>
                    )}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No delivery address information
                </Typography>
              )}
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Delivery Details */}
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1, fontSize: 20 }} /> Delivery Information
            </Typography>
            {order.deliveryDetails ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <b>Company:</b> {order.deliveryDetails.company}
                </Typography>
                <Typography variant="body2">
                  <b>Tracking Number:</b> {order.deliveryDetails.consignmentNumber}
                </Typography>
                {order.deliveryDetails.tentativeDate && (
                  <Typography variant="body2">
                    <b>Expected Delivery:</b> {new Date(order.deliveryDetails.tentativeDate).toLocaleDateString()}
                  </Typography>
                )}
                {order.deliveryDetails.remarks && (
                  <Typography variant="body2">
                    <b>Remarks:</b> {order.deliveryDetails.remarks}
                  </Typography>
                )}
                {order.deliveryStatus === 'DELIVERED' && order.deliveredAt && (
                  <Typography variant="body2" color="success.main">
                    <b>Delivered on:</b> {
                      order.deliveredAt.toDate 
                        ? order.deliveredAt.toDate().toLocaleString() 
                        : order.deliveredAt.seconds 
                          ? new Date(order.deliveredAt.seconds * 1000).toLocaleString()
                          : new Date(order.deliveredAt).toLocaleString()
                    }
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No delivery details available
              </Typography>
            )}
          </Grid>

          {/* Order Details Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Order Details</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  {(order.orderDetails?.items || []).map((item, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        backgroundColor: searchQuery && item.name && 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                            ? 'rgba(33, 150, 243, 0.08)' 
                            : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.image && (
                            <Box
                              component="img"
                              src={item.image}
                              alt={item.name}
                              sx={{ width: 40, height: 40, objectFit: 'cover', mr: 1, borderRadius: 1 }}
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2">
                              <b>{item.name}</b>
                              {searchQuery && item.name && 
                                item.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                <Chip 
                                  size="small" 
                                  label="Match" 
                                  color="info"
                                  sx={{ ml: 1, height: 20 }} 
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Qty: {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">₹{item.price?.toFixed(2)}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{item.totalItemPrice?.toFixed(2) || (item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Order Totals */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2">
                <b>Subtotal:</b> ₹{order.orderDetails?.cartData?.subtotal?.toFixed(2) || '0.00'}
              </Typography>
              {order.orderDetails?.cartData?.discount > 0 && (
                <Typography variant="body2" color="success.main">
                  <b>Discount:</b> -₹{order.orderDetails.cartData.discount.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2">
                <b>Shipping:</b> ₹{order.orderDetails?.cartData?.shippingCost?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                <b>Total:</b> ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
              </Typography>
            </Box>

            {/* Transaction Info */}
            {order.transactionId && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Transaction Details</Typography>
                <Typography variant="body2">
                  <b>Transaction ID:</b> {order.transactionId}
                </Typography>
                {order.notes && (
                  <Typography variant="body2">
                    <b>Notes:</b> {order.notes}
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  
  // UI state
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [showDateRange, setShowDateRange] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Delivery details and notifications
  const [deliveryDetailsMap, setDeliveryDetailsMap] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const ordersData = [];
        const deliveryDetails = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Store delivery details if available
          if (data.deliveryDetails) {
            deliveryDetails[doc.id] = data.deliveryDetails;
          }
          
          ordersData.push({
            id: doc.id,
            ...data
          });
        });
        
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setDeliveryDetailsMap(deliveryDetails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => {
        // Basic order details search
        if ((order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
            (order.orderDetails?.personalInfo?.fullName && order.orderDetails.personalInfo.fullName.toLowerCase().includes(query)) ||
            (order.customerName && order.customerName.toLowerCase().includes(query)) ||
            (order.customerEmail && order.customerEmail.toLowerCase().includes(query)) ||
            (order.customerPhone && order.customerPhone.includes(query)) ||
            (order.transactionId && order.transactionId.toLowerCase().includes(query))) {
          return true;
        }
        
        // Search in order items
        const items = order.orderDetails?.items || order.orderDetails?.cartData?.items || [];
        if (items.some(item => item.name && item.name.toLowerCase().includes(query))) {
          return true;
        }
        
        // Search in address details
        const deliveryAddress = order.orderDetails?.deliveryAddress || {};
        if ((deliveryAddress.addressLine1 && deliveryAddress.addressLine1.toLowerCase().includes(query)) ||
            (deliveryAddress.addressLine2 && deliveryAddress.addressLine2.toLowerCase().includes(query)) ||
            (deliveryAddress.landmark && deliveryAddress.landmark.toLowerCase().includes(query)) ||
            (deliveryAddress.city && deliveryAddress.city.toLowerCase().includes(query)) ||
            (deliveryAddress.state && deliveryAddress.state.toLowerCase().includes(query)) ||
            (deliveryAddress.pincode && deliveryAddress.pincode.includes(query))) {
          return true;
        }
        
        return false;
      });
    }
    
    // Apply date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      
      result = result.filter(order => {
        const orderDate = getOrderDate(order);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Apply delivery details filter
    if (deliveryFilter !== 'all') {
      result = result.filter(order => {
        if (deliveryFilter === 'added') {
          return !!order.deliveryDetails;
        } else {
          return !order.deliveryDetails;
        }
      });
    }
    
    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      result = result.filter(order => {
        return order.paymentStatus === paymentStatusFilter;
      });
    }
    
    // Apply order status filter
    if (orderStatusFilter !== 'all') {
      result = result.filter(order => {
        return order.status === orderStatusFilter;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => getOrderDate(b) - getOrderDate(a));
        break;
      case 'oldest':
        result.sort((a, b) => getOrderDate(a) - getOrderDate(b));
        break;
      case 'highest':
        result.sort((a, b) => 
          (b.orderDetails?.totalAmount || 0) - 
          (a.orderDetails?.totalAmount || 0)
        );
        break;
      case 'lowest':
        result.sort((a, b) => 
          (a.orderDetails?.totalAmount || 0) - 
          (b.orderDetails?.totalAmount || 0)
        );
        break;
      default:
        break;
    }
    
    setFilteredOrders(result);
    setPage(0); // Reset to first page when filters change
  }, [orders, sortBy, searchQuery, dateRange, deliveryFilter, paymentStatusFilter, orderStatusFilter]);

  // Handle payment status toggle
  const handlePaymentToggle = async (orderId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' || currentStatus === 'SUCCESS' ? 'PENDING' : 'COMPLETED';
      const orderRef = doc(db, 'orders', orderId);
      
      // Update in Firestore
      await updateDoc(orderRef, {
        paymentStatus: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, paymentStatus: newStatus } : order
        )
      );
      
      setSnackbar({
        open: true,
        message: `Payment status updated to ${newStatus}`,
        severity: 'success'
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

  // Handle delivery details update
  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Update in Firestore
      await updateDoc(orderRef, {
        deliveryDetails: details,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setDeliveryDetailsMap(prev => ({
        ...prev,
        [orderId]: details
      }));
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, deliveryDetails: details } : order
        )
      );
      
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

  // Handle reset filters
  const handleResetFilters = () => {
    setSortBy('latest');
    setSearchQuery('');
    setDateRange([null, null]);
    setDeliveryFilter('all');
    setPaymentStatusFilter('all');
    setOrderStatusFilter('all');
    setShowDateRange(false);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render helpers
  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'DELIVERED':
      case 'CONFIRMED':
        color = 'success';
        break;
      case 'PENDING':
      case 'INITIATED':
      case 'PROCESSING':
        color = 'warning';
        break;
      case 'FAILED':
      case 'CANCELLED':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  // View specific order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrderForDetails(order);
    setDetailsDialogOpen(true);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Mobile card view for each order
  const OrderCard = ({ order }) => {
    const isExpanded = expandedOrderId === order.id;
    const hasDeliveryDetails = !!order.deliveryDetails;
    
    return (
      <CardStyled status={order.status}>
        <CardContent>
          {/* Order header with basic info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Order #{order.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getOrderDate(order).toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          
          {/* Customer info */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <b>Customer:</b> {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <b>Phone:</b> {order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A'}
            </Typography>
          </Box>
          
          {/* Status section */}
          <Box sx={{ display: 'flex', mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {/* Display status as paymentStatus (swapped as requested) */}
            <Chip 
              label={`Status: ${order.paymentStatus || 'PENDING'}`}
              color={
                order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'COMPLETED' 
                  ? 'success' 
                  : order.paymentStatus === 'FAILED' 
                    ? 'error' 
                    : 'warning'
              }
              size="small"
              sx={{ fontWeight: 500 }}
            />
            
            {/* Display paymentStatus as status (swapped as requested) */}
            <Chip 
              label={`Payment: ${order.status || 'PENDING'}`}
              color={
                order.status === 'DELIVERED' || order.status === 'CONFIRMED' 
                  ? 'success' 
                  : order.status === 'CANCELLED' 
                    ? 'error' 
                    : 'warning'
              }
              size="small"
              sx={{ fontWeight: 500 }}
            />
            
            {/* Delivery indicator */}
            {hasDeliveryDetails ? (
              <Chip 
                icon={<LocalShipping />}
                label="Delivery Set"
                color="info"
                size="small"
              />
            ) : null}
          </Box>
          
          {/* Actions Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS'}
                    onChange={() => handlePaymentToggle(order.id, order.paymentStatus)}
                    color="success"
                  />
                }
                label="Paid"
              />
            </Box>
            
            <Box>
              <Button
                size="small"
                startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              >
                {isExpanded ? 'Less' : 'More'}
              </Button>
              
              <IconButton 
                color="primary"
                onClick={() => handleViewOrderDetails(order)}
                size="small"
              >
                <OpenInNew />
              </IconButton>
            </Box>
          </Box>
          
          {/* Expanded content */}
          <Collapse in={isExpanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {/* Delivery Details */}
              <Typography variant="subtitle2" gutterBottom>
                Delivery Information
              </Typography>
              
              {hasDeliveryDetails ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <b>Company:</b> {order.deliveryDetails.company}
                  </Typography>
                  <Typography variant="body2">
                    <b>Tracking:</b> {order.deliveryDetails.consignmentNumber}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedOrderForDelivery(order.id);
                        setDeliveryDialogOpen(true);
                      }}
                    >
                      Update Delivery
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No delivery details added yet
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<LocalShipping />}
                    onClick={() => {
                      setSelectedOrderForDelivery(order.id);
                      setDeliveryDialogOpen(true);
                    }}
                  >
                    Add Delivery Details
                  </Button>
                </Box>
              )}
              
              {/* Items Summary */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Order Items
              </Typography>
              <Box>
                {(order.orderDetails?.items || []).map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.quantity} x {item.name}
                    </Typography>
                    <Typography variant="body2">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Search Match Highlights */}
              {searchQuery && (
                <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(66, 165, 245, 0.1)', borderRadius: 1, borderLeft: '3px solid #42A5F5' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                    Search Results
                  </Typography>
                  
                  {/* Item matches */}
                  {((order.orderDetails?.items || []).some(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2">
                        <b>Matching Items:</b> {(order.orderDetails?.items || [])
                          .filter(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(item => item.name)
                          .join(", ")}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Address matches */}
                  {order.orderDetails?.deliveryAddress && Object.entries(order.orderDetails.deliveryAddress)
                    .filter(([key, value]) => typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase()))
                    .length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2">
                        <b>Address Match:</b> {Object.entries(order.orderDetails.deliveryAddress)
                          .filter(([key, value]) => typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(([key, value]) => `${key === 'addressLine1' ? 'Address' : key === 'addressLine2' ? 'Address 2' : key}: ${value}`)
                          .join(", ")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Item Search Results */}
              {searchQuery && expandedOrderId === order.id && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                    Search matched:
                  </Typography>
                  {((order.orderDetails?.items || []).some(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Items: {(order.orderDetails?.items || [])
                          .filter(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(item => item.name)
                          .join(", ")}
                      </Typography>
                    </Box>
                  )}
                  {order.orderDetails?.deliveryAddress && Object.values(order.orderDetails.deliveryAddress).some(value => 
                      typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
                    ) && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address matched your search
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Details
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    <b>ID:</b> {order.transactionId}
                  </Typography>
                </Box>
              )}
              
              {/* View Full Details Button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewOrderDetails(order)}
                >
                  View Full Details
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </CardStyled>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <PageHeader>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Orders Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </PageHeader>
      
      {/* Filters Section */}
      <FilterSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} /> 
            Filters & Sorting
          </Typography>
          
          <Box>
            <Button
              size="small"
              startIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ mr: 1 }}
            >
              {filtersOpen ? 'Hide' : 'Show'} Filters
            </Button>
            
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<Close />}
            >
              Clear
            </Button>
          </Box>
        </Box>
        
        <Collapse in={filtersOpen}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by order #, customer, items, address or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Sort By */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <Sort />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="highest">Highest Amount</MenuItem>
                  <MenuItem value="lowest">Lowest Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Date Range */}
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant={showDateRange ? "contained" : "outlined"}
                color="primary"
                startIcon={<CalendarMonth />}
                onClick={() => setShowDateRange(!showDateRange)}
                size="medium"
                sx={{ height: '40px' }}
              >
                {dateRange[0] && dateRange[1] 
                  ? `${dateRange[0].format('DD/MM/YY')} - ${dateRange[1].format('DD/MM/YY')}` 
                  : "Date Range"}
              </Button>
            </Grid>
            
            {/* Delivery Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Delivery Status</InputLabel>
                <Select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  label="Delivery Status"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="added">Delivery Set</MenuItem>
                  <MenuItem value="notadded">No Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Payment Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {showDateRange && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Select Date Range</Typography>
                  <Space direction="vertical" size={12}>
                    <DatePicker.RangePicker
                      value={dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : null}
                      onChange={(dates) => setDateRange(dates)}
                      style={{ width: '100%' }}
                    />
                  </Space>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </FilterSection>
      
      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredOrders.length} of {orders.length} orders
        </Typography>
        
        <Box>
          <Tooltip title="Latest Orders">
            <IconButton 
              color={sortBy === 'latest' ? 'primary' : 'default'}
              onClick={() => setSortBy('latest')}
              size="small"
            >
              <ArrowDownward />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Oldest Orders">
            <IconButton 
              color={sortBy === 'oldest' ? 'primary' : 'default'}
              onClick={() => setSortBy('oldest')}
              size="small"
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : filteredOrders.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No orders found matching the current filters.
        </Alert>
      ) : (
        <>
          {/* Mobile/Tablet View - Card Layout */}
          {isMedium ? (
            <Box>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          ) : (
            /* Desktop View - Table Layout */
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer>
                <Table stickyHeader aria-label="orders table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Payment</TableCell>
                      <TableCell align="center">Delivery</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => (
                        <TableRow 
                          key={order.id}
                          hover
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: theme.palette.action.hover }
                          }}
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getOrderDate(order).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getOrderDate(order).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.orderDetails?.personalInfo?.phone || order.customerPhone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              ₹{order.orderDetails?.totalAmount?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {/* Display paymentStatus as status (swapped as requested) */}
                            {getStatusChip(order.paymentStatus || 'PENDING')}
                          </TableCell>
                          <TableCell align="center">
                            {/* Display status as paymentStatus (swapped as requested) */}
                            {getStatusChip(order.status || 'PENDING')}
                          </TableCell>
                          <TableCell align="center">
                            {order.deliveryDetails ? (
                              <Tooltip title={`${order.deliveryDetails.company} - ${order.deliveryDetails.consignmentNumber}`}>
                                <Chip 
                                  icon={<LocalShipping />} 
                                  label="Set" 
                                  color="info" 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrderForDelivery(order.id);
                                    setDeliveryDialogOpen(true);
                                  }} 
                                />
                              </Tooltip>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LocalShipping />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderForDelivery(order.id);
                                  setDeliveryDialogOpen(true);
                                }}
                              >
                                Add
                              </Button>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS'}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handlePaymentToggle(order.id, order.paymentStatus);
                                    }}
                                    color="success"
                                    size="small"
                                  />
                                }
                                label="Paid"
                                onClick={(e) => e.stopPropagation()}
                              />
                              
                              <IconButton 
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOrderDetails(order);
                                }}
                                size="small"
                              >
                                <KeyboardArrowRight />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Paper>
          )}
        </>
      )}
      
      {/* Delivery Details Dialog */}
      <DeliveryDetailsDialog
        open={deliveryDialogOpen}
        onClose={() => setDeliveryDialogOpen(false)}
        orderId={selectedOrderForDelivery}
        onSave={handleSaveDeliveryDetails}
        initialData={selectedOrderForDelivery ? deliveryDetailsMap[selectedOrderForDelivery] : null}
      />
      
      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        order={selectedOrderForDetails}
        searchQuery={searchQuery}
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
    </Container>
  );
};

export default AdminOrders;