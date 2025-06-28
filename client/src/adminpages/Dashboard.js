import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Chip, Alert } from '@mui/material';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import { useSeason } from '../hooks/useSeason';

// Existing imports
import StatsCards from './components/Dashboard/StatsCards';
import ChartsSection from './components/Dashboard/ChartsSection';
import RecentOrders from './components/Dashboard/RecentOrders';
import DeliveryDetailsDialog from './components/Dashboard/DelivieryDetailsDialog';
import NotificationSnackbar from './components/NotificationSnackbar';
import LoadingScreen from './components/LoadingScreen';
import { useDashboardData } from '../hooks/useDashboardData';
import { useOrderManagement } from '../hooks/useOrderManagement';

// Season Management Component
const SeasonManagement = () => {
  const { currentSeason, loading: seasonLoading } = useSeason();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeasonToggle = async () => {
    const newSeason = currentSeason === 'normal' ? 'ganesh' : 'normal';
    
    setUpdating(true);
    setMessage('');
    
    try {
      await setDoc(doc(db, 'settings', 'season'), {
        current: newSeason,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin'
      });
      
      setMessage(`Season successfully switched to ${newSeason === 'ganesh' ? 'Ganesh' : 'Normal'} mode!`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating season:', error);
      setMessage('Error updating season. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (seasonLoading) {
    return (
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        border: '2px solid #FFB74D'
      }}>
        <Typography>Loading season settings...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 3, 
      borderRadius: 3,
      background: currentSeason === 'ganesh' 
        ? 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)' 
        : 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      border: `2px solid ${currentSeason === 'ganesh' ? '#FF8F00' : '#4CAF50'}`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transform: 'translate(50px, -50px)',
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🎭 Season Management
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body1">
            Current Season:
          </Typography>
          <Chip 
            label={currentSeason === 'ganesh' ? '🕉️ Ganesh Season' : '🏺 Normal Season'}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          {currentSeason === 'ganesh' 
            ? '🎨 Ganesh season is active - Pottery items are hidden, Ganesh idols are featured'
            : '🏺 Normal season is active - All pottery items are available for purchase'
          }
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={handleSeasonToggle}
            disabled={updating}
            variant="contained"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            {updating ? 'Switching...' : `Switch to ${currentSeason === 'normal' ? 'Ganesh' : 'Normal'} Season`}
          </Button>
          
          {message && (
            <Alert 
              severity={message.includes('Error') ? 'error' : 'success'} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'text.primary'
              }}
            >
              {message}
            </Alert>
          )}
        </Box>

        {/* Season Impact Information */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Season Impact:
          </Typography>
          {currentSeason === 'ganesh' ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>• All pottery items marked as "Currently Unavailable"</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>• Ganesh idols section is featured prominently</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>• Lead capture system active for Ganesh orders</Typography>
              <Typography variant="body2">• Custom pricing and advance payment workflow</Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>• All pottery items available for purchase</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>• Normal e-commerce checkout flow</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>• Immediate payment processing</Typography>
              <Typography variant="body2">• Standard delivery workflow</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  // Custom hooks for data management
  const { 
    loading, 
    stats, 
    userMap, 
    productMap, 
    deliveryDetailsMap,
    deliveredOrders 
  } = useDashboardData();

  // Order management system
  const {
    checkInStatuses,
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
    handleCloseSnackbar,
  } = useOrderManagement();

  const filteredOrders = stats.recentOrders.filter(order => {
    if (!dateFilter) return true;
    const orderDate = new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt);
    const filterDate = new Date(dateFilter);
    return (
      orderDate.getDate() === filterDate.getDate() &&
      orderDate.getMonth() === filterDate.getMonth() &&
      orderDate.getFullYear() === filterDate.getFullYear()
    );
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ py: 3 }}>
          {/* Season Management Section */}
          <SeasonManagement />

          {/* Statistics Cards */}
          <StatsCards 
            stats={stats} 
            deliveredOrders={deliveredOrders}
          />

          {/* Charts Section */}
          <ChartsSection 
            stats={stats} 
            deliveredOrders={deliveredOrders}
          />

          {/* Recent Orders */}
          <RecentOrders
            filteredOrders={filteredOrders}
            checkInStatuses={checkInStatuses}
            deliveredOrders={deliveredOrders}
            deliveryDetailsMap={deliveryDetailsMap}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            handleCheckInToggle={handleCheckInToggle}
          />
        </Box>
      </Container>

      {/* Delivery Details Dialog */}
      <DeliveryDetailsDialog
        open={deliveryDialogOpen}
        onClose={() => setDeliveryDialogOpen(false)}
        orderId={selectedOrderForDelivery}
        onSave={handleSaveDeliveryDetails}
        initialData={selectedOrderForDelivery ? deliveryDetailsMap[selectedOrderForDelivery] : null}
      />
      
      {/* Notification Snackbar */}
      <NotificationSnackbar 
        snackbar={snackbar}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default Dashboard;