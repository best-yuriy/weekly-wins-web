import GoalsService from './GoalsService';
import { generateId } from '../../utils/dateUtils';

class InMemoryGoalsService extends GoalsService {
  constructor(initialData = {}) {
    super();
    this.weeks = initialData;
  }

  async getWeeklyGoals(weekId) {
    return this.weeks[weekId]?.goals || [];
  }

  async addGoal(weekId, goal) {
    const newGoal = {
      id: generateId(),
      ...goal,
    };

    this.weeks[weekId] = this.weeks[weekId] || { goals: [] };
    this.weeks[weekId].goals.push(newGoal);

    return newGoal.id;
  }

  async updateGoal(weekId, goal) {
    if (!this.weeks[weekId]) {
      throw new Error('Week not found');
    }

    const goals = this.weeks[weekId].goals;
    const index = goals.findIndex(g => g.id === goal.id);

    if (index === -1) {
      throw new Error(`Goal with id ${goal.id} not found`);
    }

    goals[index] = goal;
  }

  async deleteGoal(weekId, goalId) {
    if (!this.weeks[weekId]) {
      throw new Error('Week not found');
    }

    const goals = this.weeks[weekId].goals;
    const index = goals.findIndex(g => g.id === goalId);

    if (index === -1) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    goals.splice(index, 1);

    if (goals.length === 0) {
      delete this.weeks[weekId];
    }
  }

  async getAvailableWeeks() {
    return Object.keys(this.weeks).sort().reverse();
  }
}

export default InMemoryGoalsService;
