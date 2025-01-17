import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditGoalDialog from './EditGoalDialog';

describe('EditGoalDialog', () => {
  const defaultProps = {
    goal: {
      id: 'test-id',
      title: 'Test Goal',
      count: 2,
    },
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onDelete: vi.fn(),
    isLoading: { save: false, delete: false },
  };

  it('renders dialog with goal details', () => {
    render(<EditGoalDialog {...defaultProps} />);

    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal title')).toHaveValue('Test Goal');
    expect(screen.getByLabelText('Count')).toHaveValue(2);
  });

  it('calls onSave with the goal when Save is clicked', async () => {
    render(<EditGoalDialog {...defaultProps} />);

    await userEvent.click(screen.getByText('Save'));

    expect(defaultProps.onSave).toHaveBeenCalledWith(defaultProps.goal);
  });

  it('calls onDelete with goal id when Delete is clicked', async () => {
    render(<EditGoalDialog {...defaultProps} />);

    await userEvent.click(screen.getByText('Delete'));

    expect(defaultProps.onDelete).toHaveBeenCalledWith('test-id');
  });

  it('updates goal title on change', async () => {
    render(<EditGoalDialog {...defaultProps} />);

    const titleInput = screen.getByLabelText('Goal title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Goal');
    await userEvent.click(screen.getByText('Save'));
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      ...defaultProps.goal,
      title: 'Updated Goal',
    });
  });

  it('updates goal count on change', async () => {
    render(<EditGoalDialog {...defaultProps} />);

    const countInput = screen.getByLabelText('Count');
    await userEvent.clear(countInput);
    await userEvent.type(countInput, '5');
    await userEvent.click(screen.getByText('Save'));
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      ...defaultProps.goal,
      count: 5,
    });
  });

  it('shows loading state and disables buttons when saving', () => {
    render(<EditGoalDialog {...defaultProps} isLoading={{ save: true }} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('shows loading state and disables buttons when deleting', () => {
    render(<EditGoalDialog {...defaultProps} isLoading={{ delete: true }} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
  });
});
