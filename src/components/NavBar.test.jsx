import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import NavBar from './NavBar';
import { signOut } from 'firebase/auth';

// Mock the firebase config module that exports 'auth'
vi.mock('../firebase', () => ({
  auth: {
    // Mock properties used by the component
    currentUser: null,
  },
}));

// Mock the firebase/auth functions
vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  onAuthStateChanged: vi.fn(),
}));

// Helper function to render NavBar with Router
const renderNavBar = (user = null) => {
  return render(
    <BrowserRouter>
      <NavBar user={user} />
    </BrowserRouter>
  );
};

describe('NavBar', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('renders home link', () => {
    renderNavBar();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('shows login button when user is not authenticated', () => {
    renderNavBar();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('shows logout button when user is authenticated', () => {
    renderNavBar({ uid: '123' }); // Mock user object
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('calls signOut when logout button is clicked', async () => {
    renderNavBar({ uid: '123' });
    const logoutButton = screen.getByText('Logout');

    await fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test('handles logout error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock signOut to reject
    const mockError = new Error('Logout failed');
    signOut.mockRejectedValueOnce(mockError);

    renderNavBar({ uid: '123' });

    // Use await to properly handle the async click event
    await fireEvent.click(screen.getByText('Logout'));

    // Add a small delay to allow for the async error handling
    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', mockError);
    });

    consoleSpy.mockRestore();
  });
});
