import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  CardGiftcard as RewardsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Business } from '../../types';
import { getBusinessList } from '../../API/business';

const BusinessListPage: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getBillingModeColor = (mode: string | null) => {
    switch (mode) {
      case 'invoice':
        return 'primary';
      case 'credit':
        return 'success';
      default:
        return 'default';
    }
  };

  const getBillingModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'invoice':
        return 'Invoice';
      case 'credit':
        return 'Credit';
      default:
        return 'Not Set';
    }
  };

  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBusinessList();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleViewBusiness = (orgId: string) => {
    navigate(`/businesses/${orgId}`);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedBusinesses = businesses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Business Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage business accounts, billing modes, and monitor spending.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" gutterBottom>
                {businesses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Businesses
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(businesses.reduce((sum, biz) => sum + biz.month_spend_cents, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Month Spend
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WalletIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {formatCurrency(businesses.reduce((sum, biz) => sum + biz.wallet_balance_cents, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Wallet Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RewardsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                {businesses.reduce((sum, biz) => sum + biz.rewards_points, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Rewards Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Business List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Business Accounts
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : businesses.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Business Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Billing Mode</TableCell>
                      <TableCell align="right">Month Spend</TableCell>
                      <TableCell align="right">Wallet Balance</TableCell>
                      <TableCell align="center">Rewards</TableCell>
                      <TableCell align="center">Active Rides</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBusinesses.map((business) => (
                      <TableRow key={business.org_id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {business.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {business.org_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {business.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {business.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getBillingModeLabel(business.billing_mode)}
                            color={getBillingModeColor(business.billing_mode) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(business.month_spend_cents)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {formatCurrency(business.wallet_balance_cents)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="info.main">
                            {business.rewards_points.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {business.active_rides_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Business Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewBusiness(business.org_id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={businesses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No businesses found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BusinessListPage;
