import { useState } from 'react';
import { db } from '../Firebase/Firebase';
import { doc, updateDoc, getDoc, increment, writeBatch } from 'firebase/firestore';

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

  // Handle payment status toggle
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

  // Save delivery details
  const handleSaveDeliveryDetails = async (orderId, details) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryDetails: details
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

  // Mark order as delivered
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
    handleCloseSnackbar,
  };
};