import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeekSelector from './WeekSelector';

describe('WeekSelector', () => {
  const defaultProps = {
    selectedWeek: '2024-03-25',
    availableWeeks: ['2024-03-25', '2024-03-18', '2024-03-11'],
    onWeekChange: vi.fn(),
  };

  it('renders week selector with formatted dates', () => {
    render(<WeekSelector {...defaultProps} />);

    expect(screen.getByText('Mar 25, 2024')).toBeInTheDocument();
  });

  it('shows all available weeks in dropdown', async () => {
    render(<WeekSelector {...defaultProps} />);

    await userEvent.click(screen.getByRole('combobox'));

    // Mar 25, 2024 appears twice because it's the current week
    expect(screen.getAllByText('Mar 25, 2024')).toHaveLength(2);
    expect(screen.getByText('Mar 18, 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 11, 2024')).toBeInTheDocument();
  });

  it('calls onWeekChange when selecting a different week', async () => {
    render(<WeekSelector {...defaultProps} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Mar 18, 2024'));

    expect(defaultProps.onWeekChange).toHaveBeenCalledWith('2024-03-18');
  });
});
