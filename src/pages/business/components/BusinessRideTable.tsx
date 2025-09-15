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
import { BusinessRidesResponse } from '../../../types';
import { formatDate } from '../../../utils/formatters';

interface BusinessRideTableProps {
  rides: BusinessRidesResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewRide: (rideId: string) => void;
  onExport: () => void;
}

const BusinessRideTable: React.FC<BusinessRideTableProps> = ({
  rides,
  loading,
  onPageChange,
  onPageSizeChange,
  onViewRide,
  onExport
}) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getBillingModeColor = (mode: string) => {
    switch (mode) {
      case 'invoice':
        return 'primary';
      case 'credit':
        return 'success';
      default:
        return 'default';
    }
  };

  const getBillingModeLabel = (mode: string) => {
    switch (mode) {
      case 'invoice':
        return 'Invoice';
      case 'credit':
        return 'Credit';
      default:
        return mode;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading rides...</Typography>
      </Box>
    );
  }

  if (!rides || rides.rows.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No rides found matching your criteria
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Business Rides ({rides.pagination.total})
        </Typography>
        <IconButton onClick={onExport} color="primary" title="Export to CSV">
          <ExportIcon />
        </IconButton>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ride #</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Rider ID</TableCell>
              <TableCell>Driver ID</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Billing Mode</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rides.rows.map((ride) => (
              <TableRow key={ride.ride_id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {ride.ride_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(ride.started_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(ride.completed_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ride.rider_id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {ride.driver_id}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatCurrency(ride.billable_amount_cents)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getBillingModeLabel(ride.billing_mode)}
                    color={getBillingModeColor(ride.billing_mode) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Ride Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onViewRide(ride.ride_id)}
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
        count={rides.pagination.total}
        rowsPerPage={rides.pagination.page_size}
        page={rides.pagination.page - 1}
        onPageChange={(_, page) => onPageChange(page + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default BusinessRideTable;
