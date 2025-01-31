import { useState, useEffect } from 'react';
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
import { MAX_TITLE_LENGTH } from '../../../../constants/goals';

// TODO: Disallow creating subgoals with empty title.
// TODO: Enforce maximum number of subgoals.
// TODO: Transfer parent count to subgoal when the first one is added.
// TODO: Disallow creating goals or subgoals with negative count.
// TODO: Keyboard support for adding subgoals with Enter.

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

  // Calculate total from subgoals if they exist
  const displayCount = hasSubgoals
    ? editedGoal.subgoals.reduce((sum, subgoal) => sum + subgoal.count, 0)
    : editedGoal?.count || 0;

  useEffect(() => {
    setEditedGoal(goal);
  }, [goal]);

  const handleAddSubgoal = () => {
    setEditedGoal({
      ...editedGoal,
      subgoals: [
        ...(editedGoal.subgoals || []),
        {
          id: crypto.randomUUID(),
          title: '',
          count: 0,
        },
      ],
    });
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
    onSave(editedGoal);
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
                  count: parseInt(e.target.value) || 0,
                })
              }
              disabled={hasSubgoals || isLoading.save || isLoading.delete}
              onKeyUp={e => e.key === 'Enter' && handleSave()}
            />

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">Subgoals</Typography>
              <IconButton
                size="small"
                onClick={handleAddSubgoal}
                disabled={isLoading.save || isLoading.delete}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {editedGoal.subgoals?.map(subgoal => (
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
                  sx={{ flex: 1 }}
                  disabled={isLoading.save || isLoading.delete}
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
                  onChange={e =>
                    handleUpdateSubgoal(subgoal.id, {
                      count: parseInt(e.target.value) || 0,
                    })
                  }
                  sx={{ width: '100px' }}
                  disabled={isLoading.save || isLoading.delete}
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
          disabled={isLoading.delete || isLoading.save}
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
