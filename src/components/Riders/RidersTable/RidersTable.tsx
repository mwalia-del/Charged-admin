import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete,
} from "@mui/icons-material";
import React, { useState } from "react";
import { formatDate, formatRelativeTime } from "../../../utils/formatters";
import { Rider } from "../../../types";
import DeleteRiderDialog from "./DeleteRider/DeleteRiderDialog";
import StarRating from "../../StarRating/StarRating";

interface RidersTableProps {
  filteredRiders: Rider[];
  handleViewRiderRides: (rider: Rider) => Promise<void>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  fetchRiders: () => void;
}

const RidersTable = ({
  filteredRiders,
  handleViewRiderRides,
  page,
  setPage,
  fetchRiders,
}: RidersTableProps) => {
  const [isRiderDeleting, setIsRiderDeleting] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<Rider | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteRider = (rider: Rider) => {
    setRiderToDelete(rider);
    setIsRiderDeleting(true);
  };

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rider</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Reward Points</TableCell>
              <TableCell align="center">Rides</TableCell>
              <TableCell align="center">Joined</TableCell>
              <TableCell align="center">Last Ride</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRiders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((rider) => (
                <TableRow key={rider.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={rider.photo}
                        alt={rider.name}
                        sx={{ mr: 2, width: 40, height: 40 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {rider.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {rider.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{rider.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rider.phone}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <StarRating
                        rating={rider.rating || 0}
                        size="medium"
                        color="primary"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Rating
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={rider.rewardPoints}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{rider.totalRides}</TableCell>
                  <TableCell align="center">
                    {formatDate(rider.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    {rider.lastRideDate
                      ? formatRelativeTime(rider.lastRideDate)
                      : "Never"}
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewRiderRides(rider)}
                        title="View rides"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteRider(rider)}
                        title="Delete rider"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

            {filteredRiders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No riders found matching your search.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteRiderDialog
        open={isRiderDeleting}
        setOpen={setIsRiderDeleting}
        removeRider={setRiderToDelete}
        riderToDelete={riderToDelete!}
        fetchRiders={fetchRiders}
      />

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRiders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default RidersTable;
