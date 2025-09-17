import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  CardGiftcard as RewardsIcon,
  DirectionsCar as CarIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Business } from '../../../types';

interface BusinessOverviewProps {
  business: Business;
}

const BusinessOverview: React.FC<BusinessOverviewProps> = ({ business }) => {
  // Mock data for business overview
  const mockOverviewData = {
    // Key metrics
    totalRides: 156,
    totalSpent: business.month_spend_cents,
    averageRideCost: Math.floor(business.month_spend_cents / 156),
    monthlyGrowth: 12.5,
    walletUtilization: 75,
    
    // Recent activity
    recentActivity: [
      {
        id: 1,
        type: 'ride',
        description: 'Ride R000123 completed',
        amount: 2500,
        timestamp: '2 hours ago',
        icon: <CarIcon />,
      },
      {
        id: 2,
        type: 'reward',
        description: 'Earned 25 reward points',
        amount: 25,
        timestamp: '2 hours ago',
        icon: <RewardsIcon />,
      },
      {
        id: 3,
        type: 'ride',
        description: 'Ride R000122 completed',
        amount: 3200,
        timestamp: '5 hours ago',
        icon: <CarIcon />,
      },
      {
        id: 4,
        type: 'payment',
        description: 'Wallet top-up',
        amount: 50000,
        timestamp: '1 day ago',
        icon: <WalletIcon />,
      },
      {
        id: 5,
        type: 'ride',
        description: 'Ride R000121 completed',
        amount: 1800,
        timestamp: '2 days ago',
        icon: <CarIcon />,
      },
    ],
    
    // Top drivers
    topDrivers: [
      { id: 'driver_1', name: 'John Smith', rides: 45, rating: 4.9, earnings: 12500 },
      { id: 'driver_2', name: 'Sarah Johnson', rides: 38, rating: 4.8, earnings: 9800 },
      { id: 'driver_3', name: 'Mike Wilson', rides: 32, rating: 4.7, earnings: 8500 },
    ],
    
    // Spending trends (last 7 days)
    spendingTrend: [
      { day: 'Mon', amount: 4500 },
      { day: 'Tue', amount: 3200 },
      { day: 'Wed', amount: 6800 },
      { day: 'Thu', amount: 2100 },
      { day: 'Fri', amount: 8900 },
      { day: 'Sat', amount: 12000 },
      { day: 'Sun', amount: 5600 },
    ],
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Box>
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CarIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {mockOverviewData.totalRides}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Rides
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{mockOverviewData.monthlyGrowth}% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mr: 1 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(mockOverviewData.totalSpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Spend
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg: {formatCurrency(mockOverviewData.averageRideCost)} per ride
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WalletIcon sx={{ fontSize: 40, color: 'warning.main', mr: 1 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(business.wallet_balance_cents)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wallet Balance
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Utilization: {mockOverviewData.walletUtilization}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={mockOverviewData.walletUtilization} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RewardsIcon sx={{ fontSize: 40, color: 'info.main', mr: 1 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {business.rewards_points.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reward Points
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Earned from rides
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {mockOverviewData.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {activity.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.timestamp}
                      />
                      <Typography variant="body2" color="primary" fontWeight="medium">
                        {activity.type === 'reward' 
                          ? `+${activity.amount} pts`
                          : formatCurrency(activity.amount)
                        }
                      </Typography>
                    </ListItem>
                    {index < mockOverviewData.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Drivers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Drivers
              </Typography>
              <List>
                {mockOverviewData.topDrivers.map((driver, index) => (
                  <React.Fragment key={driver.id}>
                    <ListItem sx={{ px: 0 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <ListItemText
                        primary={driver.name}
                        secondary={`${driver.rides} rides • ${formatCurrency(driver.earnings)} earned`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                        <Typography variant="body2">
                          {driver.rating}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < mockOverviewData.topDrivers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Spending Trend
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', height: 200, gap: 1 }}>
                {mockOverviewData.spendingTrend.map((day, index) => {
                  const maxAmount = Math.max(...mockOverviewData.spendingTrend.map(d => d.amount));
                  const height = (day.amount / maxAmount) * 100;
                  
                  return (
                    <Box key={day.day} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: `${height}%`,
                          minHeight: 20,
                          bgcolor: 'primary.main',
                          borderRadius: '4px 4px 0 0',
                          mb: 1,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {day.day}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(day.amount)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessOverview;
