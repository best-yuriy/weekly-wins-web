import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalInput from './GoalInput';

describe('GoalInput', () => {
  const defaultProps = {
    onAddGoal: vi.fn(),
    isLoading: false,
    suggestions: ['Previous Goal 1', 'Previous Goal 2', 'An older Goal'],
  };

  beforeEach(() => {
    defaultProps.onAddGoal.mockClear();
  });

  it('renders input and add button', () => {
    render(<GoalInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Enter new goal')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('calls onAddGoal with input value when clicking Add', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'New Goal');
    await userEvent.click(screen.getByText('Add'));

    expect(defaultProps.onAddGoal).toHaveBeenCalledWith('New Goal');
    expect(input).toHaveValue(''); // Input should be cleared
  });

  it('trims the input value before calling onAddGoal', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, '  New Goal  ');
    await userEvent.click(screen.getByText('Add'));

    expect(defaultProps.onAddGoal).toHaveBeenCalledWith('New Goal');
  });

  it('calls onAddGoal when pressing Enter', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'New Goal{enter}');

    expect(defaultProps.onAddGoal).toHaveBeenCalledWith('New Goal');
    expect(input).toHaveValue('');
  });

  it('does not call onAddGoal when input is empty', async () => {
    render(<GoalInput {...defaultProps} />);

    await userEvent.click(screen.getByText('Add'));
    expect(defaultProps.onAddGoal).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<GoalInput {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new goal')).toBeDisabled();
    expect(screen.getByText('Add')).toBeDisabled();
  });

  it('shows suggestions when typing', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'Goal');

    expect(screen.getByText('Previous Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Previous Goal 2')).toBeInTheDocument();
  });

  it('filters suggestions based on input', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'older');

    expect(screen.getByText('An older Goal')).toBeInTheDocument();
    expect(screen.queryByText('Previous Goal 1')).not.toBeInTheDocument();
  });

  it('filters suggestions based on input case insensitive', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'Older');

    expect(screen.getByText('An older Goal')).toBeInTheDocument();
    expect(screen.queryByText('Previous Goal 1')).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'an older');

    expect(screen.getByText('An older Goal')).toBeInTheDocument();
    expect(screen.queryByText('Previous Goal 1')).not.toBeInTheDocument();
  });

  it('selects suggestion with keyboard navigation', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'Goal');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    expect(defaultProps.onAddGoal).toHaveBeenCalledWith('Previous Goal 1');
  });

  it('closes suggestions on Escape key', async () => {
    render(<GoalInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter new goal');
    await userEvent.type(input, 'Goal');
    expect(screen.getByText('Previous Goal 1')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Previous Goal 1')).not.toBeInTheDocument();
    });
  });
});
