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

  it('calculates totals from subgoals when they exist', () => {
    const service = new GoalsAnalyticsService();
    const mockDataWithSubgoals = [
      {
        id: '2024-01-01',
        goals: [
          {
            id: '1',
            title: 'Exercise',
            count: 0, // Should be ignored since subgoals exist
            subgoals: [
              { id: 'sub1', title: 'Running', count: 2 },
              { id: 'sub2', title: 'Weights', count: 3 },
            ],
          },
          {
            id: '2',
            title: 'Reading',
            count: 5, // No subgoals, should use this count
          },
        ],
      },
      {
        id: '2024-01-08',
        goals: [
          {
            id: '3',
            title: 'Exercise',
            count: 10, // Should be ignored since subgoals exist
            subgoals: [
              { id: 'sub3', title: 'Running', count: 1 },
              { id: 'sub4', title: 'Weights', count: 2 },
            ],
          },
          {
            id: '4',
            title: 'Reading',
            count: 0,
          },
        ],
      },
    ];

    const stats = service.processGoalStats(mockDataWithSubgoals);

    expect(stats.goalStats).toEqual([
      {
        name: 'Exercise',
        totalCount: 8, // Sum of all subgoal counts (2+3+1+2)
        weeklyAverage: '4.0',
        bestWeek: 5, // First week had more (2+3)
        consistency: '100%',
      },
      {
        name: 'Reading',
        totalCount: 5,
        weeklyAverage: '2.5',
        bestWeek: 5,
        consistency: '50%',
      },
    ]);

    expect(stats.weeklyTrends).toEqual([
      {
        week: '2024-01-01',
        goals: {
          Exercise: 5, // 2 + 3
          Reading: 5,
        },
      },
      {
        week: '2024-01-08',
        goals: {
          Exercise: 3, // 1 + 2
          Reading: 0,
        },
      },
    ]);

    // Verify summary stats are calculated correctly with subgoals
    expect(stats.summary.totalActions).toBe(13); // 8 from Exercise + 5 from Reading
    expect(stats.summary.currentWeekStats.totalActions).toBe(3); // Last week: 3 from Exercise + 0 from Reading
  });

  it('handles mixed goals with and without subgoals', () => {
    const service = new GoalsAnalyticsService();
    const mockMixedData = [
      {
        id: '2024-01-01',
        goals: [
          {
            id: '1',
            title: 'Exercise',
            count: 0,
            subgoals: [{ id: 'sub1', title: 'Running', count: 2 }],
          },
          {
            id: '2',
            title: 'Reading',
            count: 3, // Regular goal without subgoals
          },
        ],
      },
    ];

    const stats = service.processGoalStats(mockMixedData);

    expect(stats.goalStats).toEqual([
      {
        name: 'Exercise',
        totalCount: 2, // From subgoal
        weeklyAverage: '2.0',
        bestWeek: 2,
        consistency: '100%',
      },
      {
        name: 'Reading',
        totalCount: 3, // Direct count
        weeklyAverage: '3.0',
        bestWeek: 3,
        consistency: '100%',
      },
    ]);
  });
});
