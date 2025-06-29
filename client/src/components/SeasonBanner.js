// client/src/components/SeasonBanner.js - Banner to show current season status
import React, { useState } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Container,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Close,
  CelebrationOutlined,
  ShoppingBag,
  Info,
  ArrowForward,
  Schedule,
  LocalOffer,
  Phone,
  WhatsApp
} from '@mui/icons-material';
import { useSeason } from '../hooks/useSeason';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../Firebase/Firebase';

const SeasonBanner = () => {
  const [user] = useAuthState(auth);
  const { currentSeason, isGaneshSeason, loading } = useSeason();
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('seasonBannerDismissed') === 'true'
  );
  const navigate = useNavigate();

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('seasonBannerDismissed', 'true');
  };

  // Clear dismissed state when season changes
  React.useEffect(() => {
    localStorage.removeItem('seasonBannerDismissed');
    setDismissed(false);
  }, [currentSeason]);

  if (loading || dismissed) return null;

  if (isGaneshSeason) {
    return (
      <Collapse in={!dismissed}>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50px, -50px)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '150px',
              height: '150px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              transform: 'translate(-50px, 50px)'
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <CelebrationOutlined sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        🕉️ Ganesh Season is Here!
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Special collection of handcrafted Ganesh idols now available
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocalOffer sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Price Range
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ₹7,000 - ₹31,000
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Delivery Time
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            7-15 days
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Info sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Advance Payment
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ₹2k - ₹3k only
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} md={4}>
                  <Box display="flex" flexDirection="column" gap={2} alignItems="stretch">
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/ganesh-idols')}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Browse Ganesh Idols
                    </Button>

                    <Box display="flex" gap={1}>
                      {user && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate('/my-ganesh-orders')}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                              borderColor: 'white',
                              bgcolor: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          My Orders
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        href="tel:+919876543210"
                        startIcon={<Phone />}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.5)',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Call Us
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        href="https://wa.me/919876543210"
                        target="_blank"
                        startIcon={<WhatsApp />}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.5)',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        WhatsApp
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Dismiss Button */}
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Container>
        </Paper>

        {/* Additional Info Strip */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#E65100',
            color: 'white',
            py: 1
          }}
        >
          <Container maxWidth="lg">
            <Box display="flex" justifyContent="center" alignItems="center" gap={3} flexWrap="wrap">
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ✨ <strong>Lead Capture System:</strong> Submit interest → Our team contacts you → Finalize details → Pay advance
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                📞 <strong>Quick Response:</strong> We contact within 24 hours
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🎨 <strong>Customizable:</strong> Size, color, and design modifications available
              </Typography>
            </Box>
          </Container>
        </Paper>
      </Collapse>
    );
  }

  // Normal Season Banner (much simpler)
  return (
    <Collapse in={!dismissed}>
      <Alert
        severity="info"
        sx={{
          borderRadius: 0,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <IconButton size="small" onClick={handleDismiss}>
            <Close />
          </IconButton>
        }
      >
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box>
              <AlertTitle sx={{ mb: 0 }}>
                🏺 Browse Our Regular Pottery Collection
              </AlertTitle>
              <Typography variant="body2" color="text.secondary">
                Explore handcrafted pottery, decorative items, and traditional ceramics
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ShoppingBag />}
              onClick={() => navigate('/products')}
              sx={{ ml: 2 }}
            >
              Shop Now
            </Button>
          </Box>
        </Container>
      </Alert>
    </Collapse>
  );
};

export default SeasonBanner;