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

  describe('subgoal keyboard navigation', () => {
    it('focuses next subgoal on Enter', async () => {
      const goalWithSubgoals = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: 'First Subgoal', count: 1 },
          { id: 'subgoal-2', title: 'Second Subgoal', count: 1 },
        ],
      };

      render(<EditGoalDialog {...defaultProps} goal={goalWithSubgoals} />);

      const inputs = screen.getAllByLabelText('Subgoal title');
      await userEvent.type(inputs[0], '{Enter}');

      expect(inputs[1]).toHaveFocus();
    });

    it('does not create new subgoal if current is empty', async () => {
      const goalWithEmptySubgoal = {
        ...defaultProps.goal,
        subgoals: [{ id: 'subgoal-1', title: '', count: 0 }],
      };

      render(<EditGoalDialog {...defaultProps} goal={goalWithEmptySubgoal} />);

      const input = screen.getByLabelText('Subgoal title');
      await userEvent.type(input, '{Enter}');

      // Should still have only one subgoal
      expect(screen.getAllByLabelText('Subgoal title')).toHaveLength(1);
    });

    it('does not create new subgoal if next subgoal is empty', async () => {
      const goalWithEmptyNextSubgoal = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: 'First Subgoal', count: 1 },
          { id: 'subgoal-2', title: '', count: 0 },
        ],
      };

      render(
        <EditGoalDialog {...defaultProps} goal={goalWithEmptyNextSubgoal} />
      );

      const inputs = screen.getAllByLabelText('Subgoal title');
      await userEvent.type(inputs[0], '{Enter}');

      // Should focus next subgoal but not create a new one
      expect(inputs[1]).toHaveFocus();
      expect(screen.getAllByLabelText('Subgoal title')).toHaveLength(2);
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

  describe('subgoal creation', () => {
    it('transfers parent count to first subgoal', async () => {
      const goalWithCount = {
        ...defaultProps.goal,
        count: 42,
      };

      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id');
      render(<EditGoalDialog {...defaultProps} goal={goalWithCount} />);

      // Add first subgoal
      await userEvent.click(screen.getByTestId('AddIcon'));

      // Verify the count was transferred

      // The parent input is labeled "Total count (from subgoals)" after the first subgoal is added
      expect(screen.getByLabelText('Total count (from subgoals)')).toHaveValue(
        42
      );
      // Therefore, the _first_ input labeled "Count" belongs to the first subgoal.
      const countInputs = screen.getAllByLabelText('Count');
      expect(countInputs[0]).toHaveValue(42);
    });

    it('does not transfer parent count to subsequent subgoals', async () => {
      const goalWithSubgoal = {
        ...defaultProps.goal,
        count: 42,
        subgoals: [
          { id: 'existing-subgoal', title: 'First Subgoal', count: 42 },
        ],
      };

      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id');
      render(<EditGoalDialog {...defaultProps} goal={goalWithSubgoal} />);

      // Add second subgoal
      await userEvent.click(screen.getByTestId('AddIcon'));

      // The parent input is labeled "Total count (from subgoals)" when we have subgoals.
      expect(screen.getByLabelText('Total count (from subgoals)')).toHaveValue(
        42
      );
      const countInputs = screen.getAllByLabelText('Count');
      // Therefore, the _second_ input labeled "Count" belongs to the second subgoal.
      expect(countInputs[1]).toHaveValue(0);
    });

    it('focuses first empty subgoal when clicking add button', async () => {
      const goalWithEmptySubgoal = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: 'First Subgoal', count: 1 },
          { id: 'subgoal-2', title: '', count: 0 },
          { id: 'subgoal-3', title: '', count: 0 },
        ],
      };

      render(<EditGoalDialog {...defaultProps} goal={goalWithEmptySubgoal} />);

      await userEvent.click(screen.getByTestId('AddIcon'));

      const inputs = screen.getAllByLabelText('Subgoal title');
      expect(inputs[1]).toHaveFocus(); // Second subgoal (first empty one)
    });

    it('creates new subgoal when no empty subgoals exist', async () => {
      const goalWithFilledSubgoals = {
        ...defaultProps.goal,
        subgoals: [{ id: 'subgoal-1', title: 'First Subgoal', count: 1 }],
      };

      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id');
      render(
        <EditGoalDialog {...defaultProps} goal={goalWithFilledSubgoals} />
      );

      await userEvent.click(screen.getByTestId('AddIcon'));

      const inputs = screen.getAllByLabelText('Subgoal title');
      expect(inputs).toHaveLength(2);
      expect(inputs[1]).toHaveFocus(); // New subgoal
    });
  });

  describe('count validation', () => {
    it('prevents negative numbers in parent goal count', async () => {
      render(<EditGoalDialog {...defaultProps} />);

      const countInput = screen.getByLabelText('Count');
      await userEvent.clear(countInput);
      await userEvent.type(countInput, '-');
      await userEvent.type(countInput, '5');

      expect(countInput).toHaveValue(5);
    });

    it('prevents negative numbers in subgoal counts', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      const countInputs = screen.getAllByLabelText('Count');
      await userEvent.clear(countInputs[1]); // First subgoal count
      await userEvent.type(countInputs[1], '-');
      await userEvent.type(countInputs[1], '5');

      expect(countInputs[1]).toHaveValue(5);
    });

    it('converts non-numeric input to 0', async () => {
      render(<EditGoalDialog {...propsWithSubgoals} />);

      const countInputs = screen.getAllByLabelText('Count');
      await userEvent.clear(countInputs[1]);
      await userEvent.type(countInputs[1], 'abc');

      expect(countInputs[1]).toHaveValue(0);
    });
  });

  describe('subgoal focus', () => {
    it('focuses new subgoal input when clicking add button', async () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id-1');
      render(<EditGoalDialog {...defaultProps} />);

      // verify the first added subgoal is focused
      await userEvent.click(screen.getByTestId('AddIcon'));

      const inputsAfterFirstAdd = screen.getAllByLabelText('Subgoal title');
      expect(inputsAfterFirstAdd[0]).toHaveFocus();
      await userEvent.type(inputsAfterFirstAdd[0], 'First Subgoal');

      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id-2');

      // verify the second added subgoal is focused
      await userEvent.click(screen.getByTestId('AddIcon'));

      const inputsAfterSecondAdd = screen.getAllByLabelText('Subgoal title');
      expect(inputsAfterSecondAdd[1]).toHaveFocus();
    });

    it('focuses new subgoal input after creating it with Enter', async () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id-1');
      render(<EditGoalDialog {...defaultProps} />);

      await userEvent.click(screen.getByTestId('AddIcon'));

      vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-subgoal-id-2');

      await userEvent.type(
        screen.getByLabelText('Subgoal title'),
        'New Subgoal{Enter}'
      );

      const inputsAfterFirstAdd = screen.getAllByLabelText('Subgoal title');
      expect(inputsAfterFirstAdd[1]).toHaveFocus();
    });
  });

  describe('empty last subgoal handling', () => {
    it('saves goal without empty last subgoal', async () => {
      const goalWithEmptyLastSubgoal = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: 'First Subgoal', count: 1 },
          { id: 'subgoal-2', title: '', count: 0 },
        ],
      };

      render(
        <EditGoalDialog {...defaultProps} goal={goalWithEmptyLastSubgoal} />
      );

      await userEvent.click(screen.getByText('Save'));

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...goalWithEmptyLastSubgoal,
        subgoals: [goalWithEmptyLastSubgoal.subgoals[0]], // Only the non-empty subgoal
      });
    });

    it('saves on Enter in empty last subgoal', async () => {
      const goalWithEmptyLastSubgoal = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: 'First Subgoal', count: 1 },
          { id: 'subgoal-2', title: '', count: 0 },
        ],
      };

      render(
        <EditGoalDialog {...defaultProps} goal={goalWithEmptyLastSubgoal} />
      );

      const lastInput = screen.getAllByLabelText('Subgoal title')[1];
      await userEvent.type(lastInput, '{Enter}');

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        ...goalWithEmptyLastSubgoal,
        subgoals: [goalWithEmptyLastSubgoal.subgoals[0]], // Only the non-empty subgoal
      });
    });

    it('still prevents saving with empty non-last subgoals', async () => {
      const goalWithEmptyMiddleSubgoal = {
        ...defaultProps.goal,
        subgoals: [
          { id: 'subgoal-1', title: '', count: 0 }, // Empty middle subgoal
          { id: 'subgoal-2', title: 'Last Subgoal', count: 1 },
        ],
      };

      render(
        <EditGoalDialog {...defaultProps} goal={goalWithEmptyMiddleSubgoal} />
      );

      expect(screen.getByText('Save')).toBeDisabled();
    });
  });
});
