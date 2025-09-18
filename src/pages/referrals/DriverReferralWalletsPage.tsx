import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  RequestPage as PayoutIcon,
  History as HistoryIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { ReferralWallet, ReferralWalletTransaction } from '../../types';
import { 
  getDriverReferralWallet, 
  getDriverReferralWalletTransactions,
  requestReferralPayout 
} from '../../API/referrals';
import { useAuth } from '../../contexts/AuthContext';

const DriverReferralWalletsPage: React.FC = () => {
  const { getDrivers } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<Map<string, ReferralWallet>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [transactions, setTransactions] = useState<ReferralWalletTransaction[]>([]);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getReferralId = (driver: any) => {
    // Display the driver referral ID from the API response (consistent with driver page)
    if (driver.driver_referral_id) {
      return driver.driver_referral_id;
    }
    return 'Not Assigned';
  };

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const driversData = await getDrivers();
      setDrivers(driversData);
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [getDrivers]);

  const loadDriverWallet = useCallback(async (driverId: string) => {
    try {
      const walletData = await getDriverReferralWallet(driverId);
      setWallets(prev => new Map(prev.set(driverId, walletData.wallet)));
    } catch (err: any) {
      console.error('Failed to load wallet for driver:', driverId, err);
    }
  }, []);

  const loadAllWallets = useCallback(async () => {
    if (drivers.length === 0) return;
    
    const promises = drivers.map(driver => loadDriverWallet(driver.id));
    await Promise.all(promises);
  }, [drivers, loadDriverWallet]);

  const handleViewTransactions = async (driver: any) => {
    setSelectedDriver(driver);
    try {
      const transactionsData = await getDriverReferralWalletTransactions(driver.id, 1, 50);
      setTransactions(transactionsData.transactions);
      setTransactionsDialogOpen(true);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: 'Failed to load transactions',
        severity: 'error'
      });
    }
  };

  const handleRequestPayout = (driver: any) => {
    setSelectedDriver(driver);
    setPayoutAmount('');
    setPayoutDialogOpen(true);
  };

  const handlePayoutConfirm = async () => {
    if (!selectedDriver || !payoutAmount) return;
    
    const wallet = wallets.get(selectedDriver.id);
    if (!wallet) return;
    
    const amountCents = Math.floor(parseFloat(payoutAmount) * 100);
    if (amountCents > wallet.available_balance_cents) {
      setSnackbar({
        open: true,
        message: 'Payout amount exceeds available balance',
        severity: 'error'
      });
      return;
    }

    try {
      setPayoutLoading(true);
      const result = await requestReferralPayout(selectedDriver.id, amountCents);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        setPayoutDialogOpen(false);
        setPayoutAmount('');
        loadDriverWallet(selectedDriver.id); // Refresh wallet
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Payout request failed',
          severity: 'error'
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Payout request failed',
        severity: 'error'
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  const copyReferralId = (referralId: string) => {
    navigator.clipboard.writeText(referralId);
    setSnackbar({
      open: true,
      message: 'Referral ID copied to clipboard',
      severity: 'success'
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'REFERRAL_CREDIT': return 'success';
      case 'REFERRAL_REVERSAL': return 'error';
      case 'PAYOUT': return 'info';
      case 'ADJUSTMENT': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  useEffect(() => {
    loadAllWallets();
  }, [loadAllWallets]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDrivers = drivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && drivers.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Driver Referral Wallets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage driver referral wallets, view balances, and process payouts.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Driver Wallets ({drivers.length})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAllWallets}
            disabled={loading}
          >
            Refresh All
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Referral ID</TableCell>
                <TableCell>Available Balance</TableCell>
                <TableCell>Total Credits</TableCell>
                <TableCell>Pending Balance</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDrivers.map((driver) => {
                const wallet = wallets.get(driver.id);
                const referralId = getReferralId(driver);
                
                return (
                  <TableRow key={driver.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {driver.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {driver.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace" data-testid="wallet-referral-code">
                          {referralId}
                        </Typography>
                        {driver.driver_referral_id && (
                          <Tooltip title="Copy Referral ID">
                            <IconButton
                              size="small"
                              onClick={() => copyReferralId(driver.driver_referral_id)}
                              data-testid="copy-referral-code"
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {wallet ? (
                        <Typography variant="h6" color="primary" fontWeight="bold" data-testid="wallet-balance">
                          {formatCurrency(wallet.available_balance_cents)}
                        </Typography>
                      ) : (
                        <CircularProgress size={20} />
                      )}
                    </TableCell>
                    <TableCell>
                      {wallet ? (
                        <Typography variant="body2">
                          {formatCurrency(wallet.total_referral_credits_cents)}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {wallet ? (
                        <Typography variant="body2" color="warning.main">
                          {formatCurrency(wallet.pending_balance_cents)}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {wallet ? (
                        <Typography variant="caption">
                          {new Date(wallet.last_updated).toLocaleDateString()}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Transactions">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewTransactions(driver)}
                            data-testid="view-transactions"
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                        {wallet && wallet.available_balance_cents > 0 && (
                          <Tooltip title="Request Payout">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleRequestPayout(driver)}
                            >
                              <PayoutIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={drivers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Transactions Dialog */}
      <Dialog 
        open={transactionsDialogOpen} 
        onClose={() => setTransactionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Transactions - {selectedDriver?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid="transaction-item">
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.transaction_type.replace('_', ' ')}
                        color={getTransactionTypeColor(transaction.transaction_type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.reference_id && (
                        <Typography variant="caption" color="text.secondary">
                          Ref: {transaction.reference_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={transaction.transaction_type === 'REFERRAL_CREDIT' ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {transaction.transaction_type === 'REFERRAL_CREDIT' ? '+' : '-'}
                        {formatCurrency(transaction.amount_cents)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog 
        open={payoutDialogOpen} 
        onClose={() => setPayoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Payout - {selectedDriver?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Balance: {selectedDriver && wallets.get(selectedDriver.id) ? 
                formatCurrency(wallets.get(selectedDriver.id)!.available_balance_cents) : '$0.00'}
            </Typography>
            <TextField
              fullWidth
              label="Payout Amount (CAD)"
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              inputProps={{ 
                min: 0, 
                max: selectedDriver && wallets.get(selectedDriver.id) ? 
                  wallets.get(selectedDriver.id)!.available_balance_cents / 100 : 0, 
                step: 0.01 
              }}
              helperText={`Maximum: ${selectedDriver && wallets.get(selectedDriver.id) ? 
                formatCurrency(wallets.get(selectedDriver.id)!.available_balance_cents) : '$0.00'}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayoutConfirm}
            variant="contained"
            disabled={!payoutAmount || payoutLoading}
          >
            {payoutLoading ? 'Processing...' : 'Request Payout'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  );
};

export default DriverReferralWalletsPage;
