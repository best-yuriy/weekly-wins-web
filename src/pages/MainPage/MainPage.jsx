import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { Add, Edit, Check } from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getCurrentWeekKey } from '../../utils/dateUtils';
import PropTypes from 'prop-types';
import FirestoreGoalsService from '../../services/goals/FirestoreGoalsService';
import CircularProgress from '@mui/material/CircularProgress';
import GoalCard from './components/GoalCard/GoalCard';

// Create default instance
const defaultService = new FirestoreGoalsService();

const MainPage = ({
  goalsService = defaultService, // Add service as a prop with default
}) => {
  const [weeklyGoals, setWeeklyGoals] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [availableWeeks, setAvailableWeeks] = useState([selectedWeek]);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [isLoading, setIsLoading] = useState({
    weeks: false,
    goals: false,
    addGoal: false,
    updateGoal: false,
    incrementGoal: false,
    deleteGoal: false,
  });

  // Load available weeks
  useEffect(() => {
    const loadWeeks = async () => {
      setIsLoading(prev => ({ ...prev, weeks: true }));
      try {
        const weeks = await goalsService.getAvailableWeeks();
        const currentWeek = getCurrentWeekKey();
        if (!weeks.includes(currentWeek)) {
          weeks.unshift(currentWeek);
        }
        setAvailableWeeks(weeks);
      } catch (error) {
        console.error('Failed to load weeks:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, weeks: false }));
      }
    };
    loadWeeks();
  }, [goalsService]);

  // Load goals for selected week
  useEffect(() => {
    const loadGoals = async () => {
      setIsLoading(prev => ({ ...prev, goals: true }));
      try {
        const goals = await goalsService.getWeeklyGoals(selectedWeek);
        setWeeklyGoals(prev => ({
          ...prev,
          [selectedWeek]: goals,
        }));
      } catch (error) {
        console.error('Failed to load goals:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, goals: false }));
      }
    };
    loadGoals();
  }, [goalsService, selectedWeek]);

  const handleAddGoal = async () => {
    if (newGoalTitle.trim()) {
      setIsLoading(prev => ({ ...prev, addGoal: true }));
      try {
        await goalsService.addGoal(selectedWeek, {
          title: newGoalTitle,
          count: 0,
        });

        const goals = await goalsService.getWeeklyGoals(selectedWeek);
        setWeeklyGoals(prev => ({
          ...prev,
          [selectedWeek]: goals,
        }));
        setNewGoalTitle('');
      } catch (error) {
        console.error('Failed to add goal:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, addGoal: false }));
      }
    }
  };

  const handleIncrement = async goalId => {
    if (!isEditing) {
      setIsLoading(prev => ({ ...prev, incrementGoal: true }));
      try {
        const goal = weeklyGoals[selectedWeek].find(g => g.id === goalId);
        await goalsService.updateGoal(selectedWeek, {
          ...goal,
          count: goal.count + 1,
        });

        const goals = await goalsService.getWeeklyGoals(selectedWeek);
        setWeeklyGoals(prev => ({
          ...prev,
          [selectedWeek]: goals,
        }));
      } catch (error) {
        console.error('Failed to increment goal:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, incrementGoal: false }));
      }
    }
  };

  const handleEditClick = goal => {
    if (isEditing) {
      setEditingGoal(goal);
    }
  };

  const handleUpdateGoal = async updatedGoal => {
    setIsLoading(prev => ({ ...prev, updateGoal: true }));
    try {
      await goalsService.updateGoal(selectedWeek, updatedGoal);
      const goals = await goalsService.getWeeklyGoals(selectedWeek);
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: goals,
      }));
      setEditingGoal(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, updateGoal: false }));
    }
  };

  const handleDeleteGoal = async goalId => {
    setIsLoading(prev => ({ ...prev, deleteGoal: true }));
    try {
      await goalsService.deleteGoal(selectedWeek, goalId);
      const goals = await goalsService.getWeeklyGoals(selectedWeek);
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: goals,
      }));
      setEditingGoal(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, deleteGoal: false }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Weekly Goals
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
          size="small"
          sx={{ width: '100%' }}
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
        <Button
          variant={isEditing ? 'contained' : 'outlined'}
          startIcon={isEditing ? <Check /> : <Edit />}
          onClick={() => setIsEditing(!isEditing)}
          sx={{ width: '6rem' }}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Enter new goal"
          value={newGoalTitle}
          onChange={e => setNewGoalTitle(e.target.value)}
          onKeyUp={e => e.key === 'Enter' && handleAddGoal()}
          disabled={isLoading.addGoal}
          size="small"
          sx={{ width: '100%' }}
        />
        <Button
          variant="contained"
          startIcon={
            isLoading.addGoal ? <CircularProgress size={20} /> : <Add />
          }
          onClick={handleAddGoal}
          disabled={isLoading.addGoal}
          sx={{ width: '6rem' }}
        >
          Add
        </Button>
      </Box>

      {isLoading.goals ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} columns={{ xs: 1, sm: 2 }}>
          {(weeklyGoals[selectedWeek] || []).map(goal => (
            <Grid key={goal.id} size={1}>
              <GoalCard
                goal={goal}
                isEditing={isEditing}
                onIncrement={handleIncrement}
                onEdit={handleEditClick}
                isLoading={isLoading.incrementGoal}
              />
            </Grid>
          ))}
        </Grid>
      )}

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
            disabled={isLoading.deleteGoal || isLoading.updateGoal}
            startIcon={
              isLoading.deleteGoal ? <CircularProgress size={20} /> : null
            }
          >
            Delete
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpdateGoal(editingGoal)}
            disabled={isLoading.deleteGoal || isLoading.updateGoal}
            startIcon={
              isLoading.updateGoal ? <CircularProgress size={20} /> : null
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

MainPage.propTypes = {
  goalsService: PropTypes.shape({
    getWeeklyGoals: PropTypes.func.isRequired,
    addGoal: PropTypes.func.isRequired,
    updateGoal: PropTypes.func.isRequired,
    deleteGoal: PropTypes.func.isRequired,
    getAvailableWeeks: PropTypes.func.isRequired,
  }),
};

export default MainPage;
