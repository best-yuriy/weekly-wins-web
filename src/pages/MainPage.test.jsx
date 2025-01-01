import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from './MainPage';

// Mock the getCurrentWeekKey to return a consistent date
vi.mock('../utils/dateUtils', async () => {
  const actual = await vi.importActual('../utils/dateUtils');
  return {
    ...actual,
    getCurrentWeekKey: () => '2024-03-25', // Monday
  };
});

describe('MainPage', () => {
  it('renders the main page with title', () => {
    render(<MainPage />);
    expect(screen.getByText('Weekly Goals')).toBeInTheDocument();
  });

  it('adds a new goal when clicking the add button', async () => {
    render(<MainPage />);
    const input = screen.getByPlaceholderText('Enter new goal');
    const addButton = screen.getByText('Add');

    await userEvent.type(input, 'Test Goal');
    await userEvent.click(addButton);

    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('adds a new goal when pressing Enter', async () => {
    render(<MainPage />);
    const input = screen.getByPlaceholderText('Enter new goal');

    await userEvent.type(input, 'Test Goal{enter}');
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
  });

  it('increments goal count when clicking the plus button', async () => {
    render(<MainPage />);

    // Add a goal first
    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'Test Goal{enter}');

    const plusButton = screen.getByTestId('PlusOneIcon').parentElement;
    await userEvent.click(plusButton);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('enables editing mode when clicking Edit button', async () => {
    render(<MainPage />);
    const editButton = screen.getByText('Edit');

    await userEvent.click(editButton);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('allows editing a goal through the dialog', async () => {
    render(<MainPage />);

    // Add a goal first
    await userEvent.type(
      screen.getByPlaceholderText('Enter new goal'),
      'Test Goal{enter}'
    );

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

  it('deletes a goal', async () => {
    render(<MainPage />);

    // Add a goal first
    await userEvent.type(
      screen.getByPlaceholderText('Enter new goal'),
      'Test Goal{enter}'
    );

    // Enter edit mode and click the goal
    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Test Goal'));

    // Delete the goal
    await userEvent.click(screen.getByText('Delete'));

    expect(screen.queryByText('Test Goal')).not.toBeInTheDocument();
  });

  describe('week selector', () => {
    it('shows current week by default', () => {
      render(<MainPage />);
      expect(screen.getByText('Mar 25, 2024')).toBeInTheDocument();
    });

    it('shows goals from initial data', () => {
      const initialGoals = {
        '2024-03-25': [{ id: '1', title: 'Current week goal', count: 0 }],
      };

      render(<MainPage initialGoals={initialGoals} />);
      expect(screen.getByText('Current week goal')).toBeInTheDocument();
    });

    it('switches between weeks with existing goals', async () => {
      const initialGoals = {
        '2024-03-25': [{ id: '1', title: 'Current week goal', count: 0 }],
        '2024-03-18': [{ id: '2', title: 'Previous week goal', count: 0 }],
      };

      render(<MainPage initialGoals={initialGoals} />);

      // Initially shows current week
      expect(screen.getByText('Current week goal')).toBeInTheDocument();
      expect(screen.queryByText('Previous week goal')).not.toBeInTheDocument();

      // Click the select to open it
      await userEvent.click(screen.getByRole('combobox'));
      // Click the option for the previous week
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      // Shows previous week goals
      expect(screen.queryByText('Current week goal')).not.toBeInTheDocument();
      expect(screen.getByText('Previous week goal')).toBeInTheDocument();
    });

    it('maintains separate goal counts for different weeks', async () => {
      const initialGoals = {
        '2024-03-25': [{ id: '1', title: 'Goal', count: 1 }],
        '2024-03-18': [{ id: '2', title: 'Goal', count: 2 }],
      };

      render(<MainPage initialGoals={initialGoals} />);

      // Check current week count
      expect(screen.getByText('1')).toBeInTheDocument();

      // Click the select to open it
      await userEvent.click(screen.getByRole('combobox'));
      // Click the option for the previous week
      await userEvent.click(screen.getByText('Mar 18, 2024'));

      // Check previous week has different count
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
