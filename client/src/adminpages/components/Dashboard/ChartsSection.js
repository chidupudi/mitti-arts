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

      {/* Top Products */}
      <Grid item xs={12} lg={6}>
        <ModernPaper sx={{ p: 3, height: 350 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ViewModule sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Top Wishlisted Products
            </Typography>
          </Box>
          <List>
            {stats.topProducts.length === 0 ? (
              <ListItem>
                <ListItemText primary="No data available" />
              </ListItem>
            ) : (
              stats.topProducts.map((prod, index) => (
                <ListItem key={prod.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={prod.imgUrl || (prod.images?.[0] || '')}
                      alt={prod.name}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        bgcolor: 'primary.light'
                      }}
                    >
                      {prod.name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold">
                        {prod.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {prod.code} • {formatCurrency(prod.price || 0)}
                      </Typography>
                    }
                  />
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      {prod.wishlistCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      wishes
                    </Typography>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </ModernPaper>
      </Grid>
    </Grid>
  );
};

export default ChartsSection;