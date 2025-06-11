// Updated useOrderManagement.js with proper order status flow
import { useState } from 'react';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, getDoc, increment, writeBatch, Timestamp, serverTimestamp } from 'firebase/firestore';

export const useOrderManagement = () => {
  // Independent check-in statuses
  const [checkInStatuses, setCheckInStatuses] = useState({});
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

  // Get the next status based on current status and action
  const getNextStatus = (currentStatus, action) => {
    const statusFlow = {
      'PENDING': { checkIn: 'CHECKED_IN' },
      'PROCESSING': { checkIn: 'CHECKED_IN' },
      'CHECKED_IN': { addDelivery: 'IN_TRANSIT', uncheck: 'PROCESSING' },
      'IN_TRANSIT': { deliver: 'DELIVERED' },
      'DELIVERED': { /* final state */ }
    };

    return statusFlow[currentStatus]?.[action] || currentStatus;
  };

  // Handle check-in toggle with proper status flow
  const handleCheckInToggle = async (orderId) => {
    try {
      const currentCheckInStatus = checkInStatuses[orderId] || false;
      const newCheckInStatus = !currentCheckInStatus;
      
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();
      
      let newStatus = orderData.status || 'PROCESSING';
      
      // Determine new status based on check-in action
      if (newCheckInStatus) {
        // Checking in - move to CHECKED_IN
        newStatus = getNextStatus(newStatus, 'checkIn');
      } else {
        // Unchecking - move back to PROCESSING (only if currently CHECKED_IN)
        if (newStatus === 'CHECKED_IN') {
          newStatus = getNextStatus(newStatus, 'uncheck');
        }
      }
      
      await updateDoc(orderRef, {
        adminCheckIn: newCheckInStatus,
        status: newStatus, // Update order status
        adminCheckInDate: newCheckInStatus ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setCheckInStatuses(prev => ({
        ...prev,
        [orderId]: newCheckInStatus
      }));
      
      setSnackbar({
        open: true,
        message: `Order ${newCheckInStatus ? 'checked in' : 'unchecked'} successfully - Status: ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating check-in status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating check-in status',
        severity: 'error'
      });
    }
  };

  // Save delivery details and update status to IN_TRANSIT
  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();
      
      // Only allow adding delivery details if order is CHECKED_IN
      if (orderData.status !== 'CHECKED_IN') {
        setSnackbar({
          open: true,
          message: 'Order must be checked in before adding delivery details',
          severity: 'warning'
        });
        return;
      }
      
      await updateDoc(orderRef, {
        deliveryDetails: details,
        status: 'IN_TRANSIT', // Update status to IN_TRANSIT
        deliveryStatus: 'DISPATCHED',
        dispatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setSnackbar({
        open: true,
        message: 'Delivery details updated successfully - Status: IN_TRANSIT',
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

  // Mark order as delivered - final status
  const handleMarkDelivered = async (orderId) => {
    if (processingOrder === orderId) return;
    
    try {
      setProcessingOrder(orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      const orderData = orderDoc.data();
      
      // Only allow delivery if order is IN_TRANSIT
      if (orderData.status !== 'IN_TRANSIT') {
        setSnackbar({
          open: true,
          message: 'Order must be in transit before marking as delivered',
          severity: 'warning'
        });
        return;
      }
      
      await updateDoc(orderRef, {
        status: 'DELIVERED', // Final status
        deliveryStatus: 'DELIVERED',
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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

  // Function to restore stock when order is cancelled
  const restoreStockForOrder = async (orderData) => {
    const batch = writeBatch(db);
    let hasUpdates = false;

    // Get items from order
    let items = [];
    if (orderData.orderDetails?.items?.length > 0) {
      items = orderData.orderDetails.items;
    } else if (orderData.orderDetails?.cartData?.items?.length > 0) {
      items = orderData.orderDetails.cartData.items;
    } else if (orderData.items?.length > 0) {
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
        stock: increment(item.quantity),
        updatedAt: serverTimestamp()
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
        deliveryStatus: 'CANCELLED',
        adminCheckIn: false,
        cancelledAt: serverTimestamp(),
        cancelledBy: 'admin',
        updatedAt: serverTimestamp()
      });

      // Update local check-in status
      setCheckInStatuses(prev => ({
        ...prev,
        [orderId]: false
      }));
      
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

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    checkInStatuses,
    setCheckInStatuses,
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
    handleCheckInToggle,
    handleSaveDeliveryDetails,
    handleMarkDelivered,
    handleCancelOrder,
    handleCloseSnackbar,
  };
};