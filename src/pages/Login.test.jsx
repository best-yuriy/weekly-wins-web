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

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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
    firebaseAuth.signInWithEmailLink.mockResolvedValue({
      additionalUserInfo: { isNewUser: false },
    });
    // Mock successful sendSignInLinkToEmail by default
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
});
