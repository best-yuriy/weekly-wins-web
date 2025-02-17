import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from './MainPage';
import InMemoryGoalsService from '../../services/goals/InMemoryGoalsService';

// Mock getCurrentWeekKey for consistent dates
vi.mock('../../utils/dateUtils', async () => {
  const actual = await vi.importActual('../../utils/dateUtils');
  return {
    ...actual,
    getCurrentWeekKey: () => '2024-03-25',
  };
});

describe('MainPage', () => {
  const testGoal = {
    id: 'test-id',
    title: 'Test Goal',
    count: 0,
  };

  describe('default state and current week', () => {
    it('renders the main page with title', async () => {
      render(<MainPage goalsService={new InMemoryGoalsService()} />);

      await waitFor(() => {
        expect(screen.getByText('Weekly Goals')).toBeInTheDocument();
      });
    });

    it('displays current week by default', async () => {
      const service = new InMemoryGoalsService();
      // Add goals to multiple weeks
      await service.addGoal('2024-03-18', { title: 'Past Goal', count: 0 });
      await service.addGoal('2024-03-25', { title: 'Current Goal', count: 0 });
      await service.addGoal('2024-03-11', { title: 'Older Goal', count: 0 });

      render(<MainPage goalsService={service} />);

      // Verify current week is selected
      expect(screen.getByRole('combobox')).toHaveTextContent('Mar 25, 2024');

      // Verify only current week's goals are shown
      await waitFor(() => {
        expect(screen.getByText('Current Goal')).toBeInTheDocument();
        expect(screen.queryByText('Past Goal')).not.toBeInTheDocument();
        expect(screen.queryByText('Older Goal')).not.toBeInTheDocument();
      });
    });

    it('displays current week by default even with only past goals', async () => {
      const service = new InMemoryGoalsService();
      // Add only past goals
      await service.addGoal('2024-03-18', { title: 'Past Goal', count: 0 });
      await service.addGoal('2024-03-11', { title: 'Older Goal', count: 0 });

      render(<MainPage goalsService={service} />);

      // Verify current week is selected
      expect(screen.getByRole('combobox')).toHaveTextContent('Mar 25, 2024');

      // Verify empty state for current week
      await waitFor(() => {
        expect(screen.queryByText('Past Goal')).not.toBeInTheDocument();
        expect(screen.queryByText('Older Goal')).not.toBeInTheDocument();
      });

      // Verify past weeks are still accessible
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByText('Mar 18, 2024')).toBeInTheDocument();
      expect(screen.getByText('Mar 11, 2024')).toBeInTheDocument();
    });

    it('shows current week in selector even with only past goals', async () => {
      const service = new InMemoryGoalsService();
      // Add goals in random order
      await service.addGoal('2024-03-18', testGoal);
      await service.addGoal('2024-03-11', testGoal);

      render(<MainPage goalsService={service} />);

      await userEvent.click(screen.getByRole('combobox'));

      const options = screen.getAllByRole('option');
      expect(options.map(opt => opt.textContent)).toEqual([
        'Mar 25, 2024', // Current week should be first even with no goals
        'Mar 18, 2024',
        'Mar 11, 2024',
      ]);
    });
  });

  // Service integration tests
  describe('service integration', () => {
    it('loads and displays goals from service', async () => {
      const service = new InMemoryGoalsService();
      const currentWeek = '2024-03-25';
      const previousWeek = '2024-03-18';

      // Add goals to multiple weeks
      await service.addGoal(currentWeek, {
        ...testGoal,
        title: 'Current Goal',
      });
      await service.addGoal(previousWeek, { ...testGoal, title: 'Past Goal' });

      render(<MainPage goalsService={service} />);

      // Verify initial load
      await waitFor(() => {
        expect(screen.getByText('Current Goal')).toBeInTheDocument();
      });

      // Switch weeks and verify service loads different goals
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      await waitFor(() => {
        expect(screen.getByText('Past Goal')).toBeInTheDocument();
      });
    });

    it('handles service errors gracefully', async () => {
      const service = new InMemoryGoalsService();
      const error = new Error('Service error');
      vi.spyOn(service, 'getWeeklyGoals').mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load goals:', error);
      });

      consoleSpy.mockRestore();
    });
  });

  // Component interaction tests
  describe('component interactions', () => {
    it('coordinates edit mode between components', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      // Enter edit mode
      await userEvent.click(screen.getByText('Edit'));

      // Verify all components reflect edit mode
      expect(screen.getByText('Done')).toBeInTheDocument();
      await userEvent.click(screen.getByText('Test Goal'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('maintains state consistency across components', async () => {
      const service = new InMemoryGoalsService();
      service.addGoal('2024-03-18', testGoal);
      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Add')).toBeEnabled();
      });

      // Add a goal via GoalInput
      await userEvent.type(
        screen.getByPlaceholderText('Enter new goal'),
        'New Goal{enter}'
      );

      // Verify it appears in GoalCard list
      await waitFor(() => {
        expect(screen.getByText('New Goal')).toBeInTheDocument();
      });

      // Type to show suggestions and verify the added goal isn't suggested
      await userEvent.type(
        screen.getByPlaceholderText('Enter new goal'),
        'goal'
      );

      // Look for suggestions in the Popper/Paper/List structure
      await waitFor(() => {
        const suggestionsList = screen.getByRole('list');
        expect(suggestionsList).toHaveTextContent('Test Goal');
        expect(suggestionsList).not.toHaveTextContent('New Goal');
      });
    });
  });

  // Week management tests
  describe('week management', () => {
    it('maintains separate state for different weeks', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', { title: 'Current Goal', count: 1 });
      await service.addGoal('2024-03-18', { title: 'Past Goal', count: 2 });

      render(<MainPage goalsService={service} />);

      // Check current week
      await waitFor(() => {
        expect(screen.getByText('Current Goal')).toBeInTheDocument();
        expect(screen.queryByText('Past Goal')).not.toBeInTheDocument();
      });

      // Switch weeks
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      // Check previous week
      await waitFor(() => {
        expect(screen.queryByText('Current Goal')).not.toBeInTheDocument();
        expect(screen.getByText('Past Goal')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('handles service errors when loading weeks', async () => {
      const service = new InMemoryGoalsService();
      const error = new Error('Failed to load weeks');
      vi.spyOn(service, 'getAvailableWeeks').mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load weeks:', error);
      });

      // Should still show current week
      expect(screen.getByText('Mar 25, 2024')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('handles service errors when loading goals', async () => {
      const service = new InMemoryGoalsService();
      const error = new Error('Failed to load goals');
      vi.spyOn(service, 'getWeeklyGoals').mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load goals:', error);
      });

      consoleSpy.mockRestore();
    });

    it('handles service errors when adding a goal', async () => {
      const service = new InMemoryGoalsService();
      const error = new Error('Failed to add goal');
      vi.spyOn(service, 'addGoal').mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Add')).toBeEnabled();
      });

      const input = screen.getByPlaceholderText('Enter new goal');
      const addButton = screen.getByText('Add');

      await userEvent.type(input, 'Test Goal');
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to add goal:', error);
      });

      // Input should still have the value
      expect(input).toHaveValue('Test Goal');

      consoleSpy.mockRestore();
    });

    it('handles service errors when updating a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      const error = new Error('Failed to update goal');
      vi.spyOn(service, 'updateGoal').mockRejectedValue(error);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<MainPage goalsService={service} />);

      // Enter edit mode and click the goal
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Test Goal'));

      // Try to save changes
      await userEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to update goal:',
          error
        );
      });

      // Dialog should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('loading states', () => {
    it('shows loading state when adding a goal', async () => {
      const service = new InMemoryGoalsService();
      render(<MainPage goalsService={service} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter new goal');
      const addButton = screen.getByText('Add');

      await userEvent.type(input, 'Test Goal');

      service._getBarrier('addGoal');
      const addPromise = userEvent.click(addButton);

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(addButton).toBeDisabled();
      });

      service.resolveOperation('addGoal');
      await addPromise;

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(addButton).not.toBeDisabled();
      });
    });

    it('shows loading state when updating a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      // Enter edit mode and click the goal
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Test Goal'));

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');

      service._getBarrier('updateGoal');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(saveButton).not.toBeInTheDocument();
      });

      // Find the goal card first
      const goalCard = screen.getByTestId('goal-card');
      expect(screen.getByText('Test Goal')).toBeInTheDocument();

      // Then find the plus button and verify it shows loading state
      const plusButton = within(goalCard).getByRole('button');
      expect(within(plusButton).getByRole('progressbar')).toBeInTheDocument();
      expect(plusButton).toBeDisabled();
      expect(
        within(plusButton).queryByTestId('PlusOneIcon')
      ).not.toBeInTheDocument();

      service.resolveOperation('updateGoal');

      await waitFor(() => {
        const goalCard = screen.getByTestId('goal-card');
        const plusButton = within(goalCard).getByRole('button');
        expect(
          within(plusButton).queryByRole('progressbar')
        ).not.toBeInTheDocument();
        expect(plusButton).not.toBeDisabled();
        expect(
          within(plusButton).getByTestId('PlusOneIcon')
        ).toBeInTheDocument();
      });
    });

    it('shows loading state when deleting a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      // Enter edit mode and click the goal
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Test Goal'));

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete');

      service._getBarrier('deleteGoal');
      await userEvent.click(deleteButton);

      // Dialog should close immediately
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(deleteButton).not.toBeInTheDocument();
      });

      // Goal card should still be visible with loading state
      const goalCard = screen.getByTestId('goal-card');
      const plusButton = within(goalCard).getByRole('button');
      expect(within(plusButton).getByRole('progressbar')).toBeInTheDocument();
      expect(plusButton).toBeDisabled();
      expect(
        within(plusButton).queryByTestId('PlusOneIcon')
      ).not.toBeInTheDocument();

      service.resolveOperation('deleteGoal');

      // Wait for goal to be removed
      await waitFor(() => {
        expect(screen.queryByTestId('goal-card')).not.toBeInTheDocument();
      });
    });

    it('shows loading state when incrementing a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      const goalCard = screen.getByTestId('goal-card');
      const plusButton = within(goalCard).getByRole('button');
      expect(within(plusButton).getByTestId('PlusOneIcon')).toBeInTheDocument();

      service._getBarrier('updateGoal');
      await userEvent.click(plusButton);

      // Verify loading state
      expect(within(plusButton).getByRole('progressbar')).toBeInTheDocument();
      expect(plusButton).toBeDisabled();
      expect(
        within(plusButton).queryByTestId('PlusOneIcon')
      ).not.toBeInTheDocument();

      service.resolveOperation('updateGoal');

      await waitFor(() => {
        expect(
          within(plusButton).queryByRole('progressbar')
        ).not.toBeInTheDocument();
        expect(plusButton).not.toBeDisabled();
        expect(
          within(plusButton).getByTestId('PlusOneIcon')
        ).toBeInTheDocument();
      });
    });

    it('shows loading state when initially loading goals', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      // Set up barrier before rendering
      service._getBarrier('getWeeklyGoals');

      render(<MainPage goalsService={service} />);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('Test Goal')).not.toBeInTheDocument();
      });

      // Complete the operation
      service.resolveOperation('getWeeklyGoals');

      // Wait for goals to appear
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });
});
