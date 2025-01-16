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
  const [isSignInLink, setIsSignInLink] = useState(false);
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
    // Check if the current URL is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setIsSignInLink(true);
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      if (savedEmail) {
        setEmail(savedEmail);
        // Attempt to sign in automatically with saved email
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            navigate('/');
          })
          .catch(err => setError(err.message));
      }
    }
  }, [auth, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (isSignInLink) {
      // Handle sign-in with provided email
      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Handle sending new sign-in link
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
          {isSignInLink ? 'Complete Sign In' : 'Sign In'}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={isSignInLink ? 'Confirm your email' : 'Email Address'}
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
              {isSignInLink ? 'Complete Sign In' : 'Send Sign In Link'}
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
