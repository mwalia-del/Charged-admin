import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
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
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { BusinessWalletResponse } from '../../../types';
import { getWalletTransactions } from '../../../API/business';
import { formatDate } from '../../../utils/formatters';

interface BusinessWalletCardProps {
  orgId: string;
  walletBalance: number;
  onRefresh: () => void;
}

const BusinessWalletCard: React.FC<BusinessWalletCardProps> = ({
  orgId,
  walletBalance,
  onRefresh
}) => {
  const [transactions, setTransactions] = useState<BusinessWalletResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'success';
      case 'DEBIT':
        return 'error';
      case 'REFUND':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'Credit';
      case 'DEBIT':
        return 'Debit';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWalletTransactions(orgId, page, pageSize);
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [orgId, page, pageSize]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WalletIcon color="primary" />
            <Typography variant="h6">
              Wallet Transactions
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadTransactions}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onRefresh}
              size="small"
            >
              Add Credits
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            {formatCurrency(walletBalance)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Wallet Balance
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions && transactions.transactions.length > 0 ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Ride ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTransactionTypeLabel(transaction.type)}
                          color={getTransactionTypeColor(transaction.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={transaction.amount_cents >= 0 ? 'success.main' : 'error.main'}
                        >
                          {transaction.amount_cents >= 0 ? '+' : ''}{formatCurrency(transaction.amount_cents)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.ride_id || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={transactions.pagination.total}
              rowsPerPage={pageSize}
              page={page - 1}
              onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
              onRowsPerPageChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
            />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No transactions found
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessWalletCard;
