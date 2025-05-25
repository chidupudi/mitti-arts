import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  ViewModule,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const ModernPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
}));

// Styled scrollable container for the wishlist
const ScrollableList = styled(Box)(({ theme }) => ({
  maxHeight: '280px', // Fixed height for the list container
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingRight: theme.spacing(0.5),
  // Custom scrollbar styling
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: '3px',
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
  // Firefox scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.primary.main} ${theme.palette.grey[100]}`,
}));

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ChartsSection = ({ stats, deliveredOrders }) => {
  // Chart configurations
  const salesChartData = {
    labels: stats.orderTrends.map(o => o.formattedDate),
    datasets: [{
      label: 'Sales Amount',
      data: stats.orderTrends.map(o => o.amount),
      fill: true,
      backgroundColor: 'rgba(210, 105, 30, 0.1)',
      borderColor: '#D2691E',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: '#D2691E',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 6,
    }],
  };

  const ordersChartData = {
    labels: stats.orderTrends.map(o => o.formattedDate),
    datasets: [{
      label: 'Order Count',
      data: stats.orderTrends.map(o => o.count),
      backgroundColor: '#8B4513',
      borderColor: '#8B4513',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const statusChartData = {
    labels: ['Completed', 'Pending', 'Delivered'],
    datasets: [{
      data: [stats.completedOrders, stats.pendingOrders, Object.keys(deliveredOrders).length],
      backgroundColor: ['#6B7821', '#FF8F00', '#0277BD'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Sales Analytics Chart */}
      <Grid item xs={12} lg={8}>
        <ModernPaper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Sales Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue trends over the last 10 days
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Chip 
                label={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`}
                color={stats.monthlyGrowth > 0 ? 'success' : 'error'}
                icon={stats.monthlyGrowth > 0 ? <TrendingUp /> : <TrendingDown />}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>
          <Box sx={{ height: 280 }}>
            <Line data={salesChartData} options={chartOptions} />
          </Box>
        </ModernPaper>
      </Grid>

      {/* Order Status Chart */}
      <Grid item xs={12} lg={4}>
        <ModernPaper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Analytics sx={{ color: 'secondary.main', mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Order Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current distribution
              </Typography>
            </Box>
          </Box>
          <Box sx={{ height: 280 }}>
            <Doughnut 
              data={statusChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </Box>
        </ModernPaper>
      </Grid>

      {/* Daily Order Count Chart */}
      <Grid item xs={12} lg={6}>
        <ModernPaper sx={{ p: 3, height: 350 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Assessment sx={{ color: 'info.main', mr: 2, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Daily Order Count
            </Typography>
          </Box>
          <Box sx={{ height: 250 }}>
            <Bar data={ordersChartData} options={chartOptions} />
          </Box>
        </ModernPaper>
      </Grid>

      {/* Top Products - Updated with Scrollable Container */}
      <Grid item xs={12} lg={6}>
        <ModernPaper sx={{ p: 3, height: 350 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ViewModule sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Top Wishlisted Products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most popular items in customer wishlists
              </Typography>
            </Box>
            {stats.topProducts.length > 0 && (
              <Chip 
                label={`${stats.topProducts.length} items`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          {/* Scrollable List Container */}
          <ScrollableList>
            {stats.topProducts.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '200px',
                flexDirection: 'column',
                color: 'text.secondary'
              }}>
                <ViewModule sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography variant="body1">No wishlist data available</Typography>
                <Typography variant="body2">Products will appear here once customers start adding items to their wishlists</Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0 }}>
                {stats.topProducts.map((prod, index) => (
                  <ListItem 
                    key={prod.id} 
                    sx={{ 
                      px: 0, 
                      py: 1.5,
                      borderBottom: index < stats.topProducts.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(210, 105, 30, 0.04)',
                        borderRadius: 1,
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {/* Rank Number */}
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      backgroundColor: index < 3 ? 'primary.main' : 'grey.300',
                      color: index < 3 ? 'white' : 'text.secondary',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      mr: 2,
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </Box>
                    
                    <ListItemAvatar sx={{ minWidth: 56 }}>
                      <Avatar
                        src={prod.imgUrl || (prod.images?.[0] || '')}
                        alt={prod.name}
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: 'primary.light',
                          border: '2px solid',
                          borderColor: index < 3 ? 'primary.main' : 'grey.200'
                        }}
                      >
                        {prod.name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      sx={{ flex: 1, minWidth: 0 }} // minWidth: 0 allows text to truncate
                      primary={
                        <Typography 
                          fontWeight="bold" 
                          sx={{ 
                            fontSize: '0.9rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {prod.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {prod.code && `${prod.code} • `}
                            {formatCurrency(prod.price || 0)}
                          </Typography>
                          {prod.category && (
                            <Chip 
                              label={prod.category}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.65rem',
                                mt: 0.5
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    
                    <Box textAlign="center" sx={{ flexShrink: 0, ml: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        color={index < 3 ? 'primary.main' : 'text.primary'}
                        sx={{ fontSize: '1.1rem' }}
                      >
                        {prod.wishlistCount}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        wishes
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </ScrollableList>
          
          {/* Footer info for the wishlist card */}
          {stats.topProducts.length > 0 && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">
                Total wishlist entries: {stats.topProducts.reduce((sum, prod) => sum + prod.wishlistCount, 0)}
              </Typography>
              <Typography variant="caption" color="primary.main" fontWeight="medium">
                Updated in real-time
              </Typography>
            </Box>
          )}
        </ModernPaper>
      </Grid>
    </Grid>
  );
};

export default ChartsSection;