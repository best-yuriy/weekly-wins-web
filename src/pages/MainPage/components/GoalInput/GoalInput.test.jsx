import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalInput from './GoalInput';

describe('GoalInput', () => {
  const defaultProps = {
    onAddGoal: vi.fn(),
    isLoading: false,
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
});
