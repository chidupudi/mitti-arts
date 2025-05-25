// Updated OrdersCards.js with cancel order functionality
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  FormControlLabel,
  Switch,
  IconButton,
  Collapse,
  Divider,
  Paper,
  List,
  ListItem,
  TablePagination,
  Alert,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  ShoppingCart,
  CancelOutlined,
  Cancel,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

// Get status chip component
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

const CardStyled = styled(Card)(({ theme, status, iscancelled }) => ({
  marginBottom: theme.spacing(2),
  borderLeft: `5px solid ${
    iscancelled === 'true'
      ? theme.palette.error.main
      : status === 'DELIVERED' 
        ? theme.palette.success.main 
        : status === 'CONFIRMED' 
          ? theme.palette.info.main 
          : status === 'CANCELLED' 
            ? theme.palette.error.main 
            : theme.palette.warning.main
  }`,
  transition: 'all 0.3s ease',
  borderRadius: 16,
  opacity: iscancelled === 'true' ? 0.7 : 1,
  '&:hover': {
    boxShadow: '0 8px 40px rgba(210, 105, 30, 0.12)',
    transform: iscancelled === 'true' ? 'none' : 'translateY(-3px)'
  }
}));

const OrderCard = ({ 
  order, 
  isExpanded, 
  onToggleExpand, 
  searchQuery,
  deliveryDetailsMap,
  handlePaymentToggle,
  handleMarkDelivered,
  handleViewOrderDetails,
  handleCancelOrderClick, // New prop for cancel order
  setSelectedOrderForDelivery,
  setDeliveryDialogOpen,
}) => {
  const theme = useTheme();
  const hasDeliveryDetails = !!order.deliveryDetails;
  const isCancelled = order.status === 'CANCELLED' || order.paymentStatus === 'CANCELLED';

  return (
    <CardStyled status={order.status} iscancelled={isCancelled.toString()}>
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
            {isCancelled && (
              <Chip 
                label="CANCELLED" 
                color="error" 
                size="small" 
                sx={{ mt: 1, fontWeight: 'bold' }}
              />
            )}
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
                : order.paymentStatus === 'FAILED' || order.paymentStatus === 'CANCELLED'
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
                      : order.deliveryStatus === 'CANCELLED'
                        ? 'error'
                        : 'default'
              }
              size="small"
            />
          )}
          
          {/* Delivery details indicator */}
          {hasDeliveryDetails && !order.deliveryStatus && !isCancelled && (
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isCancelled && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS'}
                      onChange={() => handlePaymentToggle(order.id, order.paymentStatus)}
                      color="success"
                      size="small"
                    />
                  }
                  label="Paid"
                />
                
                {/* Cancel Order Button */}
                <Tooltip title="Cancel Order">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelOrderClick(order);
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.08)'
                      }
                    }}
                  >
                    <CancelOutlined />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          
          <Box>
            <Button
              size="small"
              startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
              onClick={onToggleExpand}
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
            {/* Show cancellation info if cancelled */}
            {isCancelled && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'error.50', borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                    Order Cancelled
                  </Typography>
                </Box>
                <Typography variant="body2" color="error.main">
                  This order has been cancelled. 
                  {order.cancelledAt && (
                    <> Cancelled on: {new Date(order.cancelledAt.seconds * 1000).toLocaleString()}</>
                  )}
                </Typography>
                {order.cancelledBy && (
                  <Typography variant="caption" color="text.secondary">
                    Cancelled by: {order.cancelledBy}
                  </Typography>
                )}
              </Box>
            )}

            {/* Delivery Details - only show if not cancelled */}
            {!isCancelled && (
              <>
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
              </>
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

const OrdersCards = ({
  filteredOrders,
  page,
  rowsPerPage,
  expandedOrderId,
  setExpandedOrderId,
  searchQuery,
  deliveryDetailsMap,
  handlePaymentToggle,
  handleMarkDelivered,
  handleViewOrderDetails,
  handleCancelOrderClick, // New prop for cancel order
  setSelectedOrderForDelivery,
  setDeliveryDialogOpen,
  handleChangePage,
  handleChangeRowsPerPage,
  error,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '2px dashed', borderColor: 'grey.300' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No orders found matching the current filters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search criteria or filters to find orders.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {filteredOrders
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(order => (
          <OrderCard 
            key={order.id} 
            order={order}
            isExpanded={expandedOrderId === order.id}
            onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
            searchQuery={searchQuery}
            deliveryDetailsMap={deliveryDetailsMap}
            handlePaymentToggle={handlePaymentToggle}
            handleMarkDelivered={handleMarkDelivered}
            handleViewOrderDetails={handleViewOrderDetails}
            handleCancelOrderClick={handleCancelOrderClick} // Pass cancel handler
            setSelectedOrderForDelivery={setSelectedOrderForDelivery}
            setDeliveryDialogOpen={setDeliveryDialogOpen}
          />
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
  );
};

export default OrdersCards;