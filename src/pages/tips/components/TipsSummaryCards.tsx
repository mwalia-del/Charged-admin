import React from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { AttachMoney, TrendingUp, Star } from '@mui/icons-material';
import { TipSummary } from '../../../types';

interface TipsSummaryCardsProps {
  summary: TipSummary | null;
  loading: boolean;
}

const TipsSummaryCards: React.FC<TipsSummaryCardsProps> = ({ summary, loading }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const averageTip = summary && summary.count > 0 
    ? summary.total_amount_cents / summary.count 
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" color="primary" gutterBottom>
            {summary ? formatCurrency(summary.total_amount_cents) : '$0.00'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Tips
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="h4" color="success.main" gutterBottom>
            {summary?.count || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Count
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
          <Typography variant="h4" color="warning.main" gutterBottom>
            {formatCurrency(averageTip)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Tip
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {summary?.by_driver?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Drivers
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TipsSummaryCards;
