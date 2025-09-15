import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  CardGiftcard as RewardsIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Business } from '../../../types';
import { setEnrollment, createCreditPurchase } from '../../../API/business';

interface BusinessHeaderProps {
  business: Business;
  onBusinessUpdate: (updatedBusiness: Business) => void;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ business, onBusinessUpdate }) => {
  const [enrollmentAnchor, setEnrollmentAnchor] = useState<null | HTMLElement>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleEnrollmentClick = (event: React.MouseEvent<HTMLElement>) => {
    setEnrollmentAnchor(event.currentTarget);
  };

  const handleEnrollmentClose = () => {
    setEnrollmentAnchor(null);
  };

  const handleEnrollmentChange = async (mode: "invoice" | "credit") => {
    try {
      setLoading(true);
      setError(null);
      
      await setEnrollment(business.org_id, mode);
      
      // Update local state
      onBusinessUpdate({
        ...business,
        billing_mode: mode
      });
      
      setSuccess(`Business enrollment changed to ${mode} mode`);
      handleEnrollmentClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update enrollment mode');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPurchase = async () => {
    if (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const amountCents = Math.round(Number(creditAmount) * 100);
      const idempotencyKey = `credit_${business.org_id}_${Date.now()}`;
      
      await createCreditPurchase(business.org_id, amountCents, "CAD", idempotencyKey);
      
      setSuccess(`Successfully purchased $${creditAmount} in credits`);
      setCreditDialogOpen(false);
      setCreditAmount('');
      
      // Refresh business data
      // Note: In a real app, you'd refetch the business data here
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase credits');
    } finally {
      setLoading(false);
    }
  };

  const getBillingModeColor = (mode: string | null) => {
    switch (mode) {
      case 'invoice':
        return 'primary';
      case 'credit':
        return 'success';
      default:
        return 'default';
    }
  };

  const getBillingModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'invoice':
        return 'Invoice';
      case 'credit':
        return 'Credit';
      default:
        return 'Not Set';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {business.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {business.email} • {business.phone}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEnrollmentClick}
            disabled={loading}
          >
            {getBillingModeLabel(business.billing_mode)}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreditDialogOpen(true)}
            disabled={loading}
          >
            Add Credits
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Mode:
          </Typography>
          <Chip
            label={getBillingModeLabel(business.billing_mode)}
            color={getBillingModeColor(business.billing_mode) as any}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Month Spend:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatCurrency(business.month_spend_cents)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WalletIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Wallet:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatCurrency(business.wallet_balance_cents)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RewardsIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Rewards:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {business.rewards_points.toLocaleString()} pts
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Enrollment Mode Menu */}
      <Menu
        anchorEl={enrollmentAnchor}
        open={Boolean(enrollmentAnchor)}
        onClose={handleEnrollmentClose}
      >
        <MenuItem onClick={() => handleEnrollmentChange('invoice')}>
          Invoice Mode
        </MenuItem>
        <MenuItem onClick={() => handleEnrollmentChange('credit')}>
          Credit Mode
        </MenuItem>
      </Menu>

      {/* Credit Purchase Dialog */}
      <Dialog open={creditDialogOpen} onClose={() => setCreditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Credits</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (CAD)"
            type="number"
            fullWidth
            variant="outlined"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            placeholder="Enter amount in CAD"
            helperText="Enter the amount you want to add to the business wallet"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreditDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreditPurchase}
            variant="contained"
            disabled={loading || !creditAmount}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Processing...' : 'Purchase Credits'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessHeader;
