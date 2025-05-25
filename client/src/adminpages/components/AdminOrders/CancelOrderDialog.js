// CancelOrderDialog.js - Dialog for order cancellation confirmation
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Cancel,
  Warning,
  MoneyOff,
  Inventory,
} from '@mui/icons-material';

const CancelOrderDialog = ({ open, onClose, order, onConfirm }) => {
  if (!order) return null;

  const isOrderPaid = order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS';
  const orderAmount = order.orderDetails?.totalAmount || 0;
  const items = order.orderDetails?.items || order.orderDetails?.cartData?.items || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, bgcolor: 'error.main', color: 'white' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Cancel />
          Cancel Order Confirmation
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Warning />
            <Typography variant="subtitle1" fontWeight="bold">
              This action cannot be undone!
            </Typography>
          </Box>
          <Typography variant="body2">
            Cancelling this order will permanently change its status and cannot be reversed.
          </Typography>
        </Alert>

        {/* Order Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Order ID:</Typography>
            <Typography variant="body2" fontWeight="bold">#{order.orderNumber || order.id?.slice(-8)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Customer:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {order.orderDetails?.personalInfo?.fullName || order.customerName || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">Order Amount:</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              ₹{orderAmount.toFixed(2)}
            </Typography>
          </Box>

          {/* Payment Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2">Payment Status:</Typography>
            <Chip 
              label={order.paymentStatus || 'PENDING'} 
              color={isOrderPaid ? 'success' : 'warning'} 
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Impact of Cancellation */}
        <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
          What will happen when you cancel this order?
        </Typography>

        <List dense>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel color="error" fontSize="small" />
                  <Typography variant="body2">
                    Order status will be changed to "CANCELLED"
                  </Typography>
                </Box>
              }
            />
          </ListItem>

          {isOrderPaid && (
            <>
              <ListItem sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyOff color="warning" fontSize="small" />
                      <Typography variant="body2">
                        Payment status will be marked as "CANCELLED"
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>

              <ListItem sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Inventory color="info" fontSize="small" />
                      <Typography variant="body2">
                        Product stock will be restored for all items
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </>
          )}

          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  • Customer will need to be notified separately about the cancellation
                </Typography>
              }
            />
          </ListItem>

          {isOrderPaid && (
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    • You may need to process a refund through your payment gateway
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>

        {/* Items that will be restocked */}
        {isOrderPaid && items.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.main' }}>
              Items that will be restocked:
            </Typography>
            <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              {items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" color="success.main">
                    +{item.quantity} stock
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
          <Typography variant="body2" fontWeight="bold" color="error.main">
            Are you sure you want to cancel this order?
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Keep Order
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<Cancel />}
          sx={{ minWidth: 120 }}
        >
          Cancel Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelOrderDialog;