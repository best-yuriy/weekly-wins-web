/**
 * Service for calculating analytics and statistics from raw goals data
 */
class GoalsAnalyticsService {
  /**
   * @param {Array<{id: string, goals: Goal[]}>} weeklyGoals - Array of week documents with their goals
   * @returns {Object} Processed statistics for all goals
   */
  processGoalStats(weeklyGoals) {
    // First, get all unique goal titles
    const goalTitles = new Set();
    weeklyGoals.forEach(week => {
      week.goals.forEach(goal => goalTitles.add(goal.title));
    });

    // Calculate stats for each goal
    const goalStats = Array.from(goalTitles).map(title => ({
      name: title,
      ...this.calculateGoalStats(title, weeklyGoals),
    }));

    const weeklyTrends = this.calculateWeeklyTrends(weeklyGoals);

    return {
      goalStats,
      weeklyTrends,
      summary: this.calculateSummaryStats(goalStats, weeklyTrends),
    };
  }

  /**
   * @private
   */
  calculateGoalStats(goalTitle, weeklyGoals) {
    let totalCount = 0;
    let bestWeek = 0;
    let activeWeeks = 0;
    const totalWeeks = weeklyGoals.length;

    weeklyGoals.forEach(week => {
      const goal = week.goals.find(g => g.title === goalTitle);
      if (goal) {
        const count = this.getGoalCount(goal);
        totalCount += count;
        bestWeek = Math.max(bestWeek, count);
        if (count > 0) activeWeeks++;
      }
    });

    return {
      totalCount,
      // TODO: maybe add "active weekly average" which only considers active weeks.
      // Could be useful, so we don't see the average drop over time after the user
      // is no longer working on this goal. Could also consider the range of weeks
      // (first week the user worked on this goal and last week he worked on it).
      weeklyAverage: totalWeeks > 0 ? (totalCount / totalWeeks).toFixed(1) : 0,
      bestWeek,
      consistency:
        totalWeeks > 0
          ? `${((activeWeeks / totalWeeks) * 100).toFixed(0)}%`
          : '0%',
    };
  }

  /**
   * @private
   */
  calculateWeeklyTrends(weeklyGoals) {
    return weeklyGoals.map(week => {
      // Create base object with week ID
      const dataPoint = {
        week: week.id,
        goals: {},
      };

      // Add goals to the goals object
      week.goals.forEach(goal => {
        // TODO: protect against malicious goal titles
        dataPoint.goals[goal.title] = this.getGoalCount(goal);
      });

      return dataPoint;
    });
  }

  /**
   * Gets the effective count for a goal, using subgoals total if they exist
   * @private
   */
  getGoalCount(goal) {
    if (goal.subgoals?.length > 0) {
      return goal.subgoals.reduce((sum, subgoal) => sum + subgoal.count, 0);
    }
    return goal.count;
  }

  /**
   * @private
   */
  calculateSummaryStats(goalStats, weeklyTrends) {
    if (goalStats.length === 0) {
      return {
        mostConsistentGoal: {
          name: '',
          consistency: '0%',
        },
        totalActions: 0,
        currentWeekStats: {
          totalActions: 0,
          percentFromAverage: 0,
        },
      };
    }

    const mostConsistentGoal = goalStats.reduce((prev, current) => {
      const prevPercentage = parseInt(prev.consistency);
      const currentPercentage = parseInt(current.consistency);
      return currentPercentage > prevPercentage ? current : prev;
    });

    const totalActions = goalStats.reduce(
      (sum, goal) => sum + goal.totalCount,
      0
    );

    // Calculate current week's total actions from the goals
    const currentWeekActions = Object.values(
      weeklyTrends[weeklyTrends.length - 1]?.goals || {}
    ).reduce((sum, count) => sum + (count || 0), 0);

    const averageActions = totalActions / weeklyTrends.length;
    const percentFromAverage =
      averageActions > 0
        ? ((currentWeekActions - averageActions) / averageActions) * 100
        : 0;

    return {
      mostConsistentGoal,
      totalActions,
      currentWeekStats: {
        totalActions: currentWeekActions,
        percentFromAverage: Math.round(percentFromAverage),
      },
    };
  }
}

export default GoalsAnalyticsService;
