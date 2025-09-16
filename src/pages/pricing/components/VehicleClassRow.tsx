import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Switch,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { VehicleClass, VehicleClassUpdate } from '../../../types';
import { updateVehicleClass } from '../../../API/vehicleClasses';

interface VehicleClassRowProps {
  vehicleClass: VehicleClass;
  onUpdate: (code: string, updates: VehicleClassUpdate) => void;
  onError: (error: string) => void;
}

const VehicleClassRow: React.FC<VehicleClassRowProps> = ({
  vehicleClass,
  onUpdate,
  onError,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(vehicleClass.is_enabled);

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!enabled && vehicleClass.code === 'charged_xl') {
      setPendingEnabled(enabled);
      setShowDisableDialog(true);
      return;
    }

    await updateVehicleClassField('is_enabled', enabled);
  };

  const updateVehicleClassField = async (field: keyof VehicleClassUpdate, value: any) => {
    setIsUpdating(true);
    try {
      await updateVehicleClass(vehicleClass.code, { [field]: value });
      onUpdate(vehicleClass.code, { [field]: value });
    } catch (error) {
      onError(`Failed to update ${field}: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDisable = async () => {
    setShowDisableDialog(false);
    await updateVehicleClassField('is_enabled', pendingEnabled);
  };

  const cancelDisable = () => {
    setShowDisableDialog(false);
    setPendingEnabled(vehicleClass.is_enabled);
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'success' : 'error';
  };

  const getStatusLabel = (enabled: boolean) => {
    return enabled ? 'Enabled' : 'Disabled';
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {vehicleClass.display_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {vehicleClass.code}
          </Typography>
        </TableCell>

        <TableCell>
          <Chip
            label={getStatusLabel(vehicleClass.is_enabled)}
            color={getStatusColor(vehicleClass.is_enabled)}
            size="small"
          />
        </TableCell>

        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {new Date(vehicleClass.updated_at).toLocaleDateString()}
          </Typography>
        </TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={vehicleClass.is_enabled ? "Disable Charged XL" : "Enable Charged XL"}>
              <Switch
                checked={vehicleClass.is_enabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                disabled={isUpdating}
                size="small"
              />
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      {/* Disable Confirmation Dialog */}
      <Dialog
        open={showDisableDialog}
        onClose={cancelDisable}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Disable Charged XL</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disable Charged XL? This will:
            <br />
            • Hide Charged XL from all rider, driver, and business apps
            <br />
            • Block any new bookings for Charged XL
            <br />
            • Apply changes immediately across all platforms
            <br />
            <br />
            You can re-enable it at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDisable} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDisable} color="error" variant="contained">
            Disable Charged XL
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VehicleClassRow;
