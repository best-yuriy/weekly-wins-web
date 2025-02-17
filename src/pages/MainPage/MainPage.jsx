import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import { Edit, Check } from '@mui/icons-material';
import { getCurrentWeekKey } from '../../utils/dateUtils';
import PropTypes from 'prop-types';
import FirestoreGoalsService from '../../services/goals/FirestoreGoalsService';
import CircularProgress from '@mui/material/CircularProgress';
import GoalCard from './components/GoalCard/GoalCard';
import EditGoalDialog from './components/EditGoalDialog/EditGoalDialog';
import WeekSelector from './components/WeekSelector/WeekSelector';
import GoalInput from './components/GoalInput/GoalInput';

// TODO: Esc to exit edit mode if dialog is already closed.

// Create default instance
const defaultService = new FirestoreGoalsService();

const MainPage = ({
  goalsService = defaultService, // Add service as a prop with default
}) => {
  const [weeklyGoals, setWeeklyGoals] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [availableWeeks, setAvailableWeeks] = useState([selectedWeek]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Load available weeks
  useEffect(() => {
    const loadWeeks = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };
    loadWeeks();
  }, [goalsService]);

  // Load goals for selected week
  useEffect(() => {
    const loadGoals = async () => {
      setIsLoadingInitial(true);
      setIsLoading(true);
      try {
        const goals = await goalsService.getWeeklyGoals(selectedWeek);
        setWeeklyGoals(prev => ({
          ...prev,
          [selectedWeek]: goals,
        }));
      } catch (error) {
        console.error('Failed to load goals:', error);
      } finally {
        setIsLoadingInitial(false);
        setIsLoading(false);
      }
    };
    loadGoals();
  }, [goalsService, selectedWeek]);

  // Add effect to load historical goals for suggestions
  useEffect(() => {
    const loadHistoricalGoals = async () => {
      try {
        const historicalData = await goalsService.getAllHistoricalGoals();
        const allGoals = historicalData.flatMap(week => week.goals);
        const currentGoals = new Set(
          (weeklyGoals[selectedWeek] || []).map(g => g.title)
        );

        // Create unique set of suggestions, excluding current week's goals
        const uniqueSuggestions = new Set(
          allGoals.map(g => g.title).filter(title => !currentGoals.has(title))
        );

        setSuggestions(Array.from(uniqueSuggestions));
      } catch (error) {
        console.error('Failed to load historical goals:', error);
      }
    };
    loadHistoricalGoals();
  }, [goalsService, weeklyGoals, selectedWeek]);

  const handleAddGoal = async title => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await goalsService.addGoal(selectedWeek, {
        title,
        count: 0,
      });
      const goals = await goalsService.getWeeklyGoals(selectedWeek);
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: goals,
      }));
    } catch (error) {
      console.error('Failed to add goal:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoal = async updatedGoal => {
    if (isLoading) return;
    setIsLoading(true);
    // Close dialog immediately
    if (editingGoal) {
      setEditingGoal(null);
      setIsEditing(false);
    }
    try {
      await goalsService.updateGoal(selectedWeek, updatedGoal);
      const goals = await goalsService.getWeeklyGoals(selectedWeek);
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: goals,
      }));
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = goal => {
    if (isEditing) {
      setEditingGoal(goal);
    }
  };

  const handleDeleteGoal = async goalId => {
    if (isLoading) return;
    setIsLoading(true);
    // Close dialog immediately
    setEditingGoal(null);
    setIsEditing(false);
    try {
      await goalsService.deleteGoal(selectedWeek, goalId);
      const goals = await goalsService.getWeeklyGoals(selectedWeek);
      setWeeklyGoals(prev => ({
        ...prev,
        [selectedWeek]: goals,
      }));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Weekly Goals
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <WeekSelector
          selectedWeek={selectedWeek}
          availableWeeks={availableWeeks}
          onWeekChange={setSelectedWeek}
        />
        <Button
          variant={isEditing ? 'contained' : 'outlined'}
          startIcon={isEditing ? <Check /> : <Edit />}
          onClick={() => setIsEditing(!isEditing)}
          sx={{ width: '6rem' }}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </Box>

      <GoalInput
        onAddGoal={handleAddGoal}
        isLoading={isLoading}
        suggestions={suggestions}
      />

      {isLoadingInitial ? (
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
                onEdit={handleEditClick}
                onUpdate={handleUpdateGoal}
                isLoading={isLoading}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <EditGoalDialog
        goal={editingGoal}
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
      />
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
