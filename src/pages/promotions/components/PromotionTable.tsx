import React, { useState } from 'react';
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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  PlayArrow as ActivateIcon,
  Stop as DeactivateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Promotion } from '../../../types';
import { activatePromotion, deactivatePromotion, deletePromotion } from '../../../API/promotions';

interface PromotionTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onPromotionUpdate: () => void;
}

const PromotionTable: React.FC<PromotionTableProps> = ({ promotions, onEdit, onPromotionUpdate }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusChip = (promotion: Promotion) => {
    const now = new Date();
    
    try {
      const startAt = promotion.start_at ? new Date(promotion.start_at) : null;
      const endAt = promotion.end_at ? new Date(promotion.end_at) : null;

      if (!promotion.is_active) {
        return <Chip label="Inactive" color="default" size="small" />;
      }

      if (startAt && startAt > now) {
        return <Chip label="Scheduled" color="warning" size="small" />;
      }

      if (endAt && endAt < now) {
        return <Chip label="Ended" color="error" size="small" />;
      }

      return <Chip label="Active" color="success" size="small" />;
    } catch (error) {
      return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  const getRewardDisplay = (promotion: Promotion) => {
    if (!promotion.reward_type) return 'N/A';
    
    switch (promotion.reward_type) {
      case 'percent_discount':
        return `${promotion.percent_off || 0}% off`;
      case 'fixed_discount':
        return formatCurrency(promotion.value_cents || 0);
      case 'ride_credit':
        return `${formatCurrency(promotion.value_cents || 0)} credit`;
      case 'cash_bonus':
        return `${formatCurrency(promotion.value_cents || 0)} bonus`;
      case 'org_credit':
        return `${promotion.percent_off || 0}% bonus`;
      default:
        return 'N/A';
    }
  };

  const getAudienceColor = (audience: string) => {
    if (!audience) return 'default';
    
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
    setLoading(promotion.id);
    try {
      await activatePromotion(promotion.id);
      setSnackbar({
        open: true,
        message: `Promotion "${promotion.title}" activated successfully`,
        severity: 'success'
      });
      onPromotionUpdate();
    } catch (error) {
      console.error('Error activating promotion:', error);
      setSnackbar({
        open: true,
        message: `Failed to activate promotion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeactivate = async (promotion: Promotion) => {
    setLoading(promotion.id);
    try {
      await deactivatePromotion(promotion.id);
      setSnackbar({
        open: true,
        message: `Promotion "${promotion.title}" deactivated successfully`,
        severity: 'success'
      });
      onPromotionUpdate();
    } catch (error) {
      console.error('Error deactivating promotion:', error);
      setSnackbar({
        open: true,
        message: `Failed to deactivate promotion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (window.confirm(`Are you sure you want to delete "${promotion.title}"?`)) {
      setLoading(promotion.id);
      try {
        await deletePromotion(promotion.id);
        setSnackbar({
          open: true,
          message: `Promotion "${promotion.title}" deleted successfully`,
          severity: 'success'
        });
        onPromotionUpdate();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        setSnackbar({
          open: true,
          message: `Failed to delete promotion: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        });
      } finally {
        setLoading(null);
      }
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
    <>
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
                  label={promotion.audience || 'Unknown'} 
                  color={getAudienceColor(promotion.audience)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {promotion.reward_type ? promotion.reward_type.replace('_', ' ').toUpperCase() : 'N/A'}
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
                        disabled={loading === promotion.id}
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
                          disabled={loading === promotion.id}
                        >
                          {loading === promotion.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeactivateIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Activate">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActivate(promotion)}
                          disabled={loading === promotion.id}
                        >
                          {loading === promotion.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ActivateIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(promotion)}
                        disabled={loading === promotion.id}
                      >
                        {loading === promotion.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PromotionTable;
