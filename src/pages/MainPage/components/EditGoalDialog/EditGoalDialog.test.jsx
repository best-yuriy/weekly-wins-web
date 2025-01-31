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

  const propsWithSubgoals = {
    ...defaultProps,
    goal: {
      ...defaultProps.goal,
      count: 10, // This should be ignored since subgoals exist
      subgoals: [
        { id: 'subgoal-1', title: 'Subgoal 1', count: 2 },
        { id: 'subgoal-2', title: 'Subgoal 2', count: 3 },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors when closed with no goal', () => {
    render(<EditGoalDialog {...defaultProps} goal={null} isOpen={false} />);

    // Dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // No errors should be thrown
  });

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

  it('enforces maximum length on goal and subgoal titles', async () => {
    render(<EditGoalDialog {...propsWithSubgoals} />);

    const longTitle = 'a'.repeat(60); // Longer than MAX_TITLE_LENGTH
    const expectedTitle = longTitle.slice(0, 50); // Should be truncated

    // Test parent goal title
    const titleInput = screen.getByLabelText('Goal title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, longTitle);
    expect(titleInput).toHaveValue(expectedTitle);

    // Test subgoal title
    const subgoalTitleInput = screen.getAllByLabelText('Subgoal title')[0];
    await userEvent.clear(subgoalTitleInput);
    await userEvent.type(subgoalTitleInput, longTitle);
    expect(subgoalTitleInput).toHaveValue(expectedTitle);
  });

  describe('subgoals', () => {
    it('shows total count from subgoals in parent count field', () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      const countInput = screen.getByLabelText('Total count (from subgoals)');
      expect(countInput).toHaveValue(5); // 2 + 3
      expect(countInput).toBeDisabled();
    });

    it('allows adding new subgoals', async () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id');
      render(<EditGoalDialog {...propsWithSubgoals} />);

      await userEvent.click(screen.getByTestId('AddIcon').closest('button'));
      await userEvent.type(
        screen.getAllByLabelText('Subgoal title')[2],
        'New Subgoal'
      );
      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...propsWithSubgoals.goal,
        subgoals: [
          ...propsWithSubgoals.goal.subgoals,
          { id: 'new-subgoal-id', title: 'New Subgoal', count: 0 },
        ],
      });
    });

    it('allows editing subgoal title and count', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Edit first subgoal
      const titleInputs = screen.getAllByLabelText('Subgoal title');
      const countInputs = screen.getAllByLabelText('Count');

      await userEvent.clear(titleInputs[0]);
      await userEvent.type(titleInputs[0], 'Updated Subgoal');
      await userEvent.clear(countInputs[0]);
      await userEvent.type(countInputs[0], '4');

      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...propsWithSubgoals.goal,
        subgoals: [
          {
            ...propsWithSubgoals.goal.subgoals[0],
            title: 'Updated Subgoal',
            count: 4,
          },
          propsWithSubgoals.goal.subgoals[1],
        ],
      });
    });

    it('allows deleting subgoals', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Delete first subgoal
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await userEvent.click(deleteButtons[0].closest('button'));
      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...propsWithSubgoals.goal,
        subgoals: [propsWithSubgoals.goal.subgoals[1]],
      });
    });

    it('disables parent count field when subgoals exist', () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      const countInput = screen.getByLabelText('Total count (from subgoals)');
      expect(countInput).toBeDisabled();
    });

    it('enables parent count field when all subgoals are deleted', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Delete all subgoals
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await userEvent.click(deleteButtons[0].closest('button'));
      await userEvent.click(deleteButtons[1].closest('button'));

      const countInput = screen.getByLabelText('Count');
      expect(countInput).not.toBeDisabled();

      // Should now be able to edit the count
      await userEvent.clear(countInput);
      await userEvent.type(countInput, '7');
      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...propsWithSubgoals.goal,
        subgoals: [],
        count: 7,
      });
    });
  });

  describe('subgoal validation', () => {
    it('disables save button when subgoal has empty title', () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Clear first subgoal's title
      const titleInputs = screen.getAllByLabelText('Subgoal title');
      userEvent.clear(titleInputs[0]);

      expect(screen.getByText('Save')).toBeDisabled();
    });

    it('shows error state on empty subgoal title', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Clear first subgoal's title
      const titleInput = screen.getAllByLabelText('Subgoal title')[0];
      await userEvent.clear(titleInput);

      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('prevents saving when subgoal has empty title', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Clear first subgoal's title
      const titleInput = screen.getAllByLabelText('Subgoal title')[0];
      await userEvent.clear(titleInput);

      // Verify save is disabled and onSave wasn't called
      expect(screen.getByText('Save')).toBeDisabled();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('allows saving when all subgoal titles are filled', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Update first subgoal's title
      const titleInput = screen.getAllByLabelText('Subgoal title')[0];
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Subgoal');

      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...propsWithSubgoals.goal,
        subgoals: [
          { ...propsWithSubgoals.goal.subgoals[0], title: 'Updated Subgoal' },
          propsWithSubgoals.goal.subgoals[1],
        ],
      });
    });
  });

  describe('keyboard navigation for subgoals', () => {
    it('creates new subgoal and focuses it when pressing Enter', async () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id');
      render(<EditGoalDialog {...propsWithSubgoals} />);

      const subgoalInputs = screen.getAllByLabelText('Subgoal title');
      const firstInput = subgoalInputs[0];

      // Press Enter in the first subgoal
      await userEvent.type(firstInput, '{Enter}');

      // Should now have one more input
      const updatedInputs = screen.getAllByLabelText('Subgoal title');
      expect(updatedInputs).toHaveLength(subgoalInputs.length + 1);

      // New input should be focused
      expect(updatedInputs[1]).toHaveFocus();
    });

    it('maintains focus after adding multiple subgoals', async () => {
      vi.spyOn(crypto, 'randomUUID')
        .mockReturnValueOnce('new-subgoal-1')
        .mockReturnValueOnce('new-subgoal-2');

      render(<EditGoalDialog {...propsWithSubgoals} />);

      // Add two subgoals using Enter
      const initialInputs = screen.getAllByLabelText('Subgoal title');
      await userEvent.type(initialInputs[0], '{Enter}');

      const secondInputs = screen.getAllByLabelText('Subgoal title');
      await userEvent.type(secondInputs[1], '{Enter}');

      const finalInputs = screen.getAllByLabelText('Subgoal title');
      expect(finalInputs).toHaveLength(initialInputs.length + 2);
      expect(finalInputs[2]).toHaveFocus();
    });
  });

  describe('subgoal limit', () => {
    it('disables add button when maximum subgoals reached', () => {
      const propsWithMaxSubgoals = {
        ...defaultProps,
        goal: {
          ...defaultProps.goal,
          subgoals: Array(5)
            .fill(null)
            .map((_, index) => ({
              id: `subgoal-${index}`,
              title: `Subgoal ${index + 1}`,
              count: 1,
            })),
        },
      };

      render(<EditGoalDialog {...propsWithMaxSubgoals} />);

      const addButton = screen.getByTestId('AddIcon').closest('button');
      expect(addButton).toBeDisabled();
      expect(screen.getByText('Maximum 5 subgoals')).toBeInTheDocument();
    });

    it('prevents adding subgoals via keyboard when at limit', async () => {
      const propsWithMaxSubgoals = {
        ...defaultProps,
        goal: {
          ...defaultProps.goal,
          subgoals: Array(5)
            .fill(null)
            .map((_, index) => ({
              id: `subgoal-${index}`,
              title: `Subgoal ${index + 1}`,
              count: 1,
            })),
        },
      };

      render(<EditGoalDialog {...propsWithMaxSubgoals} />);

      const lastInput = screen.getAllByLabelText('Subgoal title')[4];
      await userEvent.type(lastInput, '{Enter}');

      // Should still have only 5 subgoals
      expect(screen.getAllByLabelText('Subgoal title')).toHaveLength(5);
    });

    it('shows maximum subgoals message when limit reached', () => {
      const propsWithMaxSubgoals = {
        ...defaultProps,
        goal: {
          ...defaultProps.goal,
          subgoals: Array(5)
            .fill(null)
            .map((_, index) => ({
              id: `subgoal-${index}`,
              title: `Subgoal ${index + 1}`,
              count: 1,
            })),
        },
      };

      render(<EditGoalDialog {...propsWithMaxSubgoals} />);

      expect(screen.getByText('Maximum 5 subgoals')).toBeInTheDocument();
    });
  });
});
