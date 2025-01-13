import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
