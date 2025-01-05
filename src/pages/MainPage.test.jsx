import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from './MainPage';
import InMemoryGoalsService from '../services/goals/InMemoryGoalsService';

// Mock getCurrentWeekKey for consistent dates
vi.mock('../utils/dateUtils', async () => {
  const actual = await vi.importActual('../utils/dateUtils');
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

  it('renders the main page with title', async () => {
    render(<MainPage goalsService={new InMemoryGoalsService()} />);

    await waitFor(() => {
      expect(screen.getByText('Weekly Goals')).toBeInTheDocument();
    });
  });

  it('adds a new goal when clicking the add button', async () => {
    const service = new InMemoryGoalsService();

    render(<MainPage goalsService={service} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    const addButton = screen.getByText('Add');

    await userEvent.type(input, 'Test Goal');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('adds a new goal when pressing enter', async () => {
    const service = new InMemoryGoalsService();
    render(<MainPage goalsService={service} />);
    const input = screen.getByPlaceholderText('Enter new goal');

    await userEvent.type(input, 'Test Goal{enter}');

    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('increments goal count when clicking the plus button', async () => {
    const service = new InMemoryGoalsService();
    await service.addGoal('2024-03-25', testGoal);

    render(<MainPage goalsService={service} />);

    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
    });

    const plusButton = screen.getByTestId('PlusOneIcon').parentElement;
    await userEvent.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('enables editing mode when clicking Edit button', async () => {
    const service = new InMemoryGoalsService();
    render(<MainPage goalsService={service} />);

    const editButton = screen.getByText('Edit');
    await userEvent.click(editButton);

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('allows editing a goal through the dialog', async () => {
    const service = new InMemoryGoalsService();
    await service.addGoal('2024-03-25', testGoal);

    render(<MainPage goalsService={service} />);

    // Enter edit mode and click the goal
    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Test Goal'));

    // Edit the goal title
    const titleInput = screen.getByLabelText('Goal title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Goal');

    // Save changes
    await userEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Updated Goal')).toBeInTheDocument();
  });

  it('deletes a goal and exits edit mode', async () => {
    const service = new InMemoryGoalsService();
    await service.addGoal('2024-03-25', testGoal);

    render(<MainPage goalsService={service} />);

    // Enter edit mode and click the goal
    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Test Goal'));

    // Delete the goal
    await userEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      // Check that the goal is deleted
      expect(screen.queryByText('Test Goal')).not.toBeInTheDocument();
      // Check that we're back in non-edit mode (Edit button is visible)
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.queryByText('Done')).not.toBeInTheDocument();
    });
  });

  describe('week selector', () => {
    it('shows current week by default', async () => {
      const service = new InMemoryGoalsService();
      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Mar 25, 2024')).toBeInTheDocument();
      });
    });

    it('always shows current week in selector even with no goals', async () => {
      const service = new InMemoryGoalsService();
      // Don't add any goals - service starts empty

      render(<MainPage goalsService={service} />);

      // Click the select to open it
      await userEvent.click(screen.getByRole('combobox'));

      // Wait for the dropdown to be populated
      await waitFor(() => {
        // Use getAllByRole to get all options and check their text content
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Mar 25, 2024');
      });
    });

    it('shows weeks in correct order', async () => {
      const service = new InMemoryGoalsService();
      // Add goals in random order
      await service.addGoal('2024-03-18', testGoal);
      await service.addGoal('2024-03-11', testGoal);

      render(<MainPage goalsService={service} />);

      await userEvent.click(screen.getByRole('combobox'));

      const options = screen.getAllByRole('option');
      expect(options.map(opt => opt.textContent)).toEqual([
        'Mar 25, 2024', // Current week first
        'Mar 18, 2024',
        'Mar 11, 2024',
      ]);
    });

    it('switches between weeks with existing goals', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', {
        ...testGoal,
        title: 'Current week goal',
      });
      await service.addGoal('2024-03-18', {
        ...testGoal,
        title: 'Previous week goal',
      });

      render(<MainPage goalsService={service} />);

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByText('Current week goal')).toBeInTheDocument();
      });
      expect(screen.queryByText('Previous week goal')).not.toBeInTheDocument();

      // Click the select to open it
      await userEvent.click(screen.getByRole('combobox'));
      // Click the option for the previous week
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      // Wait for goals to load after week change
      await waitFor(() => {
        expect(screen.queryByText('Current week goal')).not.toBeInTheDocument();
        expect(screen.getByText('Previous week goal')).toBeInTheDocument();
      });
    });

    it('maintains separate goal counts for different weeks', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', { ...testGoal, count: 1 });
      await service.addGoal('2024-03-18', { ...testGoal, count: 2 });

      render(<MainPage goalsService={service} />);

      // Check current week count
      await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());

      // Click the select to open it
      await userEvent.click(screen.getByRole('combobox'));
      // Click the option for the previous week
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      // Check previous week has different count
      await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
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

      const input = screen.getByPlaceholderText('Enter new goal');
      const addButton = screen.getByText('Add');

      await userEvent.type(input, 'Test Goal');

      service._getBarrier('addGoal');
      const addPromise = userEvent.click(addButton);

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

      // Enter edit mode and click the goal
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Test Goal'));

      const saveButton = screen.getByText('Save');

      service._getBarrier('updateGoal');
      const updatePromise = userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
      });

      service.resolveOperation('updateGoal');
      await updatePromise;

      // Wait for all updates to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('shows loading state when deleting a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      // Enter edit mode and click the goal
      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Test Goal'));

      const deleteButton = screen.getByText('Delete');

      service._getBarrier('deleteGoal');
      const deletePromise = userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(deleteButton).toBeDisabled();
      });

      service.resolveOperation('deleteGoal');
      await deletePromise;

      // Wait for all updates to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Goal')).not.toBeInTheDocument();
      });
    });

    it('shows loading state when incrementing a goal', async () => {
      const service = new InMemoryGoalsService();
      await service.addGoal('2024-03-25', testGoal);

      render(<MainPage goalsService={service} />);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      const plusButton = screen.getByTestId('PlusOneIcon').closest('button');

      service._getBarrier('updateGoal');
      const incrementPromise = userEvent.click(plusButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(plusButton).toBeDisabled();
      });

      service.resolveOperation('updateGoal');
      await incrementPromise;

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(plusButton).not.toBeDisabled();
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
