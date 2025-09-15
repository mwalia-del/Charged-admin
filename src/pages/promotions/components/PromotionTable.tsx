import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  PlayArrow as ActivateIcon,
  Stop as DeactivateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Promotion } from '../../../types';

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onPromotionUpdate: () => void;
}

const PromotionTable: React.FC<PromotionTableProps> = ({ promotions, onEdit, onPromotionUpdate }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (promotion: Promotion) => {
    const now = new Date();
    const startAt = new Date(promotion.start_at);
    const endAt = new Date(promotion.end_at);

    if (!promotion.is_active) {
      return <Chip label="Inactive" color="default" size="small" />;
    }

    if (startAt > now) {
      return <Chip label="Scheduled" color="warning" size="small" />;
    }

    if (endAt < now) {
      return <Chip label="Ended" color="error" size="small" />;
    }

    return <Chip label="Active" color="success" size="small" />;
  };

  const getRewardDisplay = (promotion: Promotion) => {
    switch (promotion.reward_type) {
      case 'percent_discount':
        return `${promotion.percent_off}% off`;
      case 'fixed_discount':
        return formatCurrency(promotion.value_cents || 0);
      case 'ride_credit':
        return `${formatCurrency(promotion.value_cents || 0)} credit`;
      case 'cash_bonus':
        return `${formatCurrency(promotion.value_cents || 0)} bonus`;
      case 'org_credit':
        return `${promotion.percent_off}% bonus`;
      default:
        return 'N/A';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'rider':
        return 'primary';
      case 'driver':
        return 'secondary';
      case 'business':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleActivate = async (promotion: Promotion) => {
    // TODO: Implement activation API call
    console.log('Activating promotion:', promotion.id);
    onPromotionUpdate();
  };

  const handleDeactivate = async (promotion: Promotion) => {
    // TODO: Implement deactivation API call
    console.log('Deactivating promotion:', promotion.id);
    onPromotionUpdate();
  };

  const handleDelete = async (promotion: Promotion) => {
    if (window.confirm(`Are you sure you want to delete "${promotion.title}"?`)) {
      // TODO: Implement deletion API call
      console.log('Deleting promotion:', promotion.id);
      onPromotionUpdate();
    }
  };

  if (promotions.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          No promotions found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Audience</TableCell>
            <TableCell>Reward Type</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Time Window</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Redemptions</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {promotions.map((promotion) => (
            <TableRow key={promotion.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {promotion.title}
                  </Typography>
                  {promotion.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {promotion.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={promotion.audience} 
                  color={getAudienceColor(promotion.audience)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {promotion.reward_type.replace('_', ' ').toUpperCase()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {getRewardDisplay(promotion)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {formatDate(promotion.start_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    to {formatDate(promotion.end_at)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {promotion.priority}
                </Typography>
              </TableCell>
              <TableCell>
                {getStatusChip(promotion)}
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {promotion.redemptions_count || 0}
                    {promotion.global_cap && ` / ${promotion.global_cap}`}
                  </Typography>
                  {promotion.max_uses_per_user && (
                    <Typography variant="caption" color="text.secondary">
                      {promotion.max_uses_per_user} per user
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                {promotion.code ? (
                  <Chip label={promotion.code} size="small" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Auto-apply
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(promotion)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {promotion.is_active ? (
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleDeactivate(promotion)}
                      >
                        <DeactivateIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activate">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleActivate(promotion)}
                      >
                        <ActivateIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(promotion)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PromotionTable;
