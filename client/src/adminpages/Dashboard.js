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
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  Tooltip,
  Badge,
  Fade,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Container,
  AppBar,
  Toolbar
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
  InventoryRounded,
  Analytics,
  AttachMoney,
  Schedule,
  NotificationsActive,
  ExpandMore,
  ExpandLess,
  Dashboard as DashboardIcon,
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  ViewModule,
  Assessment,
  TrendingDown,
  Warning
} from '@mui/icons-material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, collection, getDocs, onSnapshot, getDoc, increment, writeBatch } from 'firebase/firestore';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

// Custom Terracotta Theme
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
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
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
  },
});

// Enhanced Styled Components
const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: '#FFFFFF',
  minHeight: 140,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)',
  },
}));

const ModernPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
}));

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

// Enhanced utility functions
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Admin Header Component
const AdminHeader = ({ currentPage = 'dashboard' }) => {
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
          {/* Header Content */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            gap: isMobile ? 1 : 0
          }}>
            {/* Title Section */}
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

            {/* Navigation Buttons */}
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

// Enhanced Delivery Details Dialog
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            {initialData ? 'Update Delivery Details' : 'Add Delivery Details'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
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
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {initialData ? 'Update' : 'Save'} Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const isMobile = useMediaQuery(terracottaTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(terracottaTheme.breakpoints.down('lg'));

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
    monthlyGrowth: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [userMap, setUserMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [deliveryDetailsMap, setDeliveryDetailsMap] = useState({});
  const [deliveredOrders, setDeliveredOrders] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [processingOrder, setProcessingOrder] = useState(null);

  // Event Handlers
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
    if (processingOrder === orderId) return;
    
    try {
      setProcessingOrder(orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.data();
      
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
      
      const batch = writeBatch(db);
      let hasUpdates = false;
      
      for (const item of items) {
        const productId = item.id || item.productId;
        
        if (!productId) {
          console.warn('Product ID not found for item:', item);
          continue;
        }
        
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) {
          console.warn(`Product ${productId} not found in database`);
          continue;
        }
        
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
        
        console.log(`Updating stock for product ${productId}, decreasing by ${item.quantity}`);
        hasUpdates = true;
      }
      
      batch.update(orderRef, {
        deliveryStatus: 'DELIVERED',
        deliveredAt: new Date(),
      });
      
      await batch.commit();
      
      setDeliveredOrders(prev => ({
        ...prev,
        [orderId]: true
      }));
      
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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Data fetching effects
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
      let pendingOrders = 0;
      let completedOrders = 0;
      const newDeliveryDetails = {};
      const newDeliveredOrders = {};
      
      snap.docs.forEach((doc) => {
        const data = doc.data();
        const orderAmount = data?.orderDetails?.totalAmount || 0;
        sales += orderAmount;
        
        // Count order statuses
        if (data.paymentStatus === 'COMPLETED') {
          completedOrders++;
        } else {
          pendingOrders++;
        }
        
        const orderDate = getOrderDate(data);
        const dateString = orderDate.toLocaleDateString();
        
        const found = orderTrends.find(o => o.date === dateString);
        if (found) {
          found.amount += orderAmount;
          found.count += 1;
        } else {
          orderTrends.push({ 
            date: dateString, 
            amount: orderAmount, 
            count: 1,
            formattedDate: orderDate.toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short' 
            })
          });
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
        orderTrends: orderTrends.slice(-10), // Last 10 days
        recentOrders: recentOrders.slice(0, 10), // Top 10 recent orders
        pendingOrders,
        completedOrders,
        monthlyGrowth: orderTrends.length > 1 ? 
          ((orderTrends[orderTrends.length - 1]?.amount || 0) - (orderTrends[0]?.amount || 0)) / (orderTrends[0]?.amount || 1) * 100 : 0
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

  // Chart configurations
  const salesChartData = {
    labels: stats.orderTrends.map(o => o.formattedDate),
    datasets: [{
      label: 'Sales Amount',
      data: stats.orderTrends.map(o => o.amount),
      fill: true,
      backgroundColor: 'rgba(210, 105, 30, 0.1)',
      borderColor: '#D2691E',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: '#D2691E',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 6,
    }],
  };

  const ordersChartData = {
    labels: stats.orderTrends.map(o => o.formattedDate),
    datasets: [{
      label: 'Order Count',
      data: stats.orderTrends.map(o => o.count),
      backgroundColor: '#8B4513',
      borderColor: '#8B4513',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const statusChartData = {
    labels: ['Completed', 'Pending', 'Delivered'],
    datasets: [{
      data: [stats.completedOrders, stats.pendingOrders, Object.keys(deliveredOrders).length],
      backgroundColor: ['#6B7821', '#FF8F00', '#0277BD'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const filteredOrders = stats.recentOrders.filter(order => {
    if (!dateFilter) return true;
    const orderDate = getOrderDate(order);
    const filterDate = new Date(dateFilter);
    return (
      orderDate.getDate() === filterDate.getDate() &&
      orderDate.getMonth() === filterDate.getMonth() &&
      orderDate.getFullYear() === filterDate.getFullYear()
    );
  });

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        pb: 4
      }}>
        {/* Admin Header Component */}
        <AdminHeader currentPage="dashboard" />

        <Container maxWidth="xl">
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '60vh',
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading dashboard data...
              </Typography>
            </Box>
          ) : (
            <Fade in={!loading} timeout={800}>
              <Grid container spacing={3}>
                {/* Main Statistics Cards */}
                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #D2691E 0%, #F4A460 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <People sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.users.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Total Users
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Active customers
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #8B4513 0%, #CD853F 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <Store sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.products.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Products
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          In inventory
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <AssignmentTurnedIn sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.orders.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Total Orders
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          All time
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                {/* Additional Stats Cards - Matching gradient style */}
                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <Schedule sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.pendingOrders}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Pending Orders
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Awaiting payment
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <CheckCircle sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.completedOrders}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Completed Orders
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Payment received
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <GradientCard gradient="linear-gradient(135deg, #C62828 0%, #EF5350 100%)">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 64, 
                        height: 64,
                        mr: 2
                      }}>
                        <Favorite sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stats.wishlist}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Wishlist Items
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          Customer favorites
                        </Typography>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Grid>

                {/* Charts Section */}
                <Grid item xs={12} lg={8}>
                  <ModernPaper sx={{ p: 3, height: 400 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrendingUp sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Sales Analytics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Revenue trends over the last 10 days
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip 
                          label={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`}
                          color={stats.monthlyGrowth > 0 ? 'success' : 'error'}
                          icon={stats.monthlyGrowth > 0 ? <TrendingUp /> : <TrendingDown />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ height: 280 }}>
                      <Line data={salesChartData} options={chartOptions} />
                    </Box>
                  </ModernPaper>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <ModernPaper sx={{ p: 3, height: 400 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Analytics sx={{ color: 'secondary.main', mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Order Status
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current distribution
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ height: 280 }}>
                      <Doughnut 
                        data={statusChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }} 
                      />
                    </Box>
                  </ModernPaper>
                </Grid>

                {/* Order Trends Chart */}
                <Grid item xs={12} lg={6}>
                  <ModernPaper sx={{ p: 3, height: 350 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Assessment sx={{ color: 'info.main', mr: 2, fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Daily Order Count
                      </Typography>
                    </Box>
                    <Box sx={{ height: 250 }}>
                      <Bar data={ordersChartData} options={chartOptions} />
                    </Box>
                  </ModernPaper>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} lg={6}>
                  <ModernPaper sx={{ p: 3, height: 350 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <ViewModule sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Top Wishlisted Products
                      </Typography>
                    </Box>
                    <List>
                      {stats.topProducts.length === 0 ? (
                        <ListItem>
                          <ListItemText primary="No data available" />
                        </ListItem>
                      ) : (
                        stats.topProducts.map((prod, index) => (
                          <ListItem key={prod.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar
                                src={prod.imgUrl || (prod.images?.[0] || '')}
                                alt={prod.name}
                                sx={{ 
                                  width: 48, 
                                  height: 48,
                                  bgcolor: 'primary.light'
                                }}
                              >
                                {prod.name?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography fontWeight="bold">
                                  {prod.name}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  {prod.code} • {formatCurrency(prod.price || 0)}
                                </Typography>
                              }
                            />
                            <Box textAlign="center">
                              <Typography variant="h6" fontWeight="bold" color="error.main">
                                {prod.wishlistCount}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                wishes
                              </Typography>
                            </Box>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </ModernPaper>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12}>
                  <ModernPaper sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      flexWrap: 'wrap',
                      gap: 2,
                      mb: 3 
                    }}>
                      <ShoppingCart sx={{ color: 'success.main', fontSize: 28 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" fontWeight="bold">
                          Recent Orders
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage and track customer orders
                        </Typography>
                      </Box>
                      
                      <DatePicker
                        value={dateFilter ? moment(dateFilter) : null}
                        onChange={(date) => setDateFilter(date ? date.toDate() : null)}
                        suffixIcon={<CalendarOutlined style={{ color: terracottaTheme.palette.primary.main }} />}
                        style={{ 
                          width: isMobile ? '100%' : 200,
                          borderRadius: 8
                        }}
                        allowClear
                        format="DD/MM/YYYY"
                        placeholder="Filter by date"
                      />
                    </Box>

                    {filteredOrders.length === 0 ? (
                      <Box 
                        sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          color: 'text.secondary'
                        }}
                      >
                        <AssignmentTurnedIn sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6">
                          {dateFilter ? 'No orders found for selected date' : 'No recent orders'}
                        </Typography>
                        <Typography variant="body2">
                          Orders will appear here once customers start placing them
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {filteredOrders.map(order => {
                          const isDelivered = deliveredOrders[order.id];
                          const isPaid = paymentStatuses[order.id];
                          const hasDeliveryDetails = deliveryDetailsMap[order.id];
                          const isExpanded = expandedOrder === order.id;

                          return (
                            <Grid item xs={12} lg={6} xl={4} key={order.id}>
                              <Card
                                sx={{
                                  borderRadius: 3,
                                  border: `2px solid ${
                                    isDelivered 
                                      ? terracottaTheme.palette.success.light
                                      : isPaid 
                                        ? terracottaTheme.palette.primary.light
                                        : terracottaTheme.palette.warning.light
                                  }`,
                                  background: isDelivered 
                                    ? 'linear-gradient(145deg, #E8F5E9 0%, #F1F8E9 100%)'
                                    : isPaid 
                                      ? 'linear-gradient(145deg, #FFF8E1 0%, #FFFDE7 100%)'
                                      : 'linear-gradient(145deg, #FFF3E0 0%, #FFF8E1 100%)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: terracottaTheme.shadows[8],
                                  },
                                }}
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  {/* Order Header */}
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                      <Typography 
                                        variant="h6" 
                                        fontWeight="bold"
                                        color={
                                          isDelivered 
                                            ? 'success.main'
                                            : isPaid 
                                              ? 'primary.main' 
                                              : 'warning.main'
                                        }
                                      >
                                        #{order.id.slice(-8).toUpperCase()}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {getOrderDate(order).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      {isDelivered ? (
                                        <Chip
                                          label="Delivered"
                                          color="success"
                                          icon={<CheckCircle />}
                                          size="small"
                                          sx={{ fontWeight: 'bold' }}
                                        />
                                      ) : (
                                        <Chip
                                          label={isPaid ? 'Paid' : 'Pending'}
                                          color={isPaid ? 'primary' : 'warning'}
                                          size="small"
                                          sx={{ fontWeight: 'bold' }}
                                        />
                                      )}
                                      <IconButton
                                        size="small"
                                        sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                                      >
                                        <ExpandMore />
                                      </IconButton>
                                    </Box>
                                  </Box>

                                  {/* Customer Info */}
                                  <Box mb={2}>
                                    <Typography variant="body1" fontWeight="600">
                                      {order.orderDetails?.personalInfo?.fullName || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatCurrency(order.orderDetails?.totalAmount || 0)}
                                      {order.orderDetails?.items && (
                                        <> • {order.orderDetails.items.length} item{order.orderDetails.items.length !== 1 ? 's' : ''}</>
                                      )}
                                    </Typography>
                                  </Box>

                                  {/* Payment Toggle */}
                                  {!isDelivered && (
                                    <Box mb={2}>
                                      <FormControlLabel
                                        control={
                                          <Switch
                                            checked={isPaid}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handlePaymentToggle(order.id);
                                            }}
                                            color="success"
                                          />
                                        }
                                        label={
                                          <Typography variant="body2" fontWeight="600">
                                            Payment {isPaid ? 'Completed' : 'Pending'}
                                          </Typography>
                                        }
                                      />
                                    </Box>
                                  )}

                                  {/* Delivery Section */}
                                  {isPaid && !isDelivered && (
                                    <Box mb={2}>
                                      {hasDeliveryDetails ? (
                                        <Box sx={{ 
                                          p: 2, 
                                          background: 'rgba(255,255,255,0.7)', 
                                          borderRadius: 2,
                                          border: `1px solid ${terracottaTheme.palette.divider}`
                                        }}>
                                          <Box display="flex" alignItems="center" mb={1}>
                                            <LocalShipping sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                                            <Typography variant="subtitle2" fontWeight="bold">
                                              Delivery Details
                                            </Typography>
                                          </Box>
                                          <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>{hasDeliveryDetails.company}</strong><br />
                                            Tracking: {hasDeliveryDetails.consignmentNumber}
                                          </Typography>
                                          
                                          <Box display="flex" gap={1}>
                                            <Button 
                                              size="small" 
                                              variant="outlined"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOrderForDelivery(order.id);
                                                setDeliveryDialogOpen(true);
                                              }}
                                            >
                                              Update
                                            </Button>
                                            <Button
                                              size="small" 
                                              variant="contained"
                                              color="success"
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
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          startIcon={<LocalShipping />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrderForDelivery(order.id);
                                            setDeliveryDialogOpen(true);
                                          }}
                                          fullWidth
                                        >
                                          Add Delivery Details
                                        </Button>
                                      )}
                                    </Box>
                                  )}

                                  {/* Delivered Status */}
                                  {isDelivered && (
                                    <Box sx={{ 
                                      p: 2, 
                                      background: 'rgba(46, 125, 50, 0.1)', 
                                      borderRadius: 2,
                                      border: `1px solid ${terracottaTheme.palette.success.light}`
                                    }}>
                                      <Box display="flex" alignItems="center">
                                        <InventoryRounded sx={{ color: 'success.main', mr: 1 }} />
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                          Delivered & Stock Updated
                                        </Typography>
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        {order.deliveredAt 
                                          ? new Date(order.deliveredAt.seconds * 1000).toLocaleString('en-IN')
                                          : 'Recently delivered'
                                        }
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Expanded Details */}
                                  <Collapse in={isExpanded} timeout={300}>
                                    <Box mt={3}>
                                      <Divider sx={{ mb: 2 }} />
                                      
                                      {/* Contact Information */}
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Contact Information
                                      </Typography>
                                      <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={6}>
                                          <Box display="flex" alignItems="center">
                                            <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              {order.orderDetails?.personalInfo?.phone || 'N/A'}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                          <Box display="flex" alignItems="center">
                                            <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                              {order.orderDetails?.personalInfo?.email || 'N/A'}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      </Grid>

                                      {/* Delivery Address */}
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Delivery Address
                                      </Typography>
                                      <Box display="flex" alignItems="flex-start" mb={2}>
                                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.5 }} />
                                        <Typography variant="body2">
                                          {order.orderDetails?.deliveryAddress?.addressLine1 || 'N/A'}<br />
                                          {order.orderDetails?.deliveryAddress?.addressLine2 && (
                                            <>{order.orderDetails.deliveryAddress.addressLine2}<br /></>
                                          )}
                                          {order.orderDetails?.deliveryAddress?.landmark && (
                                            <>Landmark: {order.orderDetails.deliveryAddress.landmark}<br /></>
                                          )}
                                          {order.orderDetails?.deliveryAddress?.city}, {order.orderDetails?.deliveryAddress?.state}<br />
                                          Pincode: {order.orderDetails?.deliveryAddress?.pincode}
                                        </Typography>
                                      </Box>

                                      {/* Order Items */}
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Order Items
                                      </Typography>
                                      <List dense>
                                        {order.orderDetails?.items?.map((item, index) => (
                                          <ListItem key={index} sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                              <Avatar 
                                                src={item.image || ''} 
                                                sx={{ width: 40, height: 40 }}
                                              >
                                                {item.name?.[0]}
                                              </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                              primary={
                                                <Typography variant="body2" fontWeight="600">
                                                  {item.name}
                                                </Typography>
                                              }
                                              secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                  {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                                                </Typography>
                                              }
                                            />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Box>
                                  </Collapse>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                  </ModernPaper>
                </Grid>
              </Grid>
            </Fade>
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

export default Dashboard;