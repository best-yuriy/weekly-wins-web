import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsPage from './StatsPage';
import InMemoryGoalsService from '../services/goals/InMemoryGoalsService';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('StatsPage', () => {
  const mockHistoricalData = [
    {
      id: '2024-03-25',
      goals: [
        { id: 'goal1', title: 'Exercise', count: 5 },
        { id: 'goal2', title: 'Read', count: 3 },
      ],
    },
    {
      id: '2024-03-18',
      goals: [
        { id: 'goal1', title: 'Exercise', count: 4 },
        { id: 'goal2', title: 'Read', count: 2 },
      ],
    },
  ];

  it('renders loading state initially', async () => {
    const service = new InMemoryGoalsService({}, 100);

    service._getBarrier('getAllHistoricalGoals');

    render(<StatsPage goalsService={service} />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Goal Insights')).not.toBeInTheDocument();
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    service.resolveOperation('getAllHistoricalGoals');

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText('Goal Insights')).not.toBeInTheDocument();
      expect(screen.queryByText('No data available')).toBeInTheDocument();
    });
  });

  it('displays goal insights when data loads', async () => {
    const service = new InMemoryGoalsService(mockHistoricalData);
    render(<StatsPage goalsService={service} />);

    await waitFor(() => {
      expect(screen.getByText('Goal Insights')).toBeInTheDocument();

      // Find the statistics table
      const statsTable = screen.getByRole('table', {
        name: 'goal statistics',
      });
      expect(statsTable).toBeInTheDocument();

      // Find the Exercise row
      const exerciseRow = within(statsTable).getByRole('row', {
        name: /Exercise 9 4\.5 5 100%/,
      });
      expect(exerciseRow).toBeInTheDocument();

      // Find the Read row
      const readRow = within(statsTable).getByRole('row', {
        name: /Read 5 2\.5 3 100%/,
      });
      expect(readRow).toBeInTheDocument();
    });
  });

  it('allows switching between goals in the chart', async () => {
    const service = new InMemoryGoalsService(mockHistoricalData);
    render(<StatsPage goalsService={service} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Goal Insights')).toBeInTheDocument();
    });

    // Open the select
    const select = screen.getByRole('combobox');
    await userEvent.click(select);

    // Initially both should be selected
    expect(select).toHaveTextContent('Exercise, Read');

    // Deselect Exercise
    const exerciseOption = screen.getByRole('option', { name: 'Exercise' });
    await userEvent.click(exerciseOption);

    // Now only Read should be selected
    await waitFor(() => {
      expect(select).toHaveTextContent('Read');
    });

    // Select Exercise again
    await userEvent.click(exerciseOption);

    // Now both should be selected again
    await waitFor(() => {
      expect(select).toHaveTextContent('Read, Exercise');
    });
  });

  it('handles service errors gracefully', async () => {
    const service = new InMemoryGoalsService();
    const error = new Error('Failed to load historical data');
    vi.spyOn(service, 'getAllHistoricalGoals').mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<StatsPage goalsService={service} />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading stats/)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load stats:', error);
    });

    consoleSpy.mockRestore();
  });

  it('shows no data message when there are no goals', async () => {
    const service = new InMemoryGoalsService({});
    render(<StatsPage goalsService={service} />);

    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('displays summary cards with stats', async () => {
    const service = new InMemoryGoalsService(mockHistoricalData);
    render(<StatsPage goalsService={service} />);

    await waitFor(() => {
      // Check card titles
      expect(screen.getByText('Most Consistent Goal')).toBeInTheDocument();
      expect(screen.getByText('All-Time Records')).toBeInTheDocument();
      expect(screen.getByText('Current Week Progress')).toBeInTheDocument();
    });
  });
});
