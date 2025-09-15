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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CardGiftcard as RewardsIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { BusinessRewardsSummary, BusinessRewardsResponse } from '../../../types';
import { getRewardsSummary, getRewardsLedger, adjustRewards } from '../../../API/business';
import { formatDate } from '../../../utils/formatters';

interface BusinessRewardsPageProps {
  orgId: string;
  businessName: string;
}

const BusinessRewardsPage: React.FC<BusinessRewardsPageProps> = ({
  orgId,
  businessName
}) => {
  const [summary, setSummary] = useState<BusinessRewardsSummary | null>(null);
  const [ledger, setLedger] = useState<BusinessRewardsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getRewardsSummary(orgId);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rewards summary');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const loadLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getRewardsLedger(orgId, page, pageSize);
      setLedger(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rewards ledger');
    } finally {
      setLoading(false);
    }
  }, [orgId, page, pageSize]);

  const handleAdjustRewards = async () => {
    if (!adjustPoints || !adjustReason) {
      setError('Please fill in all fields');
      return;
    }

    const points = parseInt(adjustPoints);
    if (isNaN(points) || points === 0) {
      setError('Please enter a valid points amount');
      return;
    }

    try {
      setAdjusting(true);
      setError(null);
      
      await adjustRewards(orgId, points, adjustReason);
      
      setAdjustDialogOpen(false);
      setAdjustPoints('');
      setAdjustReason('');
      
      // Refresh data
      loadSummary();
      loadLedger();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust rewards');
    } finally {
      setAdjusting(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes('Ride')) return 'success';
    if (reason.includes('Bonus')) return 'primary';
    if (reason.includes('Adjustment')) return 'warning';
    if (reason.includes('Refund')) return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rewards - {businessName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage business rewards points and view transaction history.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <RewardsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary" gutterBottom>
                  {summary.points.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Points
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  {summary.lifetime_points.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lifetime Points
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  {summary.last_earned_at ? formatDate(summary.last_earned_at) : 'Never'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAdjustDialogOpen(true)}
                  fullWidth
                >
                  Adjust Points
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Rewards Ledger */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Rewards Ledger
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadLedger}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : ledger && ledger.entries.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Points</TableCell>
                      <TableCell>Ride ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledger.entries.map((entry) => (
                      <TableRow key={entry.entry_id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(entry.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.reason}
                            color={getReasonColor(entry.reason) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={entry.delta_points >= 0 ? 'success.main' : 'error.main'}
                          >
                            {entry.delta_points >= 0 ? '+' : ''}{entry.delta_points.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {entry.ride_id || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={ledger.pagination.total}
                rowsPerPage={pageSize}
                page={page - 1}
                onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                onRowsPerPageChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No rewards transactions found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Adjust Points Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Rewards Points</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Points Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={adjustPoints}
            onChange={(e) => setAdjustPoints(e.target.value)}
            placeholder="Enter positive or negative points"
            helperText="Positive numbers add points, negative numbers subtract points"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Reason"
            fullWidth
            variant="outlined"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Enter reason for adjustment"
            helperText="Brief description of why points are being adjusted"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)} disabled={adjusting}>
            Cancel
          </Button>
          <Button
            onClick={handleAdjustRewards}
            variant="contained"
            disabled={adjusting || !adjustPoints || !adjustReason}
            startIcon={adjusting ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {adjusting ? 'Adjusting...' : 'Adjust Points'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BusinessRewardsPage;
