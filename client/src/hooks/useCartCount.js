// client/src/hooks/useCartCount.js
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

export const useCartCount = (user) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setCartCount(0);
      return;
    }

    const cartQuery = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
      const totalCount = snapshot.docs.reduce((total, doc) => {
        return total + (doc.data().quantity || 1);
      }, 0);
      setCartCount(totalCount);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return cartCount;
};

// client/src/hooks/useWishlistCount.js
export const useWishlistCount = (user) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setWishlistCount(0);
      return;
    }

    const wishlistQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(wishlistQuery, (snapshot) => {
      setWishlistCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return wishlistCount;
};