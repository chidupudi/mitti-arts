import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Fade,
} from '@mui/material';
import {
  People,
  Store,
  AssignmentTurnedIn,
  Schedule,
  CheckCircle,
  Favorite,
  HourglassEmpty,
  TrendingUp,
  LocalShipping,
  Done,
  Cancel,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: '#FFFFFF',
  minHeight: 140,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)',
  },
}));

const StatsCards = ({ stats, deliveredOrders }) => {
  const statsData = [
    {
      title: 'Total Users',
      value: stats.users,
      subtitle: 'Active customers',
      icon: <People sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
    },
    {
      title: 'Products',
      value: stats.products,
      subtitle: 'In inventory',
      icon: <Store sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
    },
    {
      title: 'Total Orders',
      value: stats.orders,
      subtitle: 'All time',
      icon: <AssignmentTurnedIn sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
    },
    {
      title: 'Processing Orders',
      value: stats.processingOrders || 0,
      subtitle: 'Being prepared',
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
    },
    {
      title: 'Checked In Orders',
      value: stats.checkedInOrders || 0,
      subtitle: 'Admin verified',
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #7B1FA2 0%, #BA68C8 100%)',
    },
    {
      title: 'In Transit Orders',
      value: stats.inTransitOrders || 0,
      subtitle: 'On the way',
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders || 0,
      subtitle: 'Successfully completed',
      icon: <Done sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
    },
    {
      title: 'Paid Orders',
      value: stats.completedOrders,
      subtitle: 'Payment received',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      subtitle: 'Awaiting payment',
      icon: <Schedule sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
    },
    {
      title: 'Cancelled Orders',
      value: stats.cancelledOrders || 0,
      subtitle: 'Cancelled by admin/user',
      icon: <Cancel sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)',
    },
    {
      title: 'Wishlist Items',
      value: stats.wishlist,
      subtitle: 'Customer favorites',
      icon: <Favorite sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)',
    },
  ];

  return (
    <Fade in timeout={800}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={stat.title}>
            <GradientCard gradient={stat.gradient}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 64, 
                  height: 64,
                  mr: 2
                }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {stat.subtitle}
                  </Typography>
                </Box>
              </CardContent>
            </GradientCard>
          </Grid>
        ))}
      </Grid>
    </Fade>
  );
};

export default StatsCards;