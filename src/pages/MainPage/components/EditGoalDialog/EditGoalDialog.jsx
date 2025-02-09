import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Divider from '@mui/material/Divider';
import { MAX_TITLE_LENGTH, MAX_SUBGOALS } from '../../../../constants/goals';

const EditGoalDialog = ({
  goal,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading = { save: false, delete: false },
}) => {
  const [editedGoal, setEditedGoal] = useState(goal);
  const hasSubgoals = editedGoal?.subgoals?.length > 0;
  const hasEmptySubgoals = editedGoal?.subgoals
    ?.slice(0, -1)
    .some(subgoal => !subgoal.title.trim());
  const subgoalRefs = useRef([]);
  const hasMaxSubgoals = editedGoal?.subgoals?.length >= MAX_SUBGOALS;

  const hasEmptySubgoal = editedGoal?.subgoals?.some(
    subgoal => !subgoal.title.trim()
  );

  // Calculate total from subgoals if they exist
  const displayCount = hasSubgoals
    ? editedGoal.subgoals.reduce((sum, subgoal) => sum + subgoal.count, 0)
    : editedGoal?.count || 0;

  useEffect(() => {
    setEditedGoal(goal);
  }, [goal]);

  const handleAddSubgoal = () => {
    if (hasMaxSubgoals) return null;

    // Find first empty subgoal
    const emptySubgoalIndex = editedGoal?.subgoals?.findIndex(
      subgoal => !subgoal.title.trim()
    );

    if (editedGoal?.subgoals && emptySubgoalIndex !== -1) {
      // Focus existing empty subgoal
      setTimeout(() => {
        subgoalRefs.current[emptySubgoalIndex]?.focus();
      }, 0);
      return null;
    }

    // Create new subgoal if none are empty
    const newSubgoal = {
      id: crypto.randomUUID(),
      title: '',
      count: !hasSubgoals ? editedGoal.count : 0,
    };

    setEditedGoal({
      ...editedGoal,
      subgoals: [...(editedGoal.subgoals || []), newSubgoal],
    });

    // Focus the new input after render
    setTimeout(() => {
      const newIndex = editedGoal.subgoals?.length || 0;
      subgoalRefs.current[newIndex]?.focus();
    }, 0);

    return newSubgoal.id;
  };

  const handleSubgoalKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const isLastSubgoal = index === editedGoal.subgoals?.length - 1;
      const isEmpty = !editedGoal.subgoals[index].title.trim();
      const nextSubgoalExists = index < editedGoal.subgoals?.length - 1;

      if (isLastSubgoal && isEmpty) {
        // Save without the empty last subgoal
        const goalToSave = {
          ...editedGoal,
          subgoals: editedGoal.subgoals.slice(0, -1),
        };
        onSave(goalToSave);
      } else if (nextSubgoalExists) {
        // Focus next existing subgoal
        subgoalRefs.current[index + 1]?.focus();
      } else if (!hasMaxSubgoals && !isEmpty && !hasEmptySubgoal) {
        // Add new subgoal only if current one isn't empty and no empty subgoals exist
        handleAddSubgoal();
      }
    }
  };

  const handleUpdateSubgoal = (id, updates) => {
    setEditedGoal({
      ...editedGoal,
      subgoals: editedGoal.subgoals.map(subgoal =>
        subgoal.id === id ? { ...subgoal, ...updates } : subgoal
      ),
    });
  };

  const handleDeleteSubgoal = id => {
    setEditedGoal({
      ...editedGoal,
      subgoals: editedGoal.subgoals.filter(subgoal => subgoal.id !== id),
    });
  };

  const handleSave = () => {
    // Remove last subgoal if it's empty
    const lastSubgoal = editedGoal.subgoals?.[editedGoal.subgoals.length - 1];
    const hasEmptyLastSubgoal = lastSubgoal && !lastSubgoal.title.trim();

    const goalToSave = hasEmptyLastSubgoal
      ? {
          ...editedGoal,
          subgoals: editedGoal.subgoals.slice(0, -1),
        }
      : editedGoal;

    if (!hasEmptySubgoals) {
      onSave(goalToSave);
    }
  };

  const handleDelete = () => {
    onDelete(goal.id);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Edit Goal</DialogTitle>
      <DialogContent>
        {editedGoal && (
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Goal title"
              value={editedGoal.title}
              onChange={e =>
                setEditedGoal({ ...editedGoal, title: e.target.value })
              }
              onKeyUp={e => e.key === 'Enter' && handleSave()}
              slotProps={{
                htmlInput: {
                  maxLength: MAX_TITLE_LENGTH,
                },
              }}
            />
            <TextField
              fullWidth
              type="number"
              label={hasSubgoals ? 'Total count (from subgoals)' : 'Count'}
              value={displayCount}
              onChange={e =>
                !hasSubgoals &&
                setEditedGoal({
                  ...editedGoal,
                  count: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              disabled={hasSubgoals || isLoading.save || isLoading.delete}
              onKeyUp={e => e.key === 'Enter' && handleSave()}
              slotProps={{
                htmlInput: {
                  min: 0,
                },
              }}
            />

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">Subgoals</Typography>
              <IconButton
                size="small"
                onClick={handleAddSubgoal}
                disabled={isLoading.save || isLoading.delete || hasMaxSubgoals}
              >
                <AddIcon />
              </IconButton>
              {hasMaxSubgoals && (
                <Typography variant="caption" color="text.secondary">
                  Maximum {MAX_SUBGOALS} subgoals
                </Typography>
              )}
            </Box>

            {editedGoal.subgoals?.map((subgoal, index) => (
              <Box
                key={subgoal.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  size="small"
                  label="Subgoal title"
                  value={subgoal.title}
                  onChange={e =>
                    handleUpdateSubgoal(subgoal.id, { title: e.target.value })
                  }
                  onKeyDown={e => handleSubgoalKeyDown(e, index)}
                  inputRef={el => (subgoalRefs.current[index] = el)}
                  sx={{ flex: 1 }}
                  disabled={isLoading.save || isLoading.delete}
                  error={!subgoal.title.trim()}
                  helperText={!subgoal.title.trim() ? 'Title is required' : ''}
                  slotProps={{
                    htmlInput: {
                      maxLength: MAX_TITLE_LENGTH,
                    },
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Count"
                  value={subgoal.count}
                  onChange={e => {
                    handleUpdateSubgoal(subgoal.id, {
                      count: Math.max(0, parseInt(e.target.value) || 0),
                    });
                  }}
                  sx={{ width: '100px' }}
                  disabled={isLoading.save || isLoading.delete}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSubgoal(subgoal.id)}
                  disabled={isLoading.save || isLoading.delete}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          onClick={handleDelete}
          disabled={isLoading.delete || isLoading.save}
          startIcon={isLoading.delete ? <CircularProgress size={20} /> : null}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading.delete || isLoading.save || hasEmptySubgoals}
          startIcon={isLoading.save ? <CircularProgress size={20} /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditGoalDialog.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    subgoals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.shape({
    save: PropTypes.bool,
    delete: PropTypes.bool,
  }),
};

export default EditGoalDialog;
