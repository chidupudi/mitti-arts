import { useState, useEffect } from 'react';
import { db } from '../Firebase/Firebase';
import { collection, onSnapshot } from 'firebase/firestore';

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

export const useDashboardData = () => {
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
    processingOrders: 0,
    checkedInOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [userMap, setUserMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [deliveryDetailsMap, setDeliveryDetailsMap] = useState({});
  const [deliveredOrders, setDeliveredOrders] = useState({});

  useEffect(() => {
    setLoading(true);

    // Users subscription
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    // Products subscription
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, products: snap.size }));
      
      // Create product map for quick lookup
      const products = {};
      snap.forEach(doc => {
        products[doc.id] = doc.data().name || doc.id;
      });
      setProductMap(products);
    });

    // Wishlist subscription with top products calculation
    const unsubWishlist = onSnapshot(collection(db, 'wishlist'), async (snap) => {
      setStats(prev => ({ ...prev, wishlist: snap.size }));
      
      // Calculate top products from wishlist
      const productCounts = {};
      snap.forEach((doc) => {
        const pid = doc.data().productId;
        productCounts[pid] = (productCounts[pid] || 0) + 1;
      });

      // Get product details and combine with wishlist counts
      const productsSnap = await collection(db, 'products');
      onSnapshot(productsSnap, (productsSnapshot) => {
        const productsArr = [];
        productsSnapshot.forEach((doc) => {
          const data = doc.data();
          productsArr.push({
            id: doc.id,
            ...data,
            wishlistCount: productCounts[doc.id] || 0,
          });
        });
        
        productsArr.sort((a, b) => b.wishlistCount - a.wishlistCount);
        setStats(prev => ({ ...prev, topProducts: productsArr.slice(0, 5) }));
      });
    });

    // Enhanced Orders subscription with detailed status tracking
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      let sales = 0;
      let orderTrends = [];
      let recentOrders = [];
      
      // Status counters with new flow
      let pendingOrders = 0;
      let completedOrders = 0;
      let processingOrders = 0;
      let checkedInOrders = 0;
      let inTransitOrders = 0;
      let deliveredOrders = 0;
      let cancelledOrders = 0;
      
      const newDeliveryDetails = {};
      const newDeliveredOrders = {};
      
      snap.docs.forEach((doc) => {
        const data = doc.data();
        const orderAmount = data?.orderDetails?.totalAmount || 0;
        sales += orderAmount;
        
        // Enhanced status counting based on new flow
        const orderStatus = (data.status || 'PENDING').toUpperCase();
        const paymentStatus = (data.paymentStatus || 'PENDING').toUpperCase();
        
        switch (orderStatus) {
          case 'PENDING':
            pendingOrders++;
            break;
          case 'PROCESSING':
          case 'CONFIRMED':
            processingOrders++;
            break;
          case 'CHECKED_IN':
            checkedInOrders++;
            break;
          case 'IN_TRANSIT':
            inTransitOrders++;
            break;
          case 'DELIVERED':
            deliveredOrders++;
            break;
          case 'CANCELLED':
            cancelledOrders++;
            break;
          default:
            pendingOrders++;
        }
        
        // Count completed orders (paid orders)
        if (paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
          completedOrders++;
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

        if (data.deliveryDetails) {
          newDeliveryDetails[doc.id] = data.deliveryDetails;
        }
        
        if (data.deliveryStatus === 'DELIVERED' || data.status === 'DELIVERED') {
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
        recentOrders: recentOrders.slice(0, 20), // Top 20 recent orders for dashboard
        pendingOrders,
        completedOrders,
        processingOrders,
        checkedInOrders,
        inTransitOrders,
        deliveredOrders,
        cancelledOrders,
        monthlyGrowth: orderTrends.length > 1 ? 
          ((orderTrends[orderTrends.length - 1]?.amount || 0) - (orderTrends[0]?.amount || 0)) / (orderTrends[0]?.amount || 1) * 100 : 0
      }));
      
      setDeliveryDetailsMap(newDeliveryDetails);
      setDeliveredOrders(newDeliveredOrders);
      setLoading(false);
    });

    // Users lookup for order display
    const unsubUsersLookup = onSnapshot(collection(db, 'users'), (snap) => {
      const users = {};
      snap.forEach(doc => {
        users[doc.id] = doc.data().name || doc.data().email || doc.id;
      });
      setUserMap(users);
    });

    return () => {
      unsubUsers();
      unsubProducts();
      unsubWishlist();
      unsubOrders();
      unsubUsersLookup();
    };
  }, []);

  return {
    loading,
    stats,
    userMap,
    productMap,
    deliveryDetailsMap,
    deliveredOrders,
    setStats,
    setDeliveryDetailsMap,
    setDeliveredOrders
  };
};