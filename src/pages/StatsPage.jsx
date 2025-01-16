import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Container,
  Typography,
  Grid2 as Grid,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import PropTypes from 'prop-types';
import GoalsAnalyticsService from '../services/analytics/GoalsAnalyticsService';
import FirestoreGoalsService from '../services/goals/FirestoreGoalsService';

// Create default instances
const analyticsService = new GoalsAnalyticsService();
const defaultService = new FirestoreGoalsService();

const StatsPage = ({ goalsService = defaultService }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const MAX_VISIBLE_GOALS = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const historicalData = await goalsService.getAllHistoricalGoals();
        const processedData = analyticsService.processGoalStats(historicalData);
        setData(processedData);

        // Initialize with top goals
        const topGoals = [...processedData.goalStats]
          .sort((a, b) => b.totalCount - a.totalCount)
          .slice(0, MAX_VISIBLE_GOALS)
          .map(goal => goal.name);
        setSelectedGoals(topGoals);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [goalsService]);

  const handleGoalSelect = event => {
    setSelectedGoals(event.target.value);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          Error loading stats: {error}
        </Typography>
      </Container>
    );
  }

  if (!data || data.goalStats.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">No data available</Typography>
      </Container>
    );
  }

  const formatDate = weekId => {
    return new Date(weekId + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Goal Insights
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} columns={{ xs: 1, sm: 2 }} sx={{ mb: 4 }}>
        <Grid size={1}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Most Consistent Goal"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h5">
                {data.summary.mostConsistentGoal.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.summary.mostConsistentGoal.consistency} weekly completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={1}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="All-Time Records"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h5">
                {data.summary.totalActions} Total Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={1}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Current Week Progress"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h5">
                {data.summary.currentWeekStats.totalActions} Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.summary.currentWeekStats.percentFromAverage}%{' '}
                {data.summary.currentWeekStats.percentFromAverage < 0
                  ? 'below'
                  : 'above'}{' '}
                average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Progress Over Time"
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <Select
                multiple
                value={selectedGoals}
                onChange={handleGoalSelect}
                renderValue={selected => selected.join(', ')}
              >
                {data.goalStats.map(goal => (
                  <MenuItem
                    key={goal.name}
                    value={goal.name}
                    disabled={
                      selectedGoals.length >= MAX_VISIBLE_GOALS &&
                      !selectedGoals.includes(goal.name)
                    }
                  >
                    {goal.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.weeklyTrends.map(week => ({
                week: week.week,
                ...week.goals,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip labelFormatter={formatDate} />
              <Legend />
              {data.goalStats
                .filter(goal => selectedGoals.includes(goal.name))
                .map((goal, index) => (
                  <Line
                    key={goal.name}
                    type="monotone"
                    dataKey={goal.name}
                    stroke={['#fbd734', '#6383fa', '#8efc63'][index]}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Statistics Table - make it scrollable on mobile */}
      <Card>
        <CardHeader
          title="Goal Statistics"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent sx={{ p: { xs: 0, sm: 2 } }}>
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: '100%',
              overflowX: 'auto',
            }}
          >
            <Table aria-label="goal statistics">
              <TableHead>
                <TableRow>
                  <TableCell>Goal</TableCell>
                  <TableCell align="right">Total Count</TableCell>
                  <TableCell align="right">Weekly Average</TableCell>
                  <TableCell align="right">Best Week</TableCell>
                  <TableCell align="right">Consistency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.goalStats.map(goal => (
                  <TableRow key={goal.name}>
                    <TableCell component="th" scope="row">
                      {goal.name}
                    </TableCell>
                    <TableCell align="right">{goal.totalCount}</TableCell>
                    <TableCell align="right">{goal.weeklyAverage}</TableCell>
                    <TableCell align="right">{goal.bestWeek}</TableCell>
                    <TableCell align="right">{goal.consistency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

StatsPage.propTypes = {
  goalsService: PropTypes.shape({
    getAllHistoricalGoals: PropTypes.func.isRequired,
  }),
};

export default StatsPage;
