import { useState, useEffect } from 'react';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

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
    });

    // Wishlist subscription
    const unsubWishlist = onSnapshot(collection(db, 'wishlist'), (snap) => {
      setStats(prev => ({ ...prev, wishlist: snap.size }));
    });

    // Orders subscription
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

    // Fetch top products
    const fetchTopProducts = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    // Fetch lookup data
    const fetchLookups = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching lookup data:', error);
      }
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