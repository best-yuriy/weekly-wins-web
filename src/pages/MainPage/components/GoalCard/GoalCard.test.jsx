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
    onUpdate: vi.fn(),
    isLoading: false,
  };

  const propsWithSubgoals = {
    ...defaultProps,
    goal: {
      ...defaultProps.goal,
      subgoals: [{ id: 'subgoal-1', title: 'Subgoal 1', count: 1 }],
    },
  };

  it('renders goal title, count, and increment button for goals without subgoals', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByTestId('tally-mark')).toBeInTheDocument();
    expect(screen.getByTestId('PlusOneIcon')).toBeInTheDocument();
  });

  it('renders expand button instead of increment button for goals with subgoals', () => {
    render(<GoalCard {...propsWithSubgoals} />);
    expect(screen.getByTestId('ExpandMoreIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('PlusOneIcon')).not.toBeInTheDocument();
  });

  it('toggles subgoal visibility when expand button is clicked', async () => {
    render(<GoalCard {...propsWithSubgoals} />);

    const expandButton = screen.getByTestId('ExpandMoreIcon').closest('button');
    await userEvent.click(expandButton);

    expect(screen.getByText('Subgoal 1')).toBeInTheDocument();
    expect(screen.getByTestId('ExpandLessIcon')).toBeInTheDocument();

    await userEvent.click(
      screen.getByTestId('ExpandLessIcon').closest('button')
    );
    expect(screen.queryByText('Subgoal 1')).not.toBeInTheDocument();
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
