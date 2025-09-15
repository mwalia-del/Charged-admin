import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  RequestPage as PayoutIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ReferralWallet, ReferralWalletTransaction } from '../../types';
import { 
  getDriverReferralWallet, 
  getRiderReferralWallet, 
  getDriverReferralWalletTransactions,
  getRiderReferralWalletTransactions,
  requestReferralPayout 
} from '../../API/referrals';

interface ReferralWalletCardProps {
  userId: string;
  userType: 'driver' | 'rider';
  userName: string;
  onRefresh?: () => void;
}

const ReferralWalletCard: React.FC<ReferralWalletCardProps> = ({
  userId,
  userType,
  userName,
  onRefresh
}) => {
  const [wallet, setWallet] = useState<ReferralWallet | null>(null);
  const [transactions, setTransactions] = useState<ReferralWalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const walletData = userType === 'driver' 
        ? await getDriverReferralWallet(userId)
        : await getRiderReferralWallet(userId);
      
      setWallet(walletData.wallet);
      setTransactions(walletData.recent_transactions);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  const loadTransactions = async () => {
    try {
      const transactionsData = userType === 'driver'
        ? await getDriverReferralWalletTransactions(userId, 1, 20)
        : await getRiderReferralWalletTransactions(userId, 1, 20);
      
      setTransactions(transactionsData.transactions);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    }
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !wallet) return;
    
    const amountCents = Math.floor(parseFloat(payoutAmount) * 100);
    if (amountCents > wallet.available_balance_cents) {
      setError('Payout amount exceeds available balance');
      return;
    }

    try {
      setPayoutLoading(true);
      setError(null);
      
      const result = await requestReferralPayout(userId, amountCents);
      
      if (result.success) {
        setSuccess(result.message);
        setPayoutDialogOpen(false);
        setPayoutAmount('');
        loadWallet(); // Refresh wallet data
        if (onRefresh) onRefresh();
      } else {
        setError(result.message || 'Payout request failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payout request failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'REFERRAL_CREDIT':
        return 'success';
      case 'REFERRAL_REVERSAL':
        return 'error';
      case 'PAYOUT':
        return 'info';
      case 'ADJUSTMENT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    loadWallet();
  }, [userId, userType, loadWallet]);

  if (loading && !wallet) {
    return (
      <Card sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            No referral wallet data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WalletIcon color="primary" />
              Referral Wallet
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadWallet} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatCurrency(wallet.available_balance_cents)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Balance
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Referral Credits
              </Typography>
              <Typography variant="h6">
                {formatCurrency(wallet.total_referral_credits_cents)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Pending Balance
              </Typography>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(wallet.pending_balance_cents)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setTransactionsDialogOpen(true)}
              size="small"
            >
              View Transactions
            </Button>
            {userType === 'driver' && wallet.available_balance_cents > 0 && (
              <Button
                variant="contained"
                startIcon={<PayoutIcon />}
                onClick={() => setPayoutDialogOpen(true)}
                size="small"
                color="primary"
              >
                Request Payout
              </Button>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(wallet.last_updated).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Transactions Dialog */}
      <Dialog 
        open={transactionsDialogOpen} 
        onClose={() => setTransactionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Referral Wallet Transactions</Typography>
            <IconButton onClick={loadTransactions} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
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
                  <TableRow key={transaction.id}>
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
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Balance: {formatCurrency(wallet.available_balance_cents)}
            </Typography>
            <TextField
              fullWidth
              label="Payout Amount (CAD)"
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              inputProps={{ min: 0, max: wallet.available_balance_cents / 100, step: 0.01 }}
              helperText={`Maximum: ${formatCurrency(wallet.available_balance_cents)}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayoutRequest}
            variant="contained"
            disabled={!payoutAmount || payoutLoading}
          >
            {payoutLoading ? 'Processing...' : 'Request Payout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReferralWalletCard;
