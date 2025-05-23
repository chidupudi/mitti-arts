import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Collapse,
  Badge,
  styled
} from '@mui/material';
import {
  DashboardOutlined,
  InventoryOutlined,
  ShoppingCartOutlined,
  MenuOpen,
  Menu,
  Person,
  Settings,
  Logout,
  StorefrontOutlined,
  ExpandLess,
  ExpandMore,
  CategoryOutlined,
  PeopleOutlined,
  BarChartOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAuthUtils } from './AdminAuth'; // Adjust this import based on your file structure

// Custom styled components
const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SidebarItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  backgroundColor: active ? theme.palette.primary.light + '20' : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: active ? 600 : 400,
}));

const SidebarSubItem = styled(ListItem)(({ theme, active }) => ({
  paddingLeft: theme.spacing(4),
  borderRadius: 12,
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.8, 2),
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: active ? theme.palette.primary.light + '10' : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: active ? 600 : 400,
}));

// Main AdminSidebar component
const AdminSidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for nested menus
  const [openSubMenu, setOpenSubMenu] = useState({
    products: false,
    settings: false
  });
  
  // Admin info - you would get this from your auth context
  const [adminInfo, setAdminInfo] = useState({
    name: 'Admin',
    role: 'Administrator',
    avatar: null
  });
  
  // Navigation items structure
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <DashboardOutlined />,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Orders',
      icon: <ShoppingCartOutlined />,
      path: '/adminorders',
      badge: 5 // Example - would be dynamic in real app
    },
    {
      title: 'Products',
      icon: <StorefrontOutlined />,
      path: '/products',
      hasSubMenu: true,
      key: 'products',
      subItems: [
        { title: 'All Products', path: '/inventory' },
        { title: 'Categories', path: '/categories' },
        { title: 'Add Product', path: '/add-product' },
      ]
    },
    {
      title: 'Customers',
      icon: <PeopleOutlined />,
      path: '/customers',
      badge: null
    },
    {
      title: 'Analytics',
      icon: <BarChartOutlined />,
      path: '/analytics',
      badge: null
    },
    {
      title: 'Settings',
      icon: <SettingsOutlined />,
      path: '/settings',
      hasSubMenu: true,
      key: 'settings',
      subItems: [
        { title: 'Store Settings', path: '/store-settings' },
        { title: 'Admin Users', path: '/admin-users' },
        { title: 'Appearance', path: '/appearance' },
      ]
    }
  ];

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  // Toggle submenu
  const handleToggleSubMenu = (key) => {
    setOpenSubMenu({
      ...openSubMenu,
      [key]: !openSubMenu[key]
    });
  };

  // Handle logout
  const handleLogout = () => {
    // Call your logout function
    if (adminAuthUtils?.logout) {
      adminAuthUtils.logout();
    } else {
      console.warn('Logout function not available');
      // Fallback - navigate to login
      navigate('/admin');
    }
  };

  // Check if path is active
  const isPathActive = (path) => {
    return location.pathname === path;
  };

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Sidebar Header */}
      <SidebarHeader>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              my: 2
            }}
          >
            MittiArts
          </Typography>
          
          {isMobile && (
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={onToggle}
              sx={{ ml: 1 }}
            >
              <MenuOpen />
            </IconButton>
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            mt: 2
          }}
        >
          <Avatar 
            src={adminInfo.avatar} 
            alt={adminInfo.name}
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)'
            }}
          >
            {adminInfo.name[0]}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {adminInfo.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {adminInfo.role}
            </Typography>
          </Box>
        </Box>
      </SidebarHeader>

      {/* Main Navigation */}
      <List sx={{ p: 2, flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <React.Fragment key={item.path || item.key}>
            <SidebarItem
              button
              active={isPathActive(item.path) ? 1 : 0}
              onClick={item.hasSubMenu 
                ? () => handleToggleSubMenu(item.key) 
                : () => handleNavigation(item.path)
              }
            >
              <ListItemIcon 
                sx={{ 
                  color: isPathActive(item.path) ? 'primary.main' : 'text.secondary',
                  minWidth: '40px'
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.title} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  fontWeight: isPathActive(item.path) ? 600 : 400
                }}
              />
              {item.hasSubMenu && (
                openSubMenu[item.key] ? <ExpandLess /> : <ExpandMore />
              )}
            </SidebarItem>
            
            {/* Sub Menu Items */}
            {item.hasSubMenu && (
              <Collapse in={openSubMenu[item.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <SidebarSubItem
                      button
                      key={subItem.path}
                      active={isPathActive(subItem.path) ? 1 : 0}
                      onClick={() => handleNavigation(subItem.path)}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isPathActive(subItem.path) ? 'primary.main' : 'text.disabled',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={subItem.title}
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: isPathActive(subItem.path) ? 600 : 400
                        }}
                      />
                    </SidebarSubItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          <SidebarItem button onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: '40px', color: 'text.secondary' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </SidebarItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !open && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1199 }}>
          <IconButton
            color="primary"
            onClick={onToggle}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[3],
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <Menu />
          </IconButton>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: 280,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Permanent Drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 280,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[2],
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default AdminSidebar;