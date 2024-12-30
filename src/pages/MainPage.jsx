import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

const MainPage = () => {
  const [goals, setGoals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      setGoals([...goals, { id: Date.now(), title: newGoalTitle, count: 0 }]);
      setNewGoalTitle('');
    }
  };

  const handleIncrement = goalId => {
    if (!isEditing) {
      setGoals(
        goals.map(goal =>
          goal.id === goalId ? { ...goal, count: goal.count + 1 } : goal
        )
      );
    }
  };

  const handleEditClick = goal => {
    if (isEditing) {
      setEditingGoal(goal);
    }
  };

  const handleUpdateGoal = updatedGoal => {
    setGoals(
      goals.map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
    setEditingGoal(null);
    setIsEditing(false);
  };

  const handleDeleteGoal = goalId => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    setEditingGoal(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Weekly Goals
        </Typography>
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

      <Grid container spacing={2} columns={{ xs: 2, sm: 3, md: 4 }}>
        {goals.map(goal => (
          <Grid key={goal.id} size={1}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': isEditing ? { bgcolor: 'action.hover' } : {},
              }}
              onClick={() => handleEditClick(goal)}
            >
              <CardContent>
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
              </CardContent>
            </Card>
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

export default MainPage;
