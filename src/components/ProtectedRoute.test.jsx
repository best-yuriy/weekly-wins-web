import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Helper function to render ProtectedRoute with Router
const renderProtectedRoute = (
  user = null,
  children = <div>Protected Content</div>
) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
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
});
