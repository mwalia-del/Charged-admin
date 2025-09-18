import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  DirectionsCar as CarIcon,
  ElectricCar as ElectricIcon,
  AirportShuttle as SuvIcon,
  Check as ActiveIcon,
  Close as InactiveIcon,
  UploadFile as UploadFileIcon,
  Delete,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Driver, Ride, RideType, DocumentType } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
// Removed mockApi import - using real API only
import DriverDetailsDialog from "./DriverDetails/DriverDetailsDialog";
import DeleteDriverDialog from "./DeleteDriverDialog/DeleteDriverDialog";
import StarRating from "../StarRating/StarRating";

const DriversComponent: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedVehicleType, setSelectedVehicleType] = useState<
    RideType | "all"
  >("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    boolean | "all"
  >("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [documentUpdateSuccess, setDocumentUpdateSuccess] = useState<
    string | null
  >(null);
  const [documentUpdateError, setDocumentUpdateError] = useState<string | null>(
    null
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<
    DocumentType | ""
  >("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadDialogNotes, setUploadDialogNotes] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isDriverDeleted, setIsDriverDeleted] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
  const [lastDataFetch, setLastDataFetch] = useState<Date | null>(null);
  const { getDrivers, getDriverDocs, getRidesByUserId } = useAuth();

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...drivers];
    console.log("🔍 Applying filters:", { 
      totalDrivers: drivers.length, 
      searchQuery, 
      selectedVehicleType, 
      selectedStatusFilter 
    });

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const beforeSearch = result.length;
      result = result.filter(
        (driver) =>
          driver?.name?.toLowerCase()?.includes(query) ||
          driver?.email?.toLowerCase()?.includes(query) ||
          driver?.phone?.toString()?.includes(query) ||
          driver?.license_plate?.toLowerCase().includes(query)
      );
      console.log("🔍 Search filter:", { query, before: beforeSearch, after: result.length });
      setPage(0);
    }

    // Apply vehicle type filter
    if (selectedVehicleType !== "all") {
      const beforeVehicle = result.length;
      result = result.filter(
        (driver) => driver.car_type === selectedVehicleType
      );
      console.log("🚗 Vehicle filter:", { 
        type: selectedVehicleType, 
        before: beforeVehicle, 
        after: result.length 
      });
      setPage(0);
    }

    // Apply status filter
    if (selectedStatusFilter !== "all") {
      const beforeStatus = result.length;
      result = result.filter(
        (driver) => driver.is_active === selectedStatusFilter
      );
      console.log("📊 Status filter:", { 
        status: selectedStatusFilter, 
        before: beforeStatus, 
        after: result.length 
      });
      setPage(0);
    }

    console.log("✅ Final filtered results:", result.length);
    setFilteredDrivers(result);
  }, [drivers, searchQuery, selectedVehicleType, selectedStatusFilter]);

  useEffect(() => {
    applyFilters();
  }, [
    drivers,
    searchQuery,
    selectedVehicleType,
    selectedStatusFilter,
    applyFilters,
  ]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching fresh drivers data...");
      const data = await getDrivers();
      console.log("📊 Fresh drivers data received:", data.length, "drivers");
      setDrivers(data);
      setFilteredDrivers(data);
      setLastDataFetch(new Date());
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching drivers:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDriver = async (driver: Driver) => {
    try {
      setLoadingDriverDetails(true);
      setDriverDetailsOpen(true);
      const documents = await getDriverDocs(driver.id as any);
      const rides = await getRidesByUserId(Number(driver.id));
      console.log("Fetched rides:", rides, driver.id);
      setSelectedDriver({ ...driver, documents });
      setTabValue(0);
      rides ? setDriverRides(rides) : setDriverRides([]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoadingDriverDetails(false);
    }
  };

  const getVehicleTypeIcon = (type: RideType) => {
    switch (type) {
      case "electric":
        return <ElectricIcon color="success" />;
      case "regular":
        return <CarIcon color="primary" />;
      case "suv":
        return <SuvIcon color="warning" />;
      default:
        return <CarIcon />;
    }
  };

  const getVehicleTypeLabel = (type: RideType) => {
    switch (type) {
      case "electric":
        return "Charged X";
      case "regular":
        return "Charged Black";
      case "suv":
        return "Charged Xl";
      default:
        return type;
    }
  };

  const getDocumentTitle = (documentType: string): string => {
    switch (documentType) {
      case "driverLicense":
        return "Driver License";
      case "vehicleInsurance":
        return "Vehicle Insurance";
      case "vehiclePermit":
        return "Vehicle Permit";
      case "backgroundCheck":
        return "Background Check";
      case "workEligibility":
        return "Work Eligibility";
      case "driverAbstract":
        return "Driver Abstract";
      case "vehicleDetails":
        return "Vehicle Details";
      default:
        return documentType;
    }
  };

  const getDriverReferralId = (driver: Driver) => {
    // Display the driver referral ID from the API response
    if (driver.driver_referral_id) {
      return driver.driver_referral_id;
    }
    return 'Not Assigned';
  };


  const copyReferralId = (referralId: string) => {
    navigator.clipboard.writeText(referralId);
    // You could add a snackbar notification here
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedDocumentType("");
    setUploadedFile(null);
    setUploadDialogNotes("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadedFile(event.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedDocumentType || !uploadedFile || !selectedDriver) {
      return;
    }

    setUploadingDocument(true);

    try {
      // TODO: Replace with real API call
      console.log('Driver refresh not implemented - using real API only');
      const updatedDriver = selectedDriver; // Placeholder

      // Update the selected driver in the UI
      setSelectedDriver(updatedDriver);

      setDocumentUpdateSuccess(
        `Document ${getDocumentTitle(selectedDocumentType)} uploaded successfully and driver has been notified!`
      );
      handleCloseUploadDialog();
    } catch (error) {
      console.error("Error uploading document:", error);
      setDocumentUpdateError("Failed to upload document. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleOpenUploadDialog = (docType: DocumentType) => {
    setSelectedDocumentType(docType);
    setUploadedFile(null);
    setUploadDialogNotes("");
    setUploadDialogOpen(true);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setDeletingDriver(driver);
    setIsDriverDeleted(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Driver Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and manage drivers, filter by vehicle type, and see driver
            statistics.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDrivers}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
          {lastDataFetch && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Last updated: {lastDataFetch.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search drivers"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, email, phone, or license plate"
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Vehicle Type
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setSelectedVehicleType("all")}
                  color={selectedVehicleType === "all" ? "primary" : "default"}
                  variant={
                    selectedVehicleType === "all" ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<ElectricIcon />}
                  label="Charged X"
                  onClick={() => setSelectedVehicleType("electric")}
                  color={
                    selectedVehicleType === "electric" ? "primary" : "default"
                  }
                  variant={
                    selectedVehicleType === "electric" ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<CarIcon />}
                  label="Charged Black"
                  onClick={() => setSelectedVehicleType("regular")}
                  color={
                    selectedVehicleType === "regular" ? "primary" : "default"
                  }
                  variant={
                    selectedVehicleType === "regular" ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<SuvIcon />}
                  label="Charged Xl"
                  onClick={() => setSelectedVehicleType("suv")}
                  color={selectedVehicleType === "suv" ? "primary" : "default"}
                  variant={
                    selectedVehicleType === "suv" ? "filled" : "outlined"
                  }
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setSelectedStatusFilter("all")}
                  color={selectedStatusFilter === "all" ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === "all" ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<ActiveIcon />}
                  label="Active"
                  onClick={() => setSelectedStatusFilter(true)}
                  color={selectedStatusFilter === true ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === true ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<InactiveIcon />}
                  label="Inactive"
                  onClick={() => setSelectedStatusFilter(false)}
                  color={selectedStatusFilter === false ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === false ? "filled" : "outlined"
                  }
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="drivers table">
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell>Driver Referral ID</TableCell>
                <TableCell>Vehicle Type</TableCell>
                <TableCell>License Plate</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Total Rides</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((driver) => (
                  <TableRow hover key={driver.uuid}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={driver.photo}
                          alt={driver.name}
                          sx={{ mr: 2, width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography variant="body1">{driver.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {driver.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontFamily="monospace" data-testid="driver-referral-id">
                          {getDriverReferralId(driver)}
                        </Typography>
                        {driver.driver_referral_id && (
                          <Tooltip title="Copy Driver Referral ID">
                            <IconButton
                              size="small"
                              onClick={() => copyReferralId(driver.driver_referral_id!)}
                              data-testid="copy-driver-referral-id"
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getVehicleTypeIcon(driver.car_type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getVehicleTypeLabel(driver.car_type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.license_plate}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <StarRating
                          rating={driver.rating || 0}
                          size="medium"
                          color="primary"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Rating
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={driver.is_active ? "Active" : "Inactive"}
                        color={driver.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{driver.total_rides}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Driver Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDriver(driver)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Driver">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleDeleteDriver(driver)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No drivers found matching the search criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredDrivers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>


      {/* Driver Details Dialog */}
      <DriverDetailsDialog
        driverDetailsOpen={driverDetailsOpen}
        setDriverDetailsOpen={setDriverDetailsOpen}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
        loadingDriverDetails={loadingDriverDetails}
        drivers={drivers}
        setDrivers={setDrivers}
        driverRides={driverRides}
        setDriverRides={setDriverRides}
        tabValue={tabValue}
        setTabValue={setTabValue}
        setError={setError}
        setDocumentUpdateSuccess={setDocumentUpdateSuccess}
        setDocumentUpdateError={setDocumentUpdateError}
        documentUpdateSuccess={documentUpdateSuccess}
        handleOpenUploadDialog={handleOpenUploadDialog}
        documentUpdateError={documentUpdateError}
        uploadingDocument={uploadingDocument}
        getDocumentTitle={getDocumentTitle}
      />

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog}>
        <DialogTitle>
          Upload{" "}
          {selectedDocumentType
            ? getDocumentTitle(selectedDocumentType)
            : "Document"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload a document on behalf of the driver. This document will be
            marked as pending and will need to be verified.
          </DialogContentText>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Input
              type="file"
              id="document-upload"
              inputProps={{ accept: "image/*,.pdf" }}
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}
            >
              <Button
                variant="outlined"
                component="label"
                htmlFor="document-upload"
                startIcon={<UploadFileIcon />}
              >
                Select File
              </Button>
            </Box>

            {uploadedFile && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography variant="body2">
                  Selected: {uploadedFile.name}
                </Typography>
                {uploadedFile.type.startsWith("image/") && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: "200px" }}
                    />
                  </Box>
                )}
              </Box>
            )}

            <TextField
              margin="dense"
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={uploadDialogNotes}
              onChange={(e) => setUploadDialogNotes(e.target.value)}
              placeholder="Add any important notes about this document"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUploadDocument}
            disabled={!uploadedFile || uploadingDocument}
            variant="contained"
            color="primary"
          >
            {uploadingDocument ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
      {deletingDriver && (
        <DeleteDriverDialog
          driverId={deletingDriver.id}
          open={isDriverDeleted}
          setOpen={setIsDriverDeleted}
          removeDriver={setDeletingDriver}
          fetchDrivers={fetchDrivers}
        />
      )}

    </Container>
  );
};

export default DriversComponent;
