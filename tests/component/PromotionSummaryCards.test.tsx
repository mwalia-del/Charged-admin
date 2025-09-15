import React from 'react';
import { render, screen } from '@tests/utils/renderWithProviders';
import PromotionSummaryCards from '../../src/pages/promotions/components/PromotionSummaryCards';
import { PromotionSummary } from '../../src/types';

const mockSummary: PromotionSummary = {
  total_promotions: 10,
  active_promotions: 5,
  scheduled_promotions: 2,
  ended_promotions: 3,
  total_redemptions: 150,
  total_value_cents: 25000,
};

describe('PromotionSummaryCards', () => {
  it('should render all summary cards', () => {
    render(<PromotionSummaryCards summary={mockSummary} />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // Total promotions
    expect(screen.getByText('5')).toBeInTheDocument(); // Active promotions
    expect(screen.getByText('2')).toBeInTheDocument(); // Scheduled promotions
    expect(screen.getByText('3')).toBeInTheDocument(); // Ended promotions
    expect(screen.getByText('150')).toBeInTheDocument(); // Total redemptions
    expect(screen.getByText('$250.00')).toBeInTheDocument(); // Total value
  });

  it('should display correct card titles', () => {
    render(<PromotionSummaryCards summary={mockSummary} />);
    
    expect(screen.getByText('Total Promotions')).toBeInTheDocument();
    expect(screen.getByText('Active Promotions')).toBeInTheDocument();
    expect(screen.getByText('Scheduled Promotions')).toBeInTheDocument();
    expect(screen.getByText('Ended Promotions')).toBeInTheDocument();
    expect(screen.getByText('Total Redemptions')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
  });

  it('should format currency correctly', () => {
    const summaryWithLargeValue = {
      ...mockSummary,
      total_value_cents: 123456,
    };
    
    render(<PromotionSummaryCards summary={summaryWithLargeValue} />);
    expect(screen.getByText('$1234.56')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    const zeroSummary: PromotionSummary = {
      total_promotions: 0,
      active_promotions: 0,
      scheduled_promotions: 0,
      ended_promotions: 0,
      total_redemptions: 0,
      total_value_cents: 0,
    };
    
    render(<PromotionSummaryCards summary={zeroSummary} />);
    
    // Check for multiple zero values (5 cards with "0" + 1 with "$0.00")
    expect(screen.getAllByText('0')).toHaveLength(5);
    expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total value
  });
});
