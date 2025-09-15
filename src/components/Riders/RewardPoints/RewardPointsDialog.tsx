import { Close as CloseIcon, Delete, Diamond } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  Grid,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import React, { useState } from "react";
import { formatDate } from "../../../utils/formatters";
import { Minus, Plus } from "lucide-react";
import { AdjustmentType, RewardPointDetail, Rider } from "../../../types";
import RewardAdjustmentDialog from "./RewardAdjustmentDialog/RewardAdjustmentDialog";
import DeleteRewardPointDialog from "./DeleteRewardPointDialog/DeleteRewardPointDialog";

interface RewardPointsDialogProps {
  rewardDialogOpen: boolean;
  setDisplayRewardPointsModel: React.Dispatch<React.SetStateAction<boolean>>;
  rewards: number;
  rider: Rider;
  RewardPointDetails: RewardPointDetail[];
  fetchRewardPoints: (riderId: number) => Promise<void>;
}
const RewardPointsDialog: React.FC<RewardPointsDialogProps> = ({
  rewardDialogOpen,
  setDisplayRewardPointsModel,
  rewards,
  rider,
  RewardPointDetails,
  fetchRewardPoints,
}) => {
  const [isAdujstingRewards, setIsAdjustingRewards] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<
    AdjustmentType | undefined
  >(undefined);
  const handleCloseRewardDialog = () => {
    setDisplayRewardPointsModel(false);
  };
  const [selectedRewardPointToDelete, setSelectedRewardPointToDelete] =
    useState<RewardPointDetail | undefined>();
  const [isRewardPointDeleting, setIsRewardPointDeleting] =
    useState<boolean>(false);
  const handleDeleteRewardPoint = () => {
    setIsRewardPointDeleting(true);
  };
  const handleRewardPointsAdjustmentDialog = (
    adjustmentType: AdjustmentType,
  ) => {
    setIsAdjustingRewards(true);
    setAdjustmentType(adjustmentType);
  };
  return (
    <>
      <Dialog
        open={rewardDialogOpen}
        onClose={handleCloseRewardDialog}
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
              <Diamond sx={{ mr: 1 }} />
              <Typography variant="h6">
                {rider.name}'s' Reward Points
              </Typography>
            </Box>
            <IconButton onClick={handleCloseRewardDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    maxWidth: 600,
                    margin: "0 auto",
                  }}
                  elevation={2}
                >
                  <Typography variant="h4" color="primary">
                    {rewards}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reward Points
                  </Typography>
                </Paper>
              </Grid>

              {/* Buttons in one row */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<Minus />}
                      onClick={() =>
                        handleRewardPointsAdjustmentDialog(
                          AdjustmentType.DECREMENT,
                        )
                      }
                      disabled={!rewards || rewards <= 0}
                      title={
                        !rewards || rewards <= 0 
                          ? "No reward points available to consume" 
                          : "Consume reward points"
                      }
                    >
                      Consume Reward Points
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Plus />}
                      onClick={() =>
                        handleRewardPointsAdjustmentDialog(
                          AdjustmentType.INCREMENT,
                        )
                      }
                      disabled={false}
                    >
                      Add Reward Points
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Date</TableCell>
                    <TableCell align="center">Description</TableCell>
                    <TableCell align="center">Reward Points</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {RewardPointDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No Reward Points Found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    RewardPointDetails.map((RewardPointDetail) => (
                      <TableRow key={RewardPointDetail.id} hover>
                        <TableCell align="left">
                          {formatDate(RewardPointDetail.created_at)}
                        </TableCell>
                        <TableCell align="center">
                          {RewardPointDetail.description}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            color:
                              RewardPointDetail.amount > 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {Math.abs(RewardPointDetail.amount)}
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <IconButton
                              color="secondary"
                              size="small"
                              title="Delete Document"
                              onClick={() => {
                                handleDeleteRewardPoint();
                                setSelectedRewardPointToDelete(
                                  RewardPointDetail,
                                );
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseRewardDialog}>Close</Button>
        </DialogActions>
        {adjustmentType !== undefined && (
          <RewardAdjustmentDialog
            adjustmentDialogOpen={isAdujstingRewards}
            setIsAdjustmentDialogOpen={setIsAdjustingRewards}
            rider={rider}
            adjustmentType={adjustmentType}
            fetchRewardPoints={fetchRewardPoints}
          />
        )}
      </Dialog>
      {selectedRewardPointToDelete && (
        <DeleteRewardPointDialog
          isDeleteRewardPointDialogOpened={isRewardPointDeleting}
          selectedDeleteRewardPoint={selectedRewardPointToDelete}
          setSelectedDeleteRewardPoint={setSelectedRewardPointToDelete}
          setIsDeleteRewardPointDialogOpened={setIsRewardPointDeleting}
          riderId={Number(rider.id)}
          fetchRewardPoints={fetchRewardPoints}
        />
      )}
    </>
  );
};

export default RewardPointsDialog;
