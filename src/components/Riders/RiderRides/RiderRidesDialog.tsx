import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { StarIcon } from "lucide-react";
import {
  Close as CloseIcon,
  DirectionsCar as RideIcon,
} from "@mui/icons-material";
import { RewardPointDetail, Ride, Rider } from "../../../types";
import { useState } from "react";
import RewardPointsDialog from "../RewardPoints/RewardPointsDialog";
import { formatDate } from "../../../utils/formatters";
interface RiderRidesDialogProps {
  setRideDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedRider: React.Dispatch<React.SetStateAction<Rider | null>>;
  setRiderRides: React.Dispatch<React.SetStateAction<Ride[] | []>>;
  rideDialogOpen: boolean;
  riderRides: Ride[];
  selectedRider: Rider;
  totalPoints: number;
  rideDialogLoading: Boolean;
  RewardPointDetails: RewardPointDetail[];
  fetchRewardPoints: (riderId: number) => Promise<void>;
}
const RiderRidesDialog = ({
  setRideDialogOpen,
  setSelectedRider,
  setRiderRides,
  rideDialogOpen,
  riderRides,
  selectedRider,
  totalPoints,
  rideDialogLoading,
  RewardPointDetails,
  fetchRewardPoints,
}: RiderRidesDialogProps) => {
  const [displayRewardPointsModel, setDisplayRewardPointsModel] =
    useState(false);
  const handleCloseRideDialog = () => {
    setRideDialogOpen(false);
    setSelectedRider(null);
    setRiderRides([]);
  };
  const handleRewardPoints = (e: React.MouseEvent<HTMLDivElement>) => {
    setDisplayRewardPointsModel(true);
  };
  const getRideStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "accepted":
        return "info";
      case "request":
        return "warning";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };
  return (
    <>
      <Dialog
        open={rideDialogOpen}
        onClose={handleCloseRideDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RideIcon sx={{ mr: 1 }} />
              <Typography variant="h6">{selectedRider.name}'s Rides</Typography>
            </Box>
            <IconButton onClick={handleCloseRideDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {rideDialogLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }} elevation={2}>
                    <Typography variant="h4" color="primary">
                      {riderRides.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Rides
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3} sx={{ cursor: "pointer" }}>
                  <Paper
                    sx={{ p: 2, textAlign: "center" }}
                    elevation={2}
                    onClick={handleRewardPoints}
                  >
                    <Typography variant="h4" color="primary">
                      {totalPoints || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reward Points
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }} elevation={2}>
                    <Typography variant="h4" color="primary">
                      {riderRides
                        ? riderRides.filter(
                            (r: Ride) => r.status === "completed"
                          ).length
                        : null}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Rides
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }} elevation={2}>
                    <Typography variant="h4" color="primary">
                      {riderRides.filter((r) => r.status === "canceled").length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled Rides
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }} elevation={2}>
                    <Typography variant="h4" color="primary">
                      {selectedRider.rating && typeof selectedRider.rating === 'number' 
                        ? selectedRider.rating.toFixed(1) 
                        : '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rider Rating
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Recent Rides
              </Typography>

              {riderRides.length === 0 ? (
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  No rides found for this rider.
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  variant="outlined"
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell align="right">Fare</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ratings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {riderRides.map((ride) => (
                        <TableRow key={ride.id} hover>
                          <TableCell>{formatDate(ride.created_at)}</TableCell>
                          <TableCell sx={{ textTransform: "capitalize" }}>
                            {ride.ride_type_id}
                          </TableCell>
                          <TableCell>
                            {ride.pickup_address.split(",")[0]}
                          </TableCell>
                          <TableCell>
                            {ride.dropoff_address.split(",")[0]}
                          </TableCell>
                          <TableCell align="right">${ride.base_fare}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={ride.status}
                              size="small"
                              color={getRideStatusColor(ride.status)}
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {ride.rating > 0 ? (
                              <Chip
                                icon={<StarIcon fontSize="small" />}
                                label={ride.rating}
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRideDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Reward points Dialog */}
      {selectedRider && (
        <RewardPointsDialog
          rewardDialogOpen={displayRewardPointsModel}
          setDisplayRewardPointsModel={setDisplayRewardPointsModel}
          rewards={totalPoints || 0}
          rider={selectedRider}
          RewardPointDetails={
            RewardPointDetails.length > 0 ? RewardPointDetails : []
          }
          fetchRewardPoints={fetchRewardPoints}
        />
      )}
    </>
  );
};

export default RiderRidesDialog;
