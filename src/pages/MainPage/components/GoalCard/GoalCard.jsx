import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { PlusOne, ExpandMore, ExpandLess } from '@mui/icons-material';
import TallyMarks from '../TallyMarks/TallyMarks';
import SubgoalList from '../SubgoalList/SubgoalList';
import { useState } from 'react';

const GoalCard = ({
  goal,
  isEditing,
  onIncrement,
  onEdit,
  onUpdate,
  isLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubgoals = goal.subgoals?.length > 0;

  // Calculate total from subgoals if they exist
  const displayCount = hasSubgoals
    ? goal.subgoals.reduce((sum, subgoal) => sum + subgoal.count, 0)
    : goal.count;

  const handleExpandClick = e => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        cursor: 'pointer',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        '&:hover': isEditing ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={() => onEdit(goal)}
      data-testid="goal-card"
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">{goal.title}</Typography>
          <Box sx={{ height: '42px', display: 'flex', alignItems: 'center' }}>
            {!expanded ? <TallyMarks count={displayCount} /> : null}
          </Box>
        </Box>
        {!isEditing && (
          <Box
            sx={{
              ml: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {hasSubgoals ? (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleExpandClick}
                sx={{
                  height: '3.5rem',
                  width: '3.5rem',
                  minWidth: '3.5rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  ml: 'auto',
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={e => {
                  e.stopPropagation();
                  onIncrement(goal.id);
                }}
                disabled={isLoading}
                sx={{
                  height: '3.5rem',
                  width: '3.5rem',
                  minWidth: '3.5rem',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  ml: 'auto',
                }}
              >
                {isLoading ? <CircularProgress size={20} /> : <PlusOne />}
              </Button>
            )}
          </Box>
        )}
      </Box>
      {expanded && hasSubgoals && (
        <SubgoalList
          subgoals={goal.subgoals}
          onChange={updatedSubgoals =>
            onUpdate({ ...goal, subgoals: updatedSubgoals })
          }
        />
      )}
    </Paper>
  );
};

GoalCard.propTypes = {
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
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default GoalCard;
