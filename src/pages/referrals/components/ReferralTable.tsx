import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  TablePagination,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  FileDownload as ExportIcon,
  Block as VoidIcon,
  AccountBalanceWallet as WalletIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { ReferralIssuancesResponse } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { voidIssuance } from '../../../API/referrals';

interface ReferralTableProps {
  issuances: ReferralIssuancesResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewRide: (rideId: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  onEditWallet?: (referrerId: string, referrerType: 'driver' | 'rider') => void;
}

const ReferralTable: React.FC<ReferralTableProps> = ({
  issuances,
  loading,
  onPageChange,
  onPageSizeChange,
  onViewRide,
  onExport,
  onRefresh,
  onEditWallet
}) => {
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<any>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'success';
      case 'voided':
        return 'error';
      case 'refunded':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued':
        return 'Issued';
      case 'voided':
        return 'Voided';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getTierColor = (tier: number) => {
    return tier === 1 ? 'primary' : 'secondary';
  };

  const getReferrerTypeColor = (type: string) => {
    return type === 'driver' ? 'info' : 'warning';
  };

  const handleVoidClick = (issuance: any) => {
    setSelectedIssuance(issuance);
    setVoidReason('');
    setVoidError(null);
    setVoidDialogOpen(true);
  };

  const handleVoidConfirm = async () => {
    if (!selectedIssuance || !voidReason.trim()) {
      setVoidError('Please provide a reason for voiding');
      return;
    }

    try {
      setVoiding(true);
      setVoidError(null);
      
      await voidIssuance(selectedIssuance.issuance_id, voidReason);
      
      setVoidDialogOpen(false);
      setSelectedIssuance(null);
      setVoidReason('');
      
      // Refresh the data
      onRefresh();
    } catch (err: any) {
      setVoidError(err.response?.data?.message || 'Failed to void issuance');
    } finally {
      setVoiding(false);
    }
  };

  const handleVoidCancel = () => {
    setVoidDialogOpen(false);
    setSelectedIssuance(null);
    setVoidReason('');
    setVoidError(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, issuance: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(issuance);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRow(null);
  };

  const handleEditWallet = () => {
    if (selectedRow && onEditWallet) {
      onEditWallet(selectedRow.referrer_id, selectedRow.referrer_type);
    }
    handleMenuClose();
  };

  const handleCopyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a snackbar notification here
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading referral issuances...</Typography>
      </Box>
    );
  }

  if (!issuances || issuances.rows.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No referral issuances found matching your criteria
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={3}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Referral Issuances ({issuances.pagination.total})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={onExport} color="primary" title="Export to CSV">
              <ExportIcon />
            </IconButton>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Ride #</TableCell>
                <TableCell>Referred Rider</TableCell>
                <TableCell>Referrer</TableCell>
                <TableCell>Referral Code</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell align="right">Earned Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Issuance ID</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issuances.rows.map((issuance) => (
                <TableRow key={issuance.issuance_id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(issuance.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {issuance.ride_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {issuance.referred_rider_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {issuance.referred_rider_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={issuance.referrer_type}
                        color={getReferrerTypeColor(issuance.referrer_type) as any}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {issuance.referrer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {issuance.referrer_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                        {issuance.referrer_code || 'N/A'}
                      </Typography>
                      {issuance.referrer_code && (
                        <Tooltip title="Copy Referral Code">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyReferralCode(issuance.referrer_code)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Tier ${issuance.tier}`}
                      color={getTierColor(issuance.tier) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(issuance.amount_cents)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {issuance.currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(issuance.status)}
                      color={getStatusColor(issuance.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {issuance.issuance_id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Ride Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onViewRide(issuance.ride_id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, issuance)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={issuances.pagination.total}
          rowsPerPage={issuances.pagination.page_size}
          page={issuances.pagination.page - 1}
          onPageChange={(_, page) => onPageChange(page + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        />
      </Paper>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onClose={handleVoidCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Void Referral Issuance</DialogTitle>
        <DialogContent>
          {selectedIssuance && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Issuance ID: {selectedIssuance.issuance_id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount: {formatCurrency(selectedIssuance.amount_cents)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Referrer: {selectedIssuance.referrer_name} ({selectedIssuance.referrer_type})
              </Typography>
            </Box>
          )}
          
          {voidError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {voidError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Voiding"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="Enter reason for voiding this referral issuance (e.g., abuse, chargeback, etc.)"
            helperText="This action cannot be undone. A reversing wallet entry will be created."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVoidCancel} disabled={voiding}>
            Cancel
          </Button>
          <Button
            onClick={handleVoidConfirm}
            variant="contained"
            color="error"
            disabled={voiding || !voidReason.trim()}
          >
            {voiding ? 'Voiding...' : 'Void Issuance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditWallet}>
          <ListItemIcon>
            <WalletIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Wallet</ListItemText>
        </MenuItem>
        {selectedRow?.status === 'issued' && (
          <MenuItem onClick={() => {
            handleVoidClick(selectedRow);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <VoidIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Void Issuance</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ReferralTable;
