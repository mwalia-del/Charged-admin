import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  DirectionsCar as CarIcon,
  DocumentScanner,
  CardGiftcard as Rewards,
  EmojiEvents as TipsIcon,
  Business as BusinessIcon,
  Share as ReferralIcon,
  AccountBalanceWallet as WalletIcon,
  Schedule as ScheduledIcon,
  Campaign as PromotionsIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

interface NavItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { text: "Pricing", path: "/pricing", icon: <MoneyIcon /> },
  { text: "Documents", path: "/documents", icon: <DocumentScanner /> },
  { text: "Rewards", path: "/rewards", icon: <Rewards /> },
  { text: "Tips", path: "/tips", icon: <TipsIcon /> },
  { text: "Business", path: "/businesses", icon: <BusinessIcon /> },
  { text: "Referrals", path: "/referrals", icon: <ReferralIcon /> },
  { text: "Driver Wallets", path: "/referrals/drivers", icon: <WalletIcon /> },
  { text: "Rider Wallets", path: "/referrals/riders", icon: <WalletIcon /> },
    { text: "Scheduled Rides", path: "/scheduled", icon: <ScheduledIcon /> },
    { text: "Promotions", path: "/promotions", icon: <PromotionsIcon /> },
  { text: "Riders", path: "/riders", icon: <PeopleIcon /> },
  { text: "Drivers", path: "/drivers", icon: <CarIcon /> },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";
    if (path === "/pricing") return "Pricing Rules";
    if (path === "/documents") return "Required Documents";
    if (path === "/rewards") return "Special rewards";
    if (path === "/riders") return "Rider Management";
    if (path === "/drivers") return "Driver Management";
    if (path === "/businesses") return "Business Management";
    if (path.startsWith("/businesses/")) return "Business Details";
    if (path === "/test-ride") return "Test Ride Simulation";
    if (path.startsWith("/rides/")) return "Ride Details";

    return "Charged Admin";
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            letterSpacing: "0.5px",
          }}
        >
          CHARGED ADMIN
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              color="inherit"
              onClick={handleProfileMenuOpen}
              startIcon={
                authState.user?.photo ? (
                  <Avatar
                    src={authState.user.photo}
                    alt={authState.user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountIcon />
                )
              }
            >
              {authState.user?.name || "User"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "profile-button",
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: "100vh",
          overflow: "auto",
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
