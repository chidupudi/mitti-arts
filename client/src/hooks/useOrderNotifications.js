// Hook for listening to new orders and sending email notifications
import { useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import { sendNewOrderNotification } from '../utils/emailService';

export const useOrderNotifications = () => {
  const lastOrderTimeRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Set up real-time listener for new orders
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      orderBy('createdAt', 'desc'), 
      limit(5) // Listen to latest 5 orders to catch new ones
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Skip initial load to avoid sending notifications for existing orders
      if (isInitialLoadRef.current) {
        if (!snapshot.empty) {
          // Set the latest order time as reference point
          const latestOrder = snapshot.docs[0].data();
          lastOrderTimeRef.current = latestOrder.createdAt;
        }
        isInitialLoadRef.current = false;
        return;
      }

      // Check for new orders
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const newOrder = { id: change.doc.id, ...change.doc.data() };
          
          // Check if this is truly a new order (not from initial load)
          const orderTime = newOrder.createdAt;
          
          if (lastOrderTimeRef.current && orderTime && 
              orderTime.seconds > lastOrderTimeRef.current.seconds) {
            
            console.log('🔔 NEW ORDER DETECTED:', newOrder.orderNumber);
            
            // Send email notification
            try {
              const emailResult = await sendNewOrderNotification(newOrder);
              
              if (emailResult.success) {
                console.log('✅ Email notification sent for order:', newOrder.orderNumber);
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                  new Notification('New Order Received!', {
                    body: `Order #${newOrder.orderNumber} - ₹${newOrder.orderDetails?.totalAmount?.toFixed(2)}`,
                    icon: '/logo192.png',
                    tag: 'new-order',
                    requireInteraction: true
                  });
                }
              } else {
                console.error('❌ Failed to send email notification:', emailResult.error);
              }
            } catch (error) {
              console.error('❌ Error sending notification:', error);
            }
          }
          
          // Update reference time
          lastOrderTimeRef.current = orderTime;
        }
      });
    }, (error) => {
      console.error('❌ Error listening to orders:', error);
    });

    return () => unsubscribe();
  }, []);

  // Request notification permission on first use
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  return {};
};