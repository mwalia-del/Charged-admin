import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { BusinessInvoice, BusinessInvoicesResponse, BusinessInvoiceLineItem } from '../../../types';
import { getBusinessInvoices, generateInvoice, getInvoice } from '../../../API/business';
import { formatDate } from '../../../utils/formatters';

interface BusinessInvoicesTableProps {
  orgId: string;
  onRefresh: () => void;
}

const BusinessInvoicesTable: React.FC<BusinessInvoicesTableProps> = ({
  orgId,
  onRefresh
}) => {
  const [invoices, setInvoices] = useState<BusinessInvoicesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BusinessInvoice | null>(null);
  const [lineItems, setLineItems] = useState<BusinessInvoiceLineItem[]>([]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [generating, setGenerating] = useState(false);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'primary';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBusinessInvoices(orgId, page, pageSize);
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [orgId, page, pageSize]);

  const handleViewInvoice = async (invoice: BusinessInvoice) => {
    try {
      setLoading(true);
      const data = await getInvoice(invoice.invoice_id);
      setSelectedInvoice(invoice);
      setLineItems(data.line_items);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!periodStart || !periodEnd) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      
      await generateInvoice(orgId, periodStart, periodEnd);
      
      setGenerateDialogOpen(false);
      setPeriodStart('');
      setPeriodEnd('');
      loadInvoices(); // Refresh the list
      onRefresh(); // Notify parent to refresh business data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [orgId, page, pageSize, loadInvoices]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InvoiceIcon color="primary" />
            <Typography variant="h6">
              Invoices
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadInvoices}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGenerateDialogOpen(true)}
              size="small"
            >
              Generate Invoice
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : invoices && invoices.invoices.length > 0 ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Line Items</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.invoices.map((invoice) => (
                    <TableRow key={invoice.invoice_id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {invoice.invoice_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(invoice.total_cents)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invoice.line_items_count}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(invoice.status)}
                          color={getStatusColor(invoice.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(invoice.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={invoices.pagination.total}
              rowsPerPage={pageSize}
              page={page - 1}
              onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
              onRowsPerPageChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
            />
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No invoices found
            </Typography>
          </Box>
        )}

        {/* Generate Invoice Dialog */}
        <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Period Start"
                type="date"
                fullWidth
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Period End"
                type="date"
                fullWidth
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenerateDialogOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              variant="contained"
              disabled={generating || !periodStart || !periodEnd}
            >
              {generating ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Invoice Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Invoice Details - {selectedInvoice?.invoice_id}
          </DialogTitle>
          <DialogContent>
            {selectedInvoice && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Invoice Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Period
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedInvoice.period_start)} - {formatDate(selectedInvoice.period_end)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedInvoice.total_cents)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedInvoice.status)}
                      color={getStatusColor(selectedInvoice.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            )}

            <Typography variant="h6" gutterBottom>
              Line Items ({lineItems.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ride #</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.ride_id}>
                      <TableCell>{item.ride_number}</TableCell>
                      <TableCell>{formatDate(item.completed_at)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount_cents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BusinessInvoicesTable;
