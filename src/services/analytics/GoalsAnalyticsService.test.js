import { describe, it, expect } from 'vitest';
import GoalsAnalyticsService from './GoalsAnalyticsService';

const mockHistoricalData = [
  {
    id: '2024-01-01',
    goals: [
      { id: '1', title: 'Exercise', count: 3 },
      { id: '2', title: 'Reading', count: 5 },
    ],
  },
  {
    id: '2024-01-08',
    goals: [
      { id: '3', title: 'Exercise', count: 4 },
      { id: '4', title: 'Reading', count: 0 },
    ],
  },
];

describe('GoalsAnalyticsService', () => {
  it('processes goal stats correctly', () => {
    const service = new GoalsAnalyticsService();
    const stats = service.processGoalStats(mockHistoricalData);

    expect(stats).toEqual({
      goalStats: [
        {
          name: 'Exercise',
          totalCount: 7,
          weeklyAverage: '3.5',
          bestWeek: 4,
          consistency: '100%',
        },
        {
          name: 'Reading',
          totalCount: 5,
          weeklyAverage: '2.5',
          bestWeek: 5,
          consistency: '50%',
        },
      ],
      weeklyTrends: [
        {
          week: '2024-01-01',
          goals: {
            Exercise: 3,
            Reading: 5,
          },
        },
        {
          week: '2024-01-08',
          goals: {
            Exercise: 4,
            Reading: 0,
          },
        },
      ],
      summary: {
        mostConsistentGoal: {
          name: 'Exercise',
          totalCount: 7,
          weeklyAverage: '3.5',
          bestWeek: 4,
          consistency: '100%',
        },
        totalActions: 12,
        currentWeekStats: {
          totalActions: 4,
          percentFromAverage: -33,
        },
      },
    });
  });

  it('handles empty data', () => {
    const service = new GoalsAnalyticsService();
    const stats = service.processGoalStats([]);

    expect(stats).toEqual({
      goalStats: [],
      weeklyTrends: [],
      summary: {
        mostConsistentGoal: {
          name: '',
          consistency: '0%',
        },
        totalActions: 0,
        currentWeekStats: {
          totalActions: 0,
          percentFromAverage: 0,
        },
      },
    });
  });

  it('handles weeks with no goals', () => {
    const service = new GoalsAnalyticsService();
    const stats = service.processGoalStats([
      {
        id: '2024-01-01',
        goals: [],
      },
    ]);

    expect(stats).toEqual({
      goalStats: [],
      weeklyTrends: [
        {
          week: '2024-01-01',
          goals: {},
        },
      ],
      summary: {
        mostConsistentGoal: {
          name: '',
          consistency: '0%',
        },
        totalActions: 0,
        currentWeekStats: {
          totalActions: 0,
          percentFromAverage: 0,
        },
      },
    });
  });

  it('calculates consistency correctly with partial weeks', () => {
    const service = new GoalsAnalyticsService();
    const stats = service.processGoalStats([
      {
        id: '2024-01-01',
        goals: [{ id: '1', title: 'Exercise', count: 3 }],
      },
      {
        id: '2024-01-08',
        goals: [{ id: '2', title: 'Exercise', count: 0 }],
      },
    ]);

    expect(stats.goalStats[0].consistency).toBe('50%');
  });

  it('handles goals that are not present in every week', () => {
    const service = new GoalsAnalyticsService();
    const stats = service.processGoalStats([
      {
        id: '2024-01-01',
        goals: [
          { id: '1', title: 'Exercise', count: 3 },
          { id: '2', title: 'Reading', count: 5 },
        ],
      },
      {
        id: '2024-01-08',
        goals: [
          { id: '3', title: 'Exercise', count: 4 },
          { id: '4', title: 'Meditation', count: 2 },
        ],
      },
      {
        id: '2024-01-15',
        goals: [
          { id: '5', title: 'Meditation', count: 3 },
          { id: '6', title: 'Exercise', count: 2 },
        ],
      },
    ]);

    expect(stats.goalStats).toEqual([
      {
        name: 'Exercise',
        totalCount: 9,
        weeklyAverage: '3.0',
        bestWeek: 4,
        consistency: '100%',
      },
      {
        name: 'Reading',
        totalCount: 5,
        weeklyAverage: '1.7',
        bestWeek: 5,
        consistency: '33%',
      },
      {
        name: 'Meditation',
        totalCount: 5,
        weeklyAverage: '1.7',
        bestWeek: 3,
        consistency: '67%',
      },
    ]);

    expect(stats.weeklyTrends).toEqual([
      {
        week: '2024-01-01',
        goals: {
          Exercise: 3,
          Reading: 5,
        },
      },
      {
        week: '2024-01-08',
        goals: {
          Exercise: 4,
          Reading: undefined,
          Meditation: 2,
        },
      },
      {
        week: '2024-01-15',
        goals: {
          Exercise: 2,
          Reading: undefined,
          Meditation: 3,
        },
      },
    ]);
  });
});
