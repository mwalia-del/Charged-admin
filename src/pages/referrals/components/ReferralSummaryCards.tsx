import React from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { AttachMoney, TrendingUp, Star, People } from '@mui/icons-material';
import { ReferralSummary } from '../../../types';

interface ReferralSummaryCardsProps {
  summary: ReferralSummary | null;
  loading: boolean;
}

const ReferralSummaryCards: React.FC<ReferralSummaryCardsProps> = ({ summary, loading }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const averageIssuance = summary && summary.count > 0 
    ? summary.total_amount_cents / summary.count 
    : 0;

  const tier1Count = summary?.by_tier?.find(t => t.tier === 1)?.count || 0;
  const tier2Count = summary?.by_tier?.find(t => t.tier === 2)?.count || 0;
  const topReferrersCount = summary?.by_referrer?.length || 0;

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
            Total Amount
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
            Total Issuances
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
          <Typography variant="h4" color="warning.main" gutterBottom>
            {formatCurrency(averageIssuance)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg per Issuance
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
          <Typography variant="h4" color="info.main" gutterBottom>
            {topReferrersCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Referrers
          </Typography>
        </Paper>
      </Grid>

      {/* Tier Breakdown */}
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Tier 1 (25¢)
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {tier1Count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issuances
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3, textAlign: 'center' }} elevation={2}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Tier 2 (50¢)
          </Typography>
          <Typography variant="h4" color="success.main" gutterBottom>
            {tier2Count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issuances
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ReferralSummaryCards;
