import { useState, useEffect, createContext, useContext } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState('normal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for season changes
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'season'), 
      (doc) => {
        if (doc.exists()) {
          setCurrentSeason(doc.data().current || 'normal');
        } else {
          // If document doesn't exist, default to normal season
          setCurrentSeason('normal');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to season changes:', error);
        setCurrentSeason('normal');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    currentSeason,
    loading,
    isGaneshSeason: currentSeason === 'ganesh',
    isNormalSeason: currentSeason === 'normal'
  };

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};