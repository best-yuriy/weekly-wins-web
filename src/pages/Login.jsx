import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isEmailLinkSent, setIsEmailLinkSent] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    // Redirect to original route if user is already logged in
    if (auth.currentUser) {
      navigate(from);
    }
  }, [auth.currentUser, navigate, from]);

  useEffect(() => {
    // Check if the user is accessing the page from an email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem('emailForSignIn');

      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(result => {
            window.localStorage.removeItem('emailForSignIn');
            // Check if it's a new user
            if (result.additionalUserInfo?.isNewUser) {
              console.log('New user signed up via email link');
            }
            navigate('/');
          })
          .catch(err => setError(err.message));
      } else {
        setError('Please provide your email again for confirmation');
      }
    }
  }, [auth, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setIsEmailLinkSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign In
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {!isEmailLinkSent ? (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Send Sign In Link
            </Button>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              Check your email for the sign-in link! You can close this window.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
