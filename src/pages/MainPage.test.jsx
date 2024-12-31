import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainPage from './MainPage';

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
});
