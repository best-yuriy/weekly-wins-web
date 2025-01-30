import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import {
  TbTallymark1,
  TbTallymark2,
  TbTallymark3,
  TbTallymark4,
  TbTallymarks,
} from 'react-icons/tb';

const TallyMarks = ({ count }) => {
  // If count is greater than 15, just show the number
  if (count === 0 || count > 15) {
    return <Typography variant="h4">{count}</Typography>;
  }

  const getTallyGroups = () => {
    const groups = [];
    const fullGroups = Math.floor(count / 5);
    const remainder = count % 5;

    // Add full groups (5 marks)
    for (let i = 0; i < fullGroups; i++) {
      groups.push(
        <TbTallymarks
          key={`group-${i}`}
          data-testid="tally-mark"
          style={{ fontSize: '2.5rem', height: '42px', width: '42px' }}
        />
      );
    }

    // Add remaining marks based on count
    if (remainder > 0) {
      const RemainderIcon = {
        1: TbTallymark1,
        2: TbTallymark2,
        3: TbTallymark3,
        4: TbTallymark4,
      }[remainder];

      groups.push(
        <RemainderIcon
          key="remainder"
          data-testid="tally-mark"
          style={{ fontSize: '2.5rem', height: '42px', width: '42px' }}
        />
      );
    }

    return groups;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          minWidth: 0,
        }}
      >
        {getTallyGroups()}
      </Box>
    </Box>
  );
};

TallyMarks.propTypes = {
  count: PropTypes.number.isRequired,
};

export default TallyMarks;
