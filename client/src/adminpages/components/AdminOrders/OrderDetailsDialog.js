import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  ReceiptLong,
  Person,
  LocationOn,
  LocalShipping,
} from '@mui/icons-material';

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

export default OrderDetailsDialog;