import { Adjust } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  AdjustmentType,
  ChangeRewardPointsBody,
  Rider,
} from "../../../../types";

interface RewardAdjustmentDialogProps {
  adjustmentDialogOpen: boolean;
  setIsAdjustmentDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rider: Rider;
  adjustmentType: AdjustmentType;
  fetchRewardPoints: (riderId: number) => Promise<void>;
}

const RewardAdjustmentDialog: React.FC<RewardAdjustmentDialogProps> = ({
  adjustmentDialogOpen,
  setIsAdjustmentDialogOpen,
  rider,
  adjustmentType,
  fetchRewardPoints,
}) => {
  const [formSubmitValues, setFormSubmitValues] =
    useState<ChangeRewardPointsBody>();
  const [isRewardPointsChanging,setIsRewardPointsChanging]=useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const { updateRewardPoints } = useAuth();

  const handleCloseAdjustmentDialog = () => {
    setFormSubmitValues({
      amount: undefined,
      description: undefined,
    });
    setValidationError("");
    setIsAdjustmentDialogOpen(false);
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Clear previous validation errors
    setValidationError("");
    
    // Validate that we have required fields
    if (!formSubmitValues?.amount || !formSubmitValues?.description) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    // Validate for decrement operations - check if rider has sufficient points
    if (adjustmentType === AdjustmentType.DECREMENT) {
      const amountToConsume = Math.abs(Number(formSubmitValues.amount));
      const currentPoints = rider.rewardPoints || 0;
      
      if (amountToConsume > currentPoints) {
        setValidationError(
          `Insufficient reward points. Current balance: ${currentPoints} points. Cannot consume ${amountToConsume} points.`
        );
        return;
      }
    }

    setIsRewardPointsChanging(true);

    const newForm: ChangeRewardPointsBody = {
      amount: formSubmitValues?.amount
        ? adjustmentType === AdjustmentType.DECREMENT
          ? -Math.abs(Number(formSubmitValues.amount))
          : Math.abs(Number(formSubmitValues.amount))
        : 0,
      description: formSubmitValues?.description || "",
    };

    try {
      await updateRewardPoints(Number(rider.id), newForm);
      await fetchRewardPoints(Number(rider.id));
      handleCloseAdjustmentDialog();
    } catch (error) {
      console.error("Error updating reward points:", error);
      setValidationError("Failed to update reward points. Please try again.");
    } finally {
      setIsRewardPointsChanging(false);
    }
  };

  return (
    <Dialog
      open={adjustmentDialogOpen}
      onClose={handleCloseAdjustmentDialog}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Adjust sx={{ mr: 1 }} />
              <Typography variant="h6">
                {adjustmentType === AdjustmentType.INCREMENT ? "Add" : "Consume"}{" "}
                {rider.name}'s Rewards
              </Typography>
            </Box>
            <IconButton onClick={handleCloseAdjustmentDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={4} justifyContent="center" sx={{ mb: 3 }} />

          {/* Current balance display */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.200' 
            }}>
              <Typography variant="body2" color="text.secondary">
                Current Reward Points Balance
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {rider.rewardPoints || 0} points
              </Typography>
            </Box>
          </Grid>

          {/* Validation error display */}
          {validationError && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'error.light', 
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: 'error.main' 
              }}>
                <Typography variant="body2" color="error.main">
                  {validationError}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Amount input */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {adjustmentType === AdjustmentType.INCREMENT
                ? "Add Reward points"
                : "Consume Reward points"}
            </Typography>

            <TextField
              label={
                adjustmentType === AdjustmentType.INCREMENT
                  ? "Reward points to Add"
                  : "Reward points to Consume"
              }
              type="number"
              fullWidth
              value={formSubmitValues?.amount ?? ""}
              placeholder={
                adjustmentType === AdjustmentType.INCREMENT
                  ? "Enter the number of rewards to add"
                  : "Enter the number of rewards to consume"
              }
              onChange={(e) => {
                const value = Number(e.target.value);
                setFormSubmitValues((prev) => ({
                  amount: value,
                  description: prev?.description ?? "",
                }));
                
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError("");
                }
              }}
              error={!!validationError}
              helperText={
                adjustmentType === AdjustmentType.INCREMENT
                  ? "Specify how many reward points you want to add."
                  : `Specify how many reward points you want to consume. (Max: ${rider.rewardPoints || 0} points)`
              }
            />
          </Grid>

          {/* Reason input */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Reason
            </Typography>

            <TextField
              label={
                adjustmentType === AdjustmentType.INCREMENT
                  ? "Reason for adding rewards"
                  : "Reason to consume rewards"
              }
              type="text"
              fullWidth
              value={formSubmitValues?.description ?? ""}
              placeholder={
                adjustmentType === AdjustmentType.INCREMENT
                  ? "Enter the reason for adding rewards points"
                  : "Enter the reason for consuming reward points"
              }
              onChange={(e) =>
                setFormSubmitValues((prev) => ({
                  amount: prev?.amount ?? undefined,
                  description: e.target.value,
                }))
              }
              helperText={`Justify your reason to ${
                adjustmentType === AdjustmentType.INCREMENT ? "add" : "consume"
              } points...`}
            />
          </Grid>

          {/* Submit button */}
          <Grid item sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={
                !formSubmitValues?.amount || 
                !formSubmitValues?.description || 
                isRewardPointsChanging ||
                !!validationError ||
                (adjustmentType === AdjustmentType.DECREMENT && 
                 formSubmitValues?.amount && 
                 formSubmitValues.amount > (rider.rewardPoints || 0)) === true
              }
            >
              {isRewardPointsChanging ? "Processing..." : "Submit"}
            </Button>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAdjustmentDialog}>Close</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RewardAdjustmentDialog;
