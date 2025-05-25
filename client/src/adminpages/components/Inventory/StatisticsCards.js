import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import {
  Inventory2,
  AttachMoney,
  Warning,
  VisibilityOff,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StatCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
  color: 'white',
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
  '&.success': {
    background: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
  },
  '&.warning': {
    background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
  },
  '&.info': {
    background: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
  },
  '&.special': {
    background: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)',
  },
}));

const StatisticsCards = ({ statistics }) => {
  // Extract statistics including hyderabadOnlyProducts with fallback to 0
  const { totalProducts, totalValue, lowStockProducts, hiddenProducts, hyderabadOnlyProducts = 0 } = statistics;

  const statsData = [
    {
      title: 'Total Products',
      value: totalProducts,
      subtitle: 'In inventory',
      icon: <Inventory2 sx={{ fontSize: 32 }} />,
      className: ''
    },
    {
      title: 'Total Value',
      value: `₹${totalValue.toLocaleString()}`,
      subtitle: 'Inventory worth',
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      className: 'success'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      subtitle: 'Need attention',
      icon: <Warning sx={{ fontSize: 32 }} />,
      className: 'warning'
    },
    {
      title: 'Hidden Products',
      value: hiddenProducts,
      subtitle: 'Not visible to customers',
      icon: <VisibilityOff sx={{ fontSize: 32 }} />,
      className: 'info'
    },
    {
      title: 'Hyderabad Only',
      value: hyderabadOnlyProducts,
      subtitle: 'Location restricted',
      icon: <LocationOn sx={{ fontSize: 32 }} />,
      className: 'special'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsData.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <StatCard className={stat.className}>
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
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {stat.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {stat.subtitle}
                </Typography>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsCards;