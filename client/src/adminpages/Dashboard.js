// client/src/adminpages/Dashboard.js - Updated with new Season Management
import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Chip, Alert, Modal, Card, CardContent, Grid } from '@mui/material';
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

// Enhanced Season Management Component
const SeasonManagement = () => {
  const { 
    currentSeason, 
    loading: seasonLoading, 
    updating,
    error,
    isGaneshSeason,
    isNormalSeason,
    getSeasonDisplayName,
    getSeasonIcon,
    getSeasonColor,
    lastUpdated,
    updatedBy,
    toggleSeason,
    updateSeason,
    resetToNormal,
    clearError,
    getSeasonHistory
  } = useSeason();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [seasonHistory, setSeasonHistory] = useState(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  // Clear local message after 5 seconds
  useEffect(() => {
    if (localMessage) {
      const timer = setTimeout(() => setLocalMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [localMessage]);

  // Clear error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 10000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSeasonToggle = () => {
    const newSeason = currentSeason === 'normal' ? 'ganesh' : 'normal';
    setPendingAction({
      type: 'toggle',
      from: currentSeason,
      to: newSeason,
      action: () => toggleSeason('admin')
    });
    setShowConfirmDialog(true);
  };

  const handleResetToNormal = () => {
    setPendingAction({
      type: 'reset',
      from: currentSeason,
      to: 'normal',
      action: () => resetToNormal('admin')
    });
    setShowConfirmDialog(true);
  };

  const handleViewHistory = async () => {
    try {
      const result = await getSeasonHistory();
      if (result.success) {
        setSeasonHistory(result);
        setShowHistoryDialog(true);
      } else {
        setLocalMessage('Failed to load season history');
      }
    } catch (error) {
      setLocalMessage('Error loading season history');
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      const result = await pendingAction.action();
      if (result.success) {
        setLocalMessage(result.message || 'Season updated successfully!');
      } else {
        setLocalMessage(result.error || 'Failed to update season');
      }
    } catch (error) {
      setLocalMessage('Error updating season');
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
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
    <>
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: isGaneshSeason 
          ? 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)' 
          : 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
        border: `2px solid ${getSeasonColor()}`,
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
            {getSeasonIcon()} Season Management
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="body1">
              Current Season:
            </Typography>
            <Chip 
              label={`${getSeasonIcon()} ${getSeasonDisplayName()}`}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            />
            {updating && (
              <Chip 
                label="Updating..."
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '0.8rem'
                }}
              />
            )}
          </Box>

          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            {isGaneshSeason 
              ? '🎨 Ganesh season is active - Pottery items are hidden, Ganesh idols are featured'
              : '🏺 Normal season is active - All pottery items are available for purchase'
            }
          </Typography>

          {/* Last Updated Info */}
          {lastUpdated && (
            <Typography variant="caption" sx={{ mb: 2, opacity: 0.8, display: 'block' }}>
              Last updated: {formatLastUpdated(lastUpdated)} {updatedBy ? `by ${updatedBy}` : ''}
            </Typography>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
              {updating ? 'Switching...' : `Switch to ${isNormalSeason ? 'Ganesh' : 'Normal'} Season`}
            </Button>

            {/* Emergency Reset Button - Only show if not already normal */}
            {!isNormalSeason && (
              <Button
                onClick={handleResetToNormal}
                disabled={updating}
                variant="outlined"
                color="error"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Reset to Normal
              </Button>
            )}

            {/* History Button */}
            <Button
              onClick={handleViewHistory}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              View History
            </Button>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'text.primary'
              }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {localMessage && !error && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'text.primary'
              }}
              onClose={() => setLocalMessage('')}
            >
              {localMessage}
            </Alert>
          )}

          {/* Season Impact Information */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Season Impact:
            </Typography>
            {isGaneshSeason ? (
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

      {/* Confirmation Dialog */}
      <Modal
        open={showConfirmDialog}
        onClose={cancelAction}
        aria-labelledby="season-change-confirmation"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="season-change-confirmation" variant="h6" component="h2" gutterBottom>
            Confirm Season Change
          </Typography>
          <Typography sx={{ mb: 3 }}>
            {pendingAction && (
              <>
                Are you sure you want to {pendingAction.type === 'reset' ? 'reset to' : 'switch to'} <strong>{pendingAction.to}</strong> season?
                <br /><br />
                <strong>This will:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {pendingAction.to === 'ganesh' ? (
                    <>
                      <li>Hide all pottery items from customers</li>
                      <li>Show Ganesh idol collection</li>
                      <li>Enable lead capture for custom orders</li>
                    </>
                  ) : (
                    <>
                      <li>Show all pottery items to customers</li>
                      <li>Hide Ganesh idol collection</li>
                      <li>Enable normal e-commerce flow</li>
                    </>
                  )}
                </ul>
              </>
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={cancelAction} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={confirmAction} 
              variant="contained" 
              color={pendingAction?.type === 'reset' ? 'error' : 'primary'}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* History Dialog */}
      <Modal
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        aria-labelledby="season-history"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto',
        }}>
          <Typography id="season-history" variant="h6" component="h2" gutterBottom>
            Season Change History
          </Typography>
          {seasonHistory ? (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current: <strong>{seasonHistory.current}</strong>
              </Typography>
              {seasonHistory.lastUpdated && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated: {formatLastUpdated(seasonHistory.lastUpdated)} by {seasonHistory.updatedBy || 'Unknown'}
                </Typography>
              )}
              {seasonHistory.previousSeason && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Previous: {seasonHistory.previousSeason}
                </Typography>
              )}
              {seasonHistory.updateHistory && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Latest Change:</Typography>
                  <Typography variant="body2">
                    From: <strong>{seasonHistory.updateHistory.from}</strong> → To: <strong>{seasonHistory.updateHistory.to}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By: {seasonHistory.updateHistory.updatedBy}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>Loading history...</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
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
          {/* Enhanced Season Management Section */}
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