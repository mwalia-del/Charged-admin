import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ScheduledRideSummary } from '../../../types';

interface ScheduledSummaryProps {
  summary: ScheduledRideSummary;
  onRefresh: () => void;
  loading?: boolean;
}

const ScheduledSummary: React.FC<ScheduledSummaryProps> = ({ 
  summary, 
  onRefresh, 
  loading = false 
}) => {
  const summaryCards = [
    {
      title: 'Scheduled',
      value: summary.scheduled_count,
      icon: <ScheduleIcon />,
      color: 'primary',
      description: 'Upcoming rides'
    },
    {
      title: 'Converted (24h)',
      value: summary.converted_24h,
      icon: <CheckCircleIcon />,
      color: 'success',
      description: 'Completed today'
    },
    {
      title: 'Converted (7d)',
      value: summary.converted_7d,
      icon: <TrendingUpIcon />,
      color: 'info',
      description: 'Completed this week'
    },
    {
      title: 'Cancelled',
      value: summary.cancelled_count,
      icon: <CancelIcon />,
      color: 'warning',
      description: 'Cancelled rides'
    },
    {
      title: 'Failed',
      value: summary.failed_count,
      icon: <ErrorIcon />,
      color: 'error',
      description: 'Failed to convert'
    },
    {
      title: 'Upcoming',
      value: summary.upcoming_count,
      icon: <ScheduleIcon />,
      color: 'secondary',
      description: 'Next 24 hours'
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scheduled Rides Summary
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderLeft: `4px solid`,
                borderLeftColor: `${card.color}.main`,
                '&:hover': {
                  elevation: 2,
                  transition: 'elevation 0.2s'
                }
              }}
            >
              <Box
                sx={{
                  color: `${card.color}.main`,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {card.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ScheduledSummary;
