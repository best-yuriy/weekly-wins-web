import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubgoalList from './SubgoalList';

describe('SubgoalList', () => {
  const defaultProps = {
    subgoals: [
      { id: 'subgoal-1', title: 'Subgoal 1', count: 1 },
      { id: 'subgoal-2', title: 'Subgoal 2', count: 3 },
    ],
    onChange: vi.fn(),
  };

  it('renders all subgoals with their titles and counts', () => {
    render(<SubgoalList {...defaultProps} />);
    expect(screen.getByText('Subgoal 1')).toBeInTheDocument();
    expect(screen.getByText('Subgoal 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('tally-mark')).toHaveLength(2);
  });

  it('increments subgoal count when plus button is clicked', async () => {
    render(<SubgoalList {...defaultProps} />);

    const plusButtons = screen.getAllByTestId('PlusOneIcon');
    await userEvent.click(plusButtons[0].closest('button'));

    expect(defaultProps.onChange).toHaveBeenCalledWith([
      { ...defaultProps.subgoals[0], count: 2 },
      defaultProps.subgoals[1],
    ]);
  });

  it('returns null when subgoals array is empty', () => {
    const { container } = render(
      <SubgoalList subgoals={[]} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when subgoals is undefined', () => {
    const { container } = render(<SubgoalList onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
