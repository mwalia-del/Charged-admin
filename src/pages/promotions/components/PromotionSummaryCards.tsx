import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  PlayArrow as ActiveIcon,
  Schedule as ScheduledIcon,
  Stop as EndedIcon,
  Redeem as RedeemIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { PromotionSummary } from '../../../types';

interface PromotionSummaryCardsProps {
  summary: PromotionSummary;
}

const PromotionSummaryCards: React.FC<PromotionSummaryCardsProps> = ({ summary }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const cards = [
    {
      title: 'Total Promotions',
      value: summary.total_promotions,
      icon: <CampaignIcon />,
      color: '#1976d2',
    },
    {
      title: 'Active Promotions',
      value: summary.active_promotions,
      icon: <ActiveIcon />,
      color: '#2e7d32',
    },
    {
      title: 'Scheduled Promotions',
      value: summary.scheduled_promotions,
      icon: <ScheduledIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Ended Promotions',
      value: summary.ended_promotions,
      icon: <EndedIcon />,
      color: '#d32f2f',
    },
    {
      title: 'Total Redemptions',
      value: summary.total_redemptions.toLocaleString(),
      icon: <RedeemIcon />,
      color: '#7b1fa2',
    },
    {
      title: 'Total Value',
      value: formatCurrency(summary.total_value_cents),
      icon: <MoneyIcon />,
      color: '#388e3c',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Box
                  sx={{
                    color: card.color,
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem' }}>
                  {card.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PromotionSummaryCards;
