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

const EditGoalDialog = ({
  goal,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading = { save: false, delete: false },
}) => {
  const [editedGoal, setEditedGoal] = useState(goal);

  // Update local state when goal prop changes
  useEffect(() => {
    setEditedGoal(goal);
  }, [goal]);

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
            />
            <TextField
              fullWidth
              type="number"
              label="Count"
              value={editedGoal.count}
              onChange={e =>
                setEditedGoal({
                  ...editedGoal,
                  count: parseInt(e.target.value) || 0,
                })
              }
              onKeyUp={e => e.key === 'Enter' && handleSave()}
            />
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
