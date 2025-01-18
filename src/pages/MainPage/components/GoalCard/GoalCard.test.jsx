import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalCard from './GoalCard';

describe('GoalCard', () => {
  const defaultProps = {
    goal: {
      id: 'test-id',
      title: 'Test Goal',
      count: 2,
    },
    isEditing: false,
    onIncrement: vi.fn(),
    onEdit: vi.fn(),
    isLoading: false,
  };

  it('renders goal title, count, and increment button', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByTestId('tally-mark')).toBeInTheDocument();
    expect(screen.getByTestId('PlusOneIcon')).toBeInTheDocument();
  });

  it('calls onIncrement when plus button is clicked', async () => {
    render(<GoalCard {...defaultProps} />);

    const plusButton = screen.getByTestId('PlusOneIcon').closest('button');
    await userEvent.click(plusButton);

    expect(defaultProps.onIncrement).toHaveBeenCalledWith('test-id');
    expect(defaultProps.onEdit).not.toHaveBeenCalled(); // Ensure click doesn't bubble
  });

  it('calls onEdit when card is clicked', async () => {
    render(<GoalCard {...defaultProps} />);

    await userEvent.click(screen.getByTestId('goal-card'));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultProps.goal);
  });

  it('shows loading state', () => {
    render(<GoalCard {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('PlusOneIcon')).not.toBeInTheDocument();
  });

  it('hides increment button in edit mode', () => {
    render(<GoalCard {...defaultProps} isEditing={true} />);

    expect(screen.queryByTestId('PlusOneIcon')).not.toBeInTheDocument();
  });
});
