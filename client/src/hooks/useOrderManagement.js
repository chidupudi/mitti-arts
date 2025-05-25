// Updated useOrderManagement.js with proper order flow
import { useState } from 'react';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, getDoc, increment, writeBatch, Timestamp } from 'firebase/firestore';

export const useOrderManagement = () => {
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle payment status toggle (for admin convenience only)
  const handlePaymentToggle = async (orderId, currentPaymentStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderSnap.data();
      const isCurrentlyPaid = currentPaymentStatus === 'COMPLETED' || currentPaymentStatus === 'SUCCESS';
      const newStatus = isCurrentlyPaid ? 'PENDING' : 'COMPLETED';

      // If changing from paid to unpaid, we need to restore stock
      if (isCurrentlyPaid && !isCurrentlyPaid) {
        await restoreStockForOrder(orderData);
      }
      // If changing from unpaid to paid, we need to deduct stock
      else if (!isCurrentlyPaid && newStatus === 'COMPLETED') {
        await deductStockForOrder(orderData);
      }

      await updateDoc(orderRef, {
        paymentStatus: newStatus,
        adminConfirmed: newStatus === 'COMPLETED',
        updatedAt: Timestamp.now()
      });

      setPaymentStatuses(prev => ({ ...prev, [orderId]: newStatus === 'COMPLETED' }));
      
      setSnackbar({
        open: true,
        message: `Payment status updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Function to deduct stock when payment is confirmed
  const deductStockForOrder = async (orderData) => {
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

      const currentStock = productSnap.data().stock || 0;
      
      // Check if we have enough stock
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}, Required: ${item.quantity}`);
      }
      
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: Timestamp.now()
      });
      
      hasUpdates = true;
    }

    if (hasUpdates) {
      await batch.commit();
      console.log('Stock deducted for order items');
    }
  };

  // Function to restore stock when order is cancelled or payment fails
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

  // Cancel entire order
  const handleCancelOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      
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
        cancelledAt: Timestamp.now(),
        cancelledBy: 'admin',
        updatedAt: Timestamp.now()
      });
      
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
    } finally {
      setProcessingOrder(null);
    }
  };

  // Save delivery details
  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryDetails: details,
        deliveryStatus: 'DISPATCHED', // Set status when delivery details are added
        dispatchedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
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

  // Mark order as delivered (no stock changes here since already deducted)
  const handleMarkDelivered = async (orderId) => {
    if (processingOrder === orderId) return;
    
    try {
      setProcessingOrder(orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      await updateDoc(orderRef, {
        deliveryStatus: 'DELIVERED',
        status: 'COMPLETED', // Mark overall order as completed
        deliveredAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
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
    } finally {
      setProcessingOrder(null);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    paymentStatuses,
    setPaymentStatuses,
    expandedOrder,
    setExpandedOrder,
    dateFilter,
    setDateFilter,
    deliveryDialogOpen,
    setDeliveryDialogOpen,
    selectedOrderForDelivery,
    setSelectedOrderForDelivery,
    processingOrder,
    snackbar,
    handlePaymentToggle,
    handleSaveDeliveryDetails,
    handleMarkDelivered,
    handleCancelOrder, // New cancel function
    handleCloseSnackbar,
  };
};