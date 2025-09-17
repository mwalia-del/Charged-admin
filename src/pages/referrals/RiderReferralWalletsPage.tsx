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
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  History as HistoryIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { ReferralWallet, ReferralWalletTransaction } from '../../types';
import { 
  getRiderReferralWallet, 
  getRiderReferralWalletTransactions
} from '../../API/referrals';
import { useAuth } from '../../contexts/AuthContext';

const RiderReferralWalletsPage: React.FC = () => {
  const { getRiders } = useAuth();
  const [riders, setRiders] = useState<any[]>([]);
  const [wallets, setWallets] = useState<Map<string, ReferralWallet>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [transactions, setTransactions] = useState<ReferralWalletTransaction[]>([]);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
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

  const getReferralId = (rider: any) => {
    // Display the referral code from the database (generated during registration)
    if (rider.referral_code) {
      return rider.referral_code;
    }
    return 'Not Assigned';
  };

  const loadRiders = useCallback(async () => {
    try {
      setLoading(true);
      const ridersData = await getRiders();
      setRiders(ridersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  }, [getRiders]);

  const loadRiderWallet = useCallback(async (riderId: string) => {
    try {
      const walletData = await getRiderReferralWallet(riderId);
      setWallets(prev => new Map(prev.set(riderId, walletData.wallet)));
    } catch (err: any) {
      console.error('Failed to load wallet for rider:', riderId, err);
    }
  }, []);

  const loadAllWallets = useCallback(async () => {
    if (riders.length === 0) return;
    
    const promises = riders.map(rider => loadRiderWallet(rider.id));
    await Promise.all(promises);
  }, [riders, loadRiderWallet]);

  const handleViewTransactions = async (rider: any) => {
    setSelectedRider(rider);
    try {
      const transactionsData = await getRiderReferralWalletTransactions(rider.id, 1, 50);
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
    loadRiders();
  }, [loadRiders]);

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

  const paginatedRiders = riders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && riders.length === 0) {
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
          Rider Referral Wallets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage rider referral wallets and view ride credit balances.
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
            Rider Wallets ({riders.length})
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
                <TableCell>Rider</TableCell>
                <TableCell>Referral ID</TableCell>
                <TableCell>Available Balance</TableCell>
                <TableCell>Total Credits</TableCell>
                <TableCell>Pending Balance</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRiders.map((rider) => {
                const wallet = wallets.get(rider.id);
                const referralId = getReferralId(rider);
                
                return (
                  <TableRow key={rider.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {rider.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rider.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace" data-testid="wallet-referral-code">
                          {referralId}
                        </Typography>
                        {rider.referral_code && (
                          <Tooltip title="Copy Referral ID">
                            <IconButton
                              size="small"
                              onClick={() => copyReferralId(rider.referral_code)}
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
                            onClick={() => handleViewTransactions(rider)}
                            data-testid="view-transactions"
                          >
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
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
          count={riders.length}
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
            Transactions - {selectedRider?.name}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  );
};

export default RiderReferralWalletsPage;
