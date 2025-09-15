import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/lib/native';
import { render } from '@tests/utils/renderWithProviders';
import { mockApiResponse, mockApiError, clearAllMocks } from '@tests/utils/testHelpers';
import PromotionsPage from '../../src/pages/promotions/PromotionsPage';
import promotionFixtures from '../fixtures/promotion.json';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.charged.autos';

// Mock the API calls
const server = setupServer(
  http.get(`${API_BASE_URL}/admin/promotions`, () => {
    return HttpResponse.json({
      promotions: [
        promotionFixtures.active,
        promotionFixtures.scheduled,
        promotionFixtures.ended,
      ],
      pagination: {
        page: 1,
        page_size: 20,
        total: 3,
        total_pages: 1,
      },
    });
  }),
  http.get(`${API_BASE_URL}/admin/promotions/summary`, () => {
    return HttpResponse.json({
      total_promotions: 3,
      active_promotions: 1,
      scheduled_promotions: 1,
      ended_promotions: 1,
      total_redemptions: 1801,
      total_value_cents: 125000,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  clearAllMocks();
});
afterAll(() => server.close());

describe('PromotionsPage Integration', () => {
  it('should render promotions page with data', async () => {
    render(<PromotionsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Promotions Management')).toBeInTheDocument();
    });
    
    // Check summary cards
    expect(screen.getByText('3')).toBeInTheDocument(); // Total promotions
    expect(screen.getByText('1')).toBeInTheDocument(); // Active promotions
    
    // Check table headers
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Audience')).toBeInTheDocument();
    expect(screen.getByText('Reward Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should display promotion data in table', async () => {
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Weekend Special')).toBeInTheDocument();
    expect(screen.getByText('Holiday Special')).toBeInTheDocument();
  });

  it('should filter promotions by audience', async () => {
    const user = userEvent.setup();
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    });
    
    // Open audience filter
    const audienceFilter = screen.getByLabelText('Audience');
    await user.click(audienceFilter);
    
    // Select riders
    await user.click(screen.getByText('Riders'));
    
    // All promotions should still be visible (they're all rider promotions in fixtures)
    expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
  });

  it('should filter promotions by status', async () => {
    const user = userEvent.setup();
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    });
    
    // Open status filter
    const statusFilter = screen.getByLabelText('Status');
    await user.click(statusFilter);
    
    // Select active
    await user.click(screen.getByText('Active'));
    
    // Only active promotions should be visible
    expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    expect(screen.queryByText('Weekend Special')).not.toBeInTheDocument();
  });

  it('should search promotions', async () => {
    const user = userEvent.setup();
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Title, description, or code');
    await user.type(searchInput, 'Welcome');
    
    // Only matching promotion should be visible
    expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    expect(screen.queryByText('Weekend Special')).not.toBeInTheDocument();
  });

  it('should open create promotion dialog', async () => {
    const user = userEvent.setup();
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Promotion')).toBeInTheDocument();
    });
    
    // Click create button
    const createButton = screen.getByText('Create Promotion');
    await user.click(createButton);
    
    // Dialog should open
    expect(screen.getByText('Create New Promotion')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.get(`${API_BASE_URL}/admin/promotions`, () => {
        return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      })
    );
    
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load promotions')).toBeInTheDocument();
    });
  });

  it('should clear filters', async () => {
    const user = userEvent.setup();
    render(<PromotionsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    });
    
    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Title, description, or code');
    await user.type(searchInput, 'Welcome');
    
    // Clear filters
    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);
    
    // All promotions should be visible again
    expect(screen.getByText('New Rider Welcome')).toBeInTheDocument();
    expect(screen.getByText('Weekend Special')).toBeInTheDocument();
  });
});
