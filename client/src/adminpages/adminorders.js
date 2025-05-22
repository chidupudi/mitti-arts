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
  TablePagination,
  Avatar,
  AppBar,
  Toolbar
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
  ArrowBack,
  Dashboard as DashboardIcon,
  InventoryRounded,
  AssignmentTurnedIn,
  Inventory2,
  Store,
  ShoppingCart
} from '@mui/icons-material';

import { DatePicker, Space } from 'antd';
import moment from 'moment';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, where, Timestamp, writeBatch, getDoc, increment } from 'firebase/firestore';

// Terracotta Theme (matching dashboard and inventory)
const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#D2691E',
      light: '#F4A460',
      dark: '#A0522D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B4513',
      light: '#CD853F',
      dark: '#654321',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF0E6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3E2723',
      secondary: '#5D4037',
    },
    success: {
      main: '#6B7821',
      light: '#8BC34A',
    },
    warning: {
      main: '#FF8F00',
      light: '#FFB74D',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
    },
    info: {
      main: '#0277BD',
      light: '#29B6F6',
    },
    grey: {
      50: '#FAF0E6',
      100: '#F5EBE0',
      200: '#E8D5C4',
      300: '#DCC5A7',
      400: '#C4A47C',
      500: '#8B7355',
      600: '#6D5B47',
      700: '#5D4E42',
      800: '#3E2723',
      900: '#2E1A16',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(210, 105, 30, 0.08)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 40px rgba(210, 105, 30, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D2691E',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

// Styled Components with Terracotta Theme
const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: '#FFFFFF',
  minHeight: 80,
  borderRadius: '0 0 24px 24px',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    minHeight: 70,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
  },
}));

const NavigationButton = styled(Button)(({ theme, active }) => ({
  color: '#FFFFFF',
  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: 'translateY(-1px)',
  },
  borderRadius: 12,
  padding: '8px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: active ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: '6px 12px',
    minWidth: 'auto',
  },
}));

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
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(210, 105, 30, 0.08)',
  background: '#FFFFFF',
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
  borderRadius: 16,
  '&:hover': {
    boxShadow: '0 8px 40px rgba(210, 105, 30, 0.12)',
    transform: 'translateY(-3px)'
  }
}));

// Admin Header Component
const AdminHeader = ({ currentPage = 'adminorders' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      key: 'dashboard'
    },
    {
      label: 'Inventory',
      icon: <InventoryRounded />,
      path: '/inventory',
      key: 'inventory'
    },
    {
      label: 'Admin Orders',
      icon: <AssignmentTurnedIn />,
      path: '/adminorders',
      key: 'adminorders'
    }
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'inventory':
        return 'Inventory Management';
      case 'adminorders':
        return 'Order Management';
      default:
        return 'Admin Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 'inventory':
        return 'Manage your product inventory and stock levels';
      case 'adminorders':
        return 'Track and manage customer orders';
      default:
        return "Welcome back! Here's what's happening with your store today.";
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'transparent' }}>
      <Container maxWidth="xl">
        <HeaderToolbar>
          <Box sx={{ 
            display: 'flex', 
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            gap: isMobile ? 1 : 0
          }}>
            <Box sx={{ 
              flexGrow: 1,
              mb: isMobile ? 2 : 0
            }}>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {getPageTitle()}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9, 
                  mt: 0.5,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  display: isSmallMobile ? 'none' : 'block'
                }}
              >
                {getPageDescription()}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 1.5, md: 2 },
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}>
              {navigationItems.map((item) => (
                <NavigationButton
                  key={item.key}
                  startIcon={!isSmallMobile ? item.icon : null}
                  onClick={() => handleNavigation(item.path)}
                  active={currentPage === item.key}
                  size={isSmallMobile ? 'small' : 'medium'}
                >
                  {isSmallMobile ? item.icon : item.label}
                </NavigationButton>
              ))}
              
              <Tooltip title="Refresh Data">
                <IconButton 
                  color="inherit" 
                  onClick={() => window.location.reload()}
                  size={isSmallMobile ? 'small' : 'medium'}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ml: 1
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </HeaderToolbar>
      </Container>
    </AppBar>
  );
};

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShipping />
          {initialData ? 'Update Delivery Details' : 'Add Delivery Details'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
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
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
            },
          }}
        >
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
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        p: 3
      }}>
        <Box display="flex" alignItems="center">
          <ReceiptLong sx={{ mr: 1 }} />
          Order Details #{order.orderNumber}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
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
                {/* Delivery Status Chip */}
                {order.deliveryStatus && (
                  <Chip 
                    label={`Delivery: ${order.deliveryStatus}`} 
                    color={
                      order.deliveryStatus === 'DELIVERED' 
                        ? 'success' 
                        : order.deliveryStatus === 'IN_TRANSIT' 
                          ? 'info'
                          : order.deliveryStatus === 'DISPATCHED'
                            ? 'warning'
                            : 'default'
                    }
                    size="small"
                    icon={<LocalShipping />}
                  />
                )}
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
                borderRadius: 2,
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
                {/* Display Delivery Status */}
                {order.deliveryStatus && (
                  <Typography variant="body2">
                    <b>Delivery Status:</b> 
                    <Chip 
                      label={order.deliveryStatus} 
                      color={
                        order.deliveryStatus === 'DELIVERED' 
                          ? 'success' 
                          : order.deliveryStatus === 'IN_TRANSIT' 
                            ? 'info'
                            : order.deliveryStatus === 'DISPATCHED'
                              ? 'warning'
                              : 'default'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
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
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
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
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained" color="primary">
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

  // Handle delivery details update - Only saves delivery details
  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      // Update in Firestore - only delivery details, no status change
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
          order.id === orderId ? { 
            ...order, 
            deliveryDetails: details
          } : order
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

  // Handle mark as delivered - Similar to dashboard functionality
  const handleMarkDelivered = async (orderId) => {
    try {
      // Get the order data
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
      
      if (orderSnap.empty) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.docs[0].data();
      
      // Check for items in the order
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
        deliveredAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Commit all updates
      await batch.commit();
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { 
            ...order, 
            deliveryStatus: 'DELIVERED',
            deliveredAt: Timestamp.now()
          } : order
        )
      );
      
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
      case 'DISPATCHED':
        color = 'warning';
        break;
      case 'FAILED':
      case 'CANCELLED':
        color = 'error';
        break;
      case 'IN_TRANSIT':
        color = 'info';
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
        <CardContent sx={{ p: 3 }}>
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
          <Box sx={{ mt: 2 }}>
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
            
            {/* Delivery Status indicator */}
            {order.deliveryStatus && (
              <Chip 
                icon={<LocalShipping />}
                label={`Delivery: ${order.deliveryStatus}`}
                color={
                  order.deliveryStatus === 'DELIVERED' 
                    ? 'success' 
                    : order.deliveryStatus === 'IN_TRANSIT' 
                      ? 'info'
                      : order.deliveryStatus === 'DISPATCHED'
                        ? 'warning'
                        : 'default'
                }
                size="small"
              />
            )}
            
            {/* Delivery details indicator */}
            {hasDeliveryDetails && !order.deliveryStatus && (
              <Chip 
                icon={<LocalShipping />}
                label="Delivery Set"
                color="info"
                size="small"
              />
            )}
          </Box>
          
          {/* Actions Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: 'center' }}>
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
                sx={{ mr: 1 }}
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
            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {/* Delivery Details */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Delivery Information
              </Typography>
              
              {hasDeliveryDetails ? (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2">
                    <b>Company:</b> {order.deliveryDetails.company}
                  </Typography>
                  <Typography variant="body2">
                    <b>Tracking:</b> {order.deliveryDetails.consignmentNumber}
                  </Typography>
                  {order.deliveryStatus && (
                    <Typography variant="body2">
                      <b>Status:</b> {getStatusChip(order.deliveryStatus)}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedOrderForDelivery(order.id);
                        setDeliveryDialogOpen(true);
                      }}
                    >
                      Update Address
                    </Button>
                    
                    {order.deliveryStatus !== 'DELIVERED' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleMarkDelivered(order.id)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5D4E42 0%, #6B7821 100%)',
                          },
                        }}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    
                    {order.deliveryStatus === 'DELIVERED' && (
                      <Chip 
                        label="Delivered" 
                        color="success"
                        icon={<CheckCircle />}
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px dashed', borderColor: 'warning.main' }}>
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
                    sx={{ 
                      background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                      },
                    }}
                  >
                    Set Delivery Address
                  </Button>
                </Box>
              )}
              
              {/* Items Summary */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
                Order Items
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {(order.orderDetails?.items || []).map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.quantity} x {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Paper>
              
              {/* Search Match Highlights */}
              {searchQuery && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'primary.50', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Search Results
                  </Typography>
                  
                  {/* Item matches */}
                  {((order.orderDetails?.items || []).some(item => item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
                    <Box sx={{ mb: 1 }}>
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
                    <Box>
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
              
              {order.transactionId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Transaction Details
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <b>ID:</b> {order.transactionId}
                  </Typography>
                </Box>
              )}
              
              {/* View Full Details Button */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewOrderDetails(order)}
                  sx={{ 
                    background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                    },
                  }}
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
    <ThemeProvider theme={terracottaTheme}>
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        pb: 4
      }}>
        {/* Admin Header Component */}
        <AdminHeader currentPage="adminorders" />

        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
          {/* Filters Section */}
          <FilterSection>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                <FilterList sx={{ mr: 1, color: 'primary.main' }} /> 
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
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
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
              <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          ) : filteredOrders.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '2px dashed', borderColor: 'grey.300' }}>
              <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No orders found matching the current filters
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search criteria or filters to find orders.
              </Typography>
            </Paper>
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
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
                  <TableContainer>
                    <Table stickyHeader aria-label="orders table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Order #</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Customer</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Amount</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Payment</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Delivery</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell>
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
                                '&:hover': { backgroundColor: 'rgba(210, 105, 30, 0.04)' }
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
                                <Typography variant="body2" fontWeight="medium" color="primary.main">
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
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                                      
                                      {order.deliveryStatus !== 'DELIVERED' ? (
                                        <Tooltip title="Mark as Delivered">
                                          <IconButton
                                            size="small"
                                            color="success"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkDelivered(order.id);
                                            }}
                                          >
                                            <CheckCircle />
                                          </IconButton>
                                        </Tooltip>
                                      ) : (
                                        <Chip 
                                          label="Delivered" 
                                          color="success"
                                          icon={<CheckCircle />}
                                          size="small"
                                        />
                                      )}
                                    </Box>
                                    
                                    {order.deliveryStatus && (
                                      <Chip 
                                        label={order.deliveryStatus} 
                                        color={
                                          order.deliveryStatus === 'DELIVERED' 
                                            ? 'success' 
                                            : order.deliveryStatus === 'IN_TRANSIT' 
                                              ? 'info'
                                              : order.deliveryStatus === 'DISPATCHED'
                                                ? 'warning'
                                                : 'default'
                                        }
                                        size="small"
                                      />
                                    )}
                                  </Box>
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
                                    Set Address
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity} 
              elevation={6} 
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminOrders;