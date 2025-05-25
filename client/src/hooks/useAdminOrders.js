// Updated useAdminOrders.js with cancel order functionality
import { useState, useEffect } from 'react';
import { db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  where, 
  Timestamp, 
  writeBatch, 
  getDoc, 
  increment 
} from 'firebase/firestore';
import { useMediaQuery } from '@mui/material';
import { terracottaTheme } from '../theme/terracottaTheme';

// Utility function to get order date
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

export const useAdminOrders = () => {
  const isMobile = useMediaQuery(terracottaTheme.breakpoints.down('sm'));

  // Data states
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  
  // UI states
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDateRange, setShowDateRange] = useState(false);
  
  // Dialog states
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  
  // Data maps and notifications
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
    setPage(0);
  }, [orders, sortBy, searchQuery, dateRange, deliveryFilter, paymentStatusFilter, orderStatusFilter]);

  // Handle payment status toggle (for admin convenience)
  const handlePaymentToggle = async (orderId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' || currentStatus === 'SUCCESS' ? 'PENDING' : 'COMPLETED';
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        paymentStatus: newStatus,
        adminConfirmed: newStatus === 'COMPLETED',
        updatedAt: Timestamp.now()
      });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, paymentStatus: newStatus, adminConfirmed: newStatus === 'COMPLETED' } : order
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
      
      await updateDoc(orderRef, {
        deliveryDetails: details,
        deliveryStatus: 'DISPATCHED',
        dispatchedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setDeliveryDetailsMap(prev => ({
        ...prev,
        [orderId]: details
      }));
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { 
            ...order, 
            deliveryDetails: details,
            deliveryStatus: 'DISPATCHED'
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

  // Handle mark as delivered
  const handleMarkDelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        deliveryStatus: 'DELIVERED',
        status: 'COMPLETED',
        deliveredAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { 
            ...order, 
            deliveryStatus: 'DELIVERED',
            status: 'COMPLETED',
            deliveredAt: Timestamp.now()
          } : order
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Order marked as delivered successfully',
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

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.data();
      
      // If order was paid, restore the stock
      if (orderData.paymentStatus === 'COMPLETED' || orderData.paymentStatus === 'SUCCESS') {
        await restoreStockForOrder(orderData);
      }
      
      // Update order status to cancelled
      await updateDoc(orderRef, {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        deliveryStatus: 'CANCELLED',
        cancelledAt: Timestamp.now(),
        cancelledBy: 'admin',
        updatedAt: Timestamp.now()
      });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { 
            ...order, 
            status: 'CANCELLED',
            paymentStatus: 'CANCELLED',
            deliveryStatus: 'CANCELLED',
            cancelledAt: Timestamp.now()
          } : order
        )
      );
      
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully and stock restored',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to cancel order'}`,
        severity: 'error'
      });
    }
  };

  // Function to restore stock when order is cancelled
  const restoreStockForOrder = async (orderData) => {
    const batch = writeBatch(db);
    let hasUpdates = false;

    // Get items from order
    let items = [];
    if (orderData.orderDetails?.items && orderData.orderDetails.items.length > 0) {
      items = orderData.orderDetails.items;
    } else if (orderData.orderDetails?.cartData?.items && orderData.orderDetails.cartData.items.length > 0) {
      items = orderData.orderDetails.cartData.items;
    } else if (orderData.items && orderData.items.length > 0) {
      items = orderData.items;
    }

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
        stock: increment(item.quantity), // Add back to stock
        updatedAt: Timestamp.now()
      });
      
      hasUpdates = true;
    }

    if (hasUpdates) {
      await batch.commit();
      console.log('Stock restored for cancelled order');
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

  // View order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrderForDetails(order);
    setDetailsDialogOpen(true);
  };

  // Handle cancel order dialog
  const handleCancelOrderClick = (order) => {
    setSelectedOrderForCancel(order);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (selectedOrderForCancel) {
      await handleCancelOrder(selectedOrderForCancel.id);
      setCancelDialogOpen(false);
      setSelectedOrderForCancel(null);
    }
  };

  return {
    // Data states
    orders,
    filteredOrders,
    loading,
    error,
    
    // Filter states
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    deliveryFilter,
    setDeliveryFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    
    // UI states
    filtersOpen,
    setFiltersOpen,
    showDateRange,
    setShowDateRange,
    expandedOrderId,
    setExpandedOrderId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    
    // Dialog states
    deliveryDialogOpen,
    setDeliveryDialogOpen,
    selectedOrderForDelivery,
    setSelectedOrderForDelivery,
    detailsDialogOpen,
    setDetailsDialogOpen,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    cancelDialogOpen,
    setCancelDialogOpen,
    selectedOrderForCancel,
    setSelectedOrderForCancel,
    
    // Data maps
    deliveryDetailsMap,
    snackbar,
    
    // Action handlers
    handlePaymentToggle,
    handleSaveDeliveryDetails,
    handleMarkDelivered,
    handleCancelOrder,
    handleCancelOrderClick,
    handleConfirmCancelOrder,
    handleResetFilters,
    handleCloseSnackbar,
    handleChangePage,
    handleChangeRowsPerPage,
    handleViewOrderDetails,
  };
};