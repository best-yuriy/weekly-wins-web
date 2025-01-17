import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { Add } from '@mui/icons-material';

const GoalInput = ({ onAddGoal, isLoading }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    if (title.trim()) {
      try {
        await onAddGoal(title.trim());
        setTitle(''); // Clear only on success
      } catch {
        // Error is already logged in parent
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        fullWidth
        placeholder="Enter new goal"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyUp={e => e.key === 'Enter' && handleSubmit()}
        disabled={isLoading}
        size="small"
        sx={{ width: '100%' }}
      />
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} /> : <Add />}
        onClick={handleSubmit}
        disabled={isLoading}
        sx={{ width: '6rem' }}
      >
        Add
      </Button>
    </Box>
  );
};

GoalInput.propTypes = {
  onAddGoal: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default GoalInput;
