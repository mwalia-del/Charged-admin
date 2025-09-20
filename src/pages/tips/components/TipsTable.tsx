import React from 'react';
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
} from '@mui/material';
import { Visibility as ViewIcon, FileDownload as ExportIcon } from '@mui/icons-material';
import { TipsResponse } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface TipsTableProps {
  tips: TipsResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewRide: (rideId: string) => void;
  onExport: () => void;
}

const TipsTable: React.FC<TipsTableProps> = ({
  tips,
  loading,
  onPageChange,
  onPageSizeChange,
  onViewRide,
  onExport
}) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'success';
      case 'authorized':
        return 'warning';
      case 'refunded':
        return 'error';
      case 'void':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'settled':
        return 'Settled';
      case 'authorized':
        return 'Authorized';
      case 'refunded':
        return 'Refunded';
      case 'void':
        return 'Void';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading tips...</Typography>
      </Box>
    );
  }

  if (!tips) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>No tips data available</Typography>
      </Box>
    );
  }

  // Debug: Log the tips data structure
  console.log('🎯 TipsTable - tips data:', tips);
  console.log('🎯 TipsTable - tips structure:', {
    hasTips: !!tips,
    hasRows: !!tips?.rows,
    tipsKeys: Object.keys(tips || {}),
    rowsLength: tips?.rows?.length || 0
  });

  // Debug: Log individual tip amounts to see the actual data format
  if (tips?.rows && tips.rows.length > 0) {
    console.log('🎯 TipsTable - Sample tip data (first 3 tips):', tips.rows.slice(0, 3).map(tip => ({
      id: tip.id,
      driver_id: tip.driver_id,
      driver_name: tip.driver_name,
      rider_id: tip.rider_id,
      rider_name: tip.rider_name,
      tip_amount: tip.tip_amount,
      amount_cents: tip.amount_cents,
      tip_amount_type: typeof tip.tip_amount,
      amount_cents_type: typeof tip.amount_cents,
      tip_amount_parsed: tip.tip_amount ? parseFloat(tip.tip_amount) : null,
      is_likely_cents: tip.tip_amount ? parseFloat(tip.tip_amount) > 100 : false,
      raw_tip: tip
    })));
    
    // Debug: Check if filtering is working - show all driver IDs in the data
    const driverIds = tips.rows.map(tip => tip.driver_id);
    const uniqueDriverIds = Array.from(new Set(driverIds));
    console.log('🎯 TipsTable - All driver IDs in current data:', uniqueDriverIds);
    console.log('🎯 TipsTable - Total tips count:', tips.rows.length);
  }

  if (!tips || !tips.rows || tips.rows.length === 0) {
    console.log('🎯 TipsTable - No tips found, showing empty state');
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No tips found matching your criteria
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Debug: tips={!!tips}, rows={!!tips?.rows}, length={tips?.rows?.length || 0}
        </Typography>
      </Paper>
    );
  }

  // Additional safety check for pagination
  if (!tips.pagination) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Error loading tips data
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Tips ({tips.pagination.total})
        </Typography>
        <IconButton onClick={onExport} color="primary" title="Export to CSV">
          <ExportIcon />
        </IconButton>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Ride #</TableCell>
              <TableCell>Rider</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tip ID</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tips.rows.map((tip) => (
              <TableRow key={tip.id || tip.tip_id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(tip.added_at || tip.created_at || '')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {tip.ride_number || `R${tip.ride_id}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {tip.rider_name || tip.rider_email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tip.rider_id ? `ID: ${tip.rider_id}` : tip.rider_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {tip.driver_name || 'Unknown Driver'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tip.driver_id ? `ID: ${tip.driver_id}` : 'Driver ID not available'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {(() => {
                      if (tip.tip_amount) {
                        const amount = parseFloat(tip.tip_amount);
                        // If tip_amount is greater than 100, it's likely in cents (e.g., 1500 = $15.00)
                        // If tip_amount is less than 100, it's likely in dollars (e.g., 15.00 = $15.00)
                        const displayAmount = amount > 100 ? amount / 100 : amount;
                        return `$${displayAmount.toFixed(2)}`;
                      } else if (tip.amount_cents) {
                        return formatCurrency(tip.amount_cents);
                      } else {
                        return '$0.00';
                      }
                    })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tip.tip_percentage ? `${tip.tip_percentage}%` : tip.currency || 'CAD'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(tip.status || 'settled')}
                    color={getStatusColor(tip.status || 'settled') as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {(tip.tip_id || tip.id.toString()).substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Ride Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onViewRide(tip.ride_id.toString())}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={tips.pagination?.total || 0}
        rowsPerPage={tips.pagination?.page_size || 25}
        page={(tips.pagination?.page || 1) - 1}
        onPageChange={(_, page) => onPageChange(page + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default TipsTable;
