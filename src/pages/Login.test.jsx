import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import * as firebaseAuth from 'firebase/auth';

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
}));

// Create mockNavigate and mockLocation that we can update
const mockNavigate = vi.fn();
let mockLocation = {
  state: { from: '/protected-route' },
};

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const renderLogin = () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location mock to default state
    mockLocation = {
      state: { from: '/protected-route' },
    };
    firebaseAuth.signInWithEmailLink.mockResolvedValue({
      additionalUserInfo: { isNewUser: false },
    });
    firebaseAuth.sendSignInLinkToEmail.mockResolvedValue();
  });

  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /email address/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Send Sign In Link')).toBeInTheDocument();
  });

  it('handles email submission', async () => {
    renderLogin();
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByText('Send Sign In Link');

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });

    // Wait for the async operations to complete
    await waitFor(async () => {
      fireEvent.click(submitButton);

      expect(firebaseAuth.sendSignInLinkToEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        expect.objectContaining({
          url: expect.any(String),
          handleCodeInApp: true,
        })
      );

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'emailForSignIn',
        'test@example.com'
      );
    });

    // Check for success message
    expect(
      screen.getByText(/check your email for the sign-in link/i)
    ).toBeInTheDocument();
  });

  it('handles email link sign-in when URL matches', async () => {
    // Mock isSignInWithEmailLink to return true
    firebaseAuth.isSignInWithEmailLink.mockReturnValue(true);

    // Mock localStorage getItem to return an email
    localStorage.getItem.mockReturnValue('test@example.com');

    renderLogin();

    expect(firebaseAuth.signInWithEmailLink).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      window.location.href
    );
  });

  it('shows error when email is missing during email link sign-in', () => {
    // Mock isSignInWithEmailLink to return true
    firebaseAuth.isSignInWithEmailLink.mockReturnValue(true);

    // Mock localStorage getItem to return null
    localStorage.getItem.mockReturnValue(null);

    renderLogin();

    expect(
      screen.getByText('Please provide your email again for confirmation')
    ).toBeInTheDocument();
  });

  it('handles sign-in errors', async () => {
    firebaseAuth.sendSignInLinkToEmail.mockRejectedValue(
      new Error('Failed to send email')
    );

    renderLogin();
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByText('Send Sign In Link');

    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to send email')).toBeInTheDocument();
    });
  });

  it('redirects to original route when user is already authenticated', () => {
    // Mock authenticated user
    vi.mocked(firebaseAuth.getAuth).mockReturnValue({
      currentUser: { uid: '123' },
    });

    renderLogin();

    expect(mockNavigate).toHaveBeenCalledWith('/protected-route');
  });

  it('redirects to root after successful email link sign-in', async () => {
    // Mock email link sign-in
    vi.mocked(firebaseAuth.isSignInWithEmailLink).mockReturnValue(true);
    localStorage.getItem.mockReturnValue('test@example.com');
    vi.mocked(firebaseAuth.signInWithEmailLink).mockResolvedValue({
      additionalUserInfo: { isNewUser: false },
    });

    renderLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('redirects to root when no original route is specified', () => {
    // Update the location mock for this test only
    mockLocation = { state: null };

    // Mock authenticated user
    vi.mocked(firebaseAuth.getAuth).mockReturnValue({
      currentUser: { uid: '123' },
    });

    renderLogin();

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
