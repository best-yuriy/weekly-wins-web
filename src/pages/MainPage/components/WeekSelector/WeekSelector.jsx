import PropTypes from 'prop-types';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const WeekSelector = ({ selectedWeek, availableWeeks, onWeekChange }) => {
  return (
    <Select
      value={selectedWeek}
      onChange={e => onWeekChange(e.target.value)}
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
  );
};

WeekSelector.propTypes = {
  selectedWeek: PropTypes.string.isRequired,
  availableWeeks: PropTypes.arrayOf(PropTypes.string).isRequired,
  onWeekChange: PropTypes.func.isRequired,
};

export default WeekSelector;
