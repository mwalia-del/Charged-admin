import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Promotion, PromotionFilters, PromotionSummary } from '../../types';
import { listPromotions, getPromotionsSummary } from '../../API/promotions';
import PromotionTable from './components/PromotionTable';
import PromotionFiltersComponent from './components/PromotionFilters';
import PromotionSummaryCards from './components/PromotionSummaryCards';
import PromotionEditor from './PromotionEditor';

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [summary, setSummary] = useState<PromotionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PromotionFilters>({
    page: 1,
    page_size: 20,
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [promotionsResult, summaryResult] = await Promise.all([
        listPromotions(filters),
        getPromotionsSummary()
      ]);
      
      setPromotions(promotionsResult.data);
      setSummary(summaryResult);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltersChange = (newFilters: PromotionFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleCreatePromotion = () => {
    setEditingPromotion(null);
    setEditorOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setEditorOpen(true);
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setEditingPromotion(null);
    fetchPromotions(); // Refresh data
  };

  const handlePromotionUpdate = () => {
    fetchPromotions(); // Refresh data
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Promotions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePromotion}
          sx={{ ml: 2 }}
        >
          Create Promotion
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Box mb={3}>
          <PromotionSummaryCards summary={summary} />
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <PromotionFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Paper>

      {/* Promotions Table */}
      <Paper>
        <PromotionTable
          promotions={promotions}
          onEdit={handleEditPromotion}
          onPromotionUpdate={handlePromotionUpdate}
        />
      </Paper>

      {/* Promotion Editor Dialog */}
      <PromotionEditor
        open={editorOpen}
        onClose={handleEditorClose}
        promotion={editingPromotion}
        onSave={handlePromotionUpdate}
      />
    </Container>
  );
};

export default PromotionsPage;
