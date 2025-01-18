import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { PlusOne } from '@mui/icons-material';
import TallyMarks from '../TallyMarks/TallyMarks';

const GoalCard = ({ goal, isEditing, onIncrement, onEdit, isLoading }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        cursor: 'pointer',
        p: 2,
        display: 'flex',
        '&:hover': isEditing ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={() => onEdit(goal)}
      data-testid="goal-card"
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">{goal.title}</Typography>
        <TallyMarks count={goal.count} />
      </Box>
      {!isEditing && (
        <Box
          sx={{
            width: '5rem',
            minWidth: '5rem',
            ml: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
        </Box>
      )}
    </Paper>
  );
};

GoalCard.propTypes = {
  goal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default GoalCard;
