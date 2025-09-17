import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { ScheduledRide, ScheduledRideFilters } from '../../../types';

interface ScheduledTableProps {
  scheduledRides: ScheduledRide[];
  loading: boolean;
  filters: ScheduledRideFilters;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onAssignDriver: (scheduledRideId: string, driverId: string) => void;
  onCancelRide: (scheduledRideId: string, reason: string) => void;
}

// Mock drivers removed - will be populated from API when available
const mockDrivers: Array<{ id: string; name: string }> = [];

const ScheduledTable: React.FC<ScheduledTableProps> = ({
  scheduledRides,
  loading,
  filters,
  onPageChange,
  onPageSizeChange,
  onAssignDriver,
  onCancelRide
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRide, setSelectedRide] = useState<ScheduledRide | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const getStatusColor = (status: ScheduledRide['status']) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'preparing': return 'warning';
      case 'dispatching': return 'info';
      case 'converted': return 'success';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ScheduledRide['status']) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'preparing': return 'Preparing';
      case 'dispatching': return 'Dispatching';
      case 'converted': return 'Converted';
      case 'cancelled': return 'Cancelled';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ride: ScheduledRide) => {
    setAnchorEl(event.currentTarget);
    setSelectedRide(ride);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRide(null);
  };

  const handleAssignDriver = () => {
    setAssignDialogOpen(true);
    handleMenuClose();
  };

  const handleCancelRide = () => {
    setCancelDialogOpen(true);
    handleMenuClose();
  };

  const handleAssignConfirm = () => {
    if (selectedRide && selectedDriverId) {
      onAssignDriver(selectedRide.id, selectedDriverId);
      setAssignDialogOpen(false);
      setSelectedDriverId('');
    }
  };

  const handleCancelConfirm = () => {
    if (selectedRide && cancelReason) {
      onCancelRide(selectedRide.id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
    }
  };

  const handleViewRide = () => {
    if (selectedRide?.ride_id) {
      // Navigate to ride details
      console.log('View ride:', selectedRide.ride_id);
    }
    handleMenuClose();
  };

  return (
    <>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Rider/Org</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Ride #</TableCell>
              <TableCell>Est. Fare</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : scheduledRides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No scheduled rides found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              scheduledRides.map((ride) => (
                <TableRow key={ride.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDateTime(ride.scheduled_for)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ±{ride.window_minutes} min
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {ride.source === 'rider' ? (
                        <PersonIcon fontSize="small" color="primary" />
                      ) : (
                        <BusinessIcon fontSize="small" color="secondary" />
                      )}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {ride.source}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ride.rider_name || ride.org_name || 'Unknown'}
                    </Typography>
                    {ride.notes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {ride.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {ride.pickup_address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        → {ride.dropoff_address}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(ride.status)}
                      color={getStatusColor(ride.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {ride.driver_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CarIcon fontSize="small" />
                        <Typography variant="body2">
                          {ride.driver_name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {ride.ride_id ? (
                      <Typography variant="body2" fontFamily="monospace">
                        #{ride.ride_id}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {ride.est_fare_cents ? (
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(ride.est_fare_cents)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, ride)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={scheduledRides.length}
        rowsPerPage={filters.page_size || 10}
        page={(filters.page || 1) - 1}
        onPageChange={(_, page) => onPageChange(page + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRide?.ride_id && (
          <MenuItem onClick={handleViewRide}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Ride</ListItemText>
          </MenuItem>
        )}
        {!selectedRide?.driver_id && selectedRide?.status === 'scheduled' && (
          <MenuItem onClick={handleAssignDriver}>
            <ListItemIcon>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Driver</ListItemText>
          </MenuItem>
        )}
        {(selectedRide?.status === 'scheduled' || selectedRide?.status === 'preparing') && (
          <MenuItem onClick={handleCancelRide}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancel Ride</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Assign Driver Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Driver</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select a driver for this scheduled ride
            </Typography>
            <TextField
              fullWidth
              select
              label="Driver"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              sx={{ mt: 2 }}
            >
              {mockDrivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignConfirm} variant="contained" disabled={!selectedDriverId}>
            Assign Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Ride Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Scheduled Ride</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please provide a reason for cancelling this scheduled ride
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Cancellation Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCancelConfirm} variant="contained" color="error" disabled={!cancelReason}>
            Cancel Ride
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduledTable;
