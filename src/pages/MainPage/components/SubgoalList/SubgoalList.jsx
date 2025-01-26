import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { PlusOne } from '@mui/icons-material';
import TallyMarks from '../TallyMarks/TallyMarks';

const SubgoalList = ({ subgoals, onChange }) => {
  if (!subgoals?.length) return null;

  const handleIncrement = (subgoalId, e) => {
    e.stopPropagation();
    const updatedSubgoals = subgoals.map(subgoal =>
      subgoal.id === subgoalId
        ? { ...subgoal, count: subgoal.count + 1 }
        : subgoal
    );
    onChange(updatedSubgoals);
  };

  return (
    <Box sx={{ mt: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
      {subgoals.map(subgoal => (
        <Box
          key={subgoal.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ flex: '0 1 auto' }}>
            {subgoal.title}
          </Typography>
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              mr: 1,
            }}
          >
            <TallyMarks count={subgoal.count} />
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={e => handleIncrement(subgoal.id, e)}
            sx={{
              minWidth: '32px',
              width: '32px',
              height: '32px',
              p: 0,
              borderRadius: '50%',
              flex: '0 0 auto',
            }}
          >
            <PlusOne fontSize="small" />
          </Button>
        </Box>
      ))}
    </Box>
  );
};

SubgoalList.propTypes = {
  subgoals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
};

export default SubgoalList;
