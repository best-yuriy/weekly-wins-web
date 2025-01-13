import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Add this component at the top of the file
const LoginPageTest = () => {
  const location = useLocation();
  return (
    <div>
      Login Page
      <div
        data-testid="location-state"
        data-state={JSON.stringify(location.state)}
      />
    </div>
  );
};

// Helper function to render ProtectedRoute with Router
const renderProtectedRoute = (
  user = null,
  children = <div>Protected Content</div>,
  initialPath = '/protected'
) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPageTest />} />
        <Route
          path="/protected"
          element={<ProtectedRoute user={user}>{children}</ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    const mockUser = { uid: '123' };
    renderProtectedRoute(mockUser);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderProtectedRoute(null);
    // Instead of checking window.location, we check for the login page content
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders nested children correctly when authenticated', () => {
    const mockUser = { uid: '123' };
    const nestedContent = (
      <div>
        <h1>Title</h1>
        <p>Nested content</p>
      </div>
    );

    renderProtectedRoute(mockUser, nestedContent);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('includes original path in redirect state when not authenticated', () => {
    renderProtectedRoute(null, <div>Test Content</div>, '/protected');

    // Verify redirect occurred
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

    // Get the current location from the router's state
    const state = JSON.parse(
      screen.getByTestId('location-state').dataset.state || '{}'
    );
    expect(state).toEqual({ from: '/protected' });
  });
});
