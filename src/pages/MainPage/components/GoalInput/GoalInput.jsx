import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { Add } from '@mui/icons-material';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const MAX_TITLE_LENGTH = 50;

const GoalInput = ({ onAddGoal, isLoading, suggestions = [] }) => {
  const [title, setTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const getFilteredSuggestions = () => {
    if (!title) return [];
    return suggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(title.toLowerCase())
      )
      .slice(0, 5);
  };

  const handleSubmit = async () => {
    if (title.trim()) {
      try {
        await onAddGoal(title.trim());
        setTitle(''); // Clear only on success
        setAnchorEl(null);
        setSelectedIndex(-1);
      } catch {
        // Error is already logged in parent
      }
    }
  };

  const handleSuggestionClick = async suggestion => {
    try {
      await onAddGoal(suggestion);
      setTitle('');
      setAnchorEl(null);
      setSelectedIndex(-1);
    } catch {
      // Error is already logged in parent
    }
  };

  const handleKeyDown = e => {
    const filteredSuggestions = getFilteredSuggestions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (selectedIndex > -1 && filteredSuggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setAnchorEl(null);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        fullWidth
        placeholder="Enter new goal"
        value={title}
        onChange={e => {
          setTitle(e.target.value);
          setAnchorEl(e.currentTarget);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setTimeout(() => {
            setAnchorEl(null);
            setSelectedIndex(-1);
          }, 200);
        }}
        disabled={isLoading}
        size="small"
        sx={{ width: '100%' }}
        slotProps={{
          htmlInput: {
            maxLength: MAX_TITLE_LENGTH,
          },
        }}
      />
      <Popper
        open={!!anchorEl && getFilteredSuggestions().length > 0}
        anchorEl={anchorEl}
        placement="bottom-start"
      >
        <Paper elevation={3}>
          <List sx={{ width: anchorEl?.offsetWidth }}>
            {getFilteredSuggestions().map((suggestion, index) => (
              <ListItemButton
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                selected={index === selectedIndex}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemText primary={suggestion} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Popper>
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
  suggestions: PropTypes.arrayOf(PropTypes.string),
};

export default GoalInput;
