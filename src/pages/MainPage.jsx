import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { Add, Edit, Check, PlusOne } from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getCurrentWeekKey, generateId } from '../utils/dateUtils';
import PropTypes from 'prop-types';

const MainPage = ({ initialGoals = {} }) => {
  const [weeklyGoals, setWeeklyGoals] = useState(initialGoals);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [isEditing, setIsEditing] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const availableWeeks = Object.keys(weeklyGoals).sort().reverse();
  if (!availableWeeks.includes(selectedWeek)) {
    availableWeeks.unshift(selectedWeek);
  }

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: [
          ...(prev[selectedWeek] || []),
          { id: generateId(), title: newGoalTitle, count: 0 },
        ],
      }));
      setNewGoalTitle('');
    }
  };

  const handleIncrement = goalId => {
    if (!isEditing) {
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: prev[selectedWeek].map(goal =>
          goal.id === goalId ? { ...goal, count: goal.count + 1 } : goal
        ),
      }));
    }
  };

  const handleEditClick = goal => {
    if (isEditing) {
      setEditingGoal(goal);
    }
  };

  const handleUpdateGoal = updatedGoal => {
    setWeeklyGoals(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      ),
    }));
    setEditingGoal(null);
    setIsEditing(false);
  };

  const handleDeleteGoal = goalId => {
    setWeeklyGoals(prev => ({
      ...prev,
      [selectedWeek]: prev[selectedWeek].filter(goal => goal.id !== goalId),
    }));
    setEditingGoal(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Weekly Goals
          </Typography>
          <Select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
            size="small"
          >
            {availableWeeks.map(week => (
              <MenuItem key={week} value={week}>
                {new Date(week + 'T00:00:00').toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Button
          variant={isEditing ? 'contained' : 'outlined'}
          startIcon={isEditing ? <Check /> : <Edit />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Enter new goal"
          value={newGoalTitle}
          onChange={e => setNewGoalTitle(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && handleAddGoal()}
        />
        <Button variant="contained" startIcon={<Add />} onClick={handleAddGoal}>
          Add
        </Button>
      </Box>

      <Grid container spacing={2} columns={{ xs: 1, sm: 2 }}>
        {(weeklyGoals[selectedWeek] || []).map(goal => (
          <Grid key={goal.id} size={1}>
            <Paper
              elevation={1}
              sx={{
                cursor: 'pointer',
                p: 2,
                '&:hover': isEditing ? { bgcolor: 'action.hover' } : {},
              }}
              onClick={() => handleEditClick(goal)}
            >
              <Typography variant="h6">{goal.title}</Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h4">{goal.count}</Typography>
                {!isEditing && (
                  <Button
                    variant="contained"
                    startIcon={<PlusOne />}
                    onClick={e => {
                      e.stopPropagation();
                      handleIncrement(goal.id);
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!editingGoal} onClose={() => setEditingGoal(null)}>
        <DialogTitle>Edit Goal</DialogTitle>
        <DialogContent>
          {editingGoal && (
            <Box
              sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                fullWidth
                label="Goal title"
                value={editingGoal.title}
                onChange={e =>
                  setEditingGoal({ ...editingGoal, title: e.target.value })
                }
                onKeyUp={e =>
                  e.key === 'Enter' && handleUpdateGoal(editingGoal)
                }
              />
              <TextField
                fullWidth
                type="number"
                label="Count"
                value={editingGoal.count}
                onChange={e =>
                  setEditingGoal({
                    ...editingGoal,
                    count: parseInt(e.target.value) || 0,
                  })
                }
                onKeyUp={e =>
                  e.key === 'Enter' && handleUpdateGoal(editingGoal)
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={() => handleDeleteGoal(editingGoal.id)}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpdateGoal(editingGoal)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

MainPage.propTypes = {
  initialGoals: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    )
  ),
};

export default MainPage;
