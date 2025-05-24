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
  Collapse,
  Badge,
  Tooltip
} from '@mui/material';
import {
  DashboardOutlined,
  InventoryOutlined,
  ShoppingCartOutlined,
  MenuOpen,
  Menu,
  Logout,
  StorefrontOutlined,
  ExpandLess,
  ExpandMore,
  PeopleOutlined,
  BarChartOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [openSubMenu, setOpenSubMenu] = useState({
    products: false,
    settings: false
  });

  const [collapsed, setCollapsed] = useState(false);

  const [adminInfo] = useState({
    name: 'Admin',
    role: 'Administrator',
    avatar: null
  });

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
      badge: 5
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

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const handleToggleSubMenu = (key) => {
    setOpenSubMenu({
      ...openSubMenu,
      [key]: !openSubMenu[key]
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/supercontrollogin');
    if (isMobile) {
      onToggle();
    }
  };

  const isPathActive = (path) => location.pathname === path;

  const drawerWidth = collapsed ? 80 : 280;

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      {/* Sidebar Header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        background: 'linear-gradient(135deg, #D2691E 0%, #8B4513 100%)',
        color: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {!collapsed && (
          <Typography variant="h6" fontWeight="bold">
            MittiArts
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: 'white' }}>
          {collapsed ? <Menu /> : <MenuOpen />}
        </IconButton>
      </Box>

      {/* Admin Info */}
      {!collapsed && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
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
            <Typography variant="subtitle1" fontWeight="bold">{adminInfo.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{adminInfo.role}</Typography>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List sx={{ p: 1, flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <React.Fragment key={item.path || item.key}>
            <ListItem
              button
              onClick={item.hasSubMenu
                ? () => handleToggleSubMenu(item.key)
                : () => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                p: '8px 12px',
                color: isPathActive(item.path) ? '#D2691E' : 'text.primary',
                backgroundColor: isPathActive(item.path) ? 'rgba(210, 105, 30, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'translateX(5px)',
                  transition: 'all 0.3s ease',
                },
                transition: 'all 0.2s ease',
                fontWeight: isPathActive(item.path) ? 600 : 400,
              }}
            >
              <Tooltip title={collapsed ? item.title : ''} placement="right">
                <ListItemIcon
                  sx={{
                    color: isPathActive(item.path) ? '#D2691E' : 'text.secondary',
                    minWidth: '36px'
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
              </Tooltip>
              {!collapsed && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isPathActive(item.path) ? 600 : 400
                  }}
                />
              )}
              {item.hasSubMenu && !collapsed && (
                openSubMenu[item.key] ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItem>

            {/* Submenu */}
            {item.hasSubMenu && !collapsed && (
              <Collapse in={openSubMenu[item.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      button
                      key={subItem.path}
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        mb: 0.5,
                        p: '6px 16px',
                        color: isPathActive(subItem.path) ? '#D2691E' : 'text.secondary',
                        backgroundColor: isPathActive(subItem.path) ? 'rgba(210, 105, 30, 0.05)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateX(5px)',
                        },
                        transition: 'all 0.2s ease',
                        fontWeight: isPathActive(subItem.path) ? 600 : 400,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: isPathActive(subItem.path) ? '#D2691E' : 'text.disabled',
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
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: 'text.secondary' }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            )}
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && !open && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1199 }}>
          <IconButton
            color="primary"
            onClick={onToggle}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <Menu />
          </IconButton>
        </Box>
      )}

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
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #e0e0e0',
              boxShadow: 2,
              transition: 'width 0.3s ease',
              overflowX: 'hidden'
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
