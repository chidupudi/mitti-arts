import React, { useState, useEffect } from 'react';
import { Alert, Button, Dialog, DialogContent, DialogTitle, Typography, Box } from '@mui/material';
import { Warning, Wifi, Phone, Router } from '@mui/icons-material';

const SSLErrorHandler = () => {
  const [showSSLHelp, setShowSSLHelp] = useState(false);
  const [hasSSLIssue, setHasSSLIssue] = useState(false);

  useEffect(() => {
    // Check if running on HTTPS
    if (window.location.protocol !== 'https:') {
      setHasSSLIssue(true);
    }

    // Listen for SSL-related errors
    const handleError = (event) => {
      if (event.message?.includes('certificate') || 
          event.message?.includes('SSL') || 
          event.message?.includes('ERR_CERT')) {
        setHasSSLIssue(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const troubleshootingSteps = [
    {
      icon: <Wifi />,
      title: "Try a different network",
      description: "Switch from Wi-Fi to mobile data or try another Wi-Fi network"
    },
    {
      icon: <Phone />,
      title: "Contact your IT department",
      description: "If you're on a corporate or school network, ask IT to whitelist mittiarts.com"
    },
    {
      icon: <Router />,
      title: "Check your firewall/antivirus",
      description: "Temporarily disable VPN, firewall, or antivirus web filtering"
    }
  ];

  if (!hasSSLIssue) return null;

  return (
    <>
      <Alert 
        severity="warning" 
        action={
          <Button color="inherit" size="small" onClick={() => setShowSSLHelp(true)}>
            Get Help
          </Button>
        }
        sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
      >
        <Warning sx={{ mr: 1 }} />
        Connection security issue detected. Click "Get Help" for solutions.
      </Alert>

      <Dialog open={showSSLHelp} onClose={() => setShowSSLHelp(false)} maxWidth="md">
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Warning color="warning" sx={{ mr: 1 }} />
            Can't Access Mitti Arts? Here's How to Fix It
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You're seeing this because your network has security software (like Fortinet) 
            that's blocking our website. This is common on corporate, school, or public networks.
          </Typography>

          <Typography variant="h6" gutterBottom>
            Try These Solutions:
          </Typography>

          {troubleshootingSteps.map((step, index) => (
            <Box key={index} display="flex" alignItems="flex-start" mb={2}>
              <Box mr={2} mt={0.5}>
                {step.icon}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </Box>
          ))}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Still having issues?</strong> Contact us at support@mittiarts.com 
              and we'll help you access our store.
            </Typography>
          </Alert>

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={() => setShowSSLHelp(false)}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SSLErrorHandler;