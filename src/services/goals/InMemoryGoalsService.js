import GoalsService from './GoalsService';
import { generateId } from '../../utils/dateUtils';

class InMemoryGoalsService extends GoalsService {
  constructor(initialData = {}, delay = 0) {
    super();
    this.weeks = initialData;
    this.delay = delay;
    this.barriers = new Map();
  }

  // Helper method to create or get a barrier
  _getBarrier(operation) {
    if (!this.barriers.has(operation)) {
      let resolve;
      const promise = new Promise(r => {
        resolve = r;
      });
      this.barriers.set(operation, { promise, resolve });
    }
    return this.barriers.get(operation);
  }

  // Method for tests to wait on operations
  async waitForOperation(operation) {
    const barrier = this._getBarrier(operation);
    return barrier.promise;
  }

  // Method for tests to complete operations
  resolveOperation(operation) {
    const barrier = this._getBarrier(operation);
    barrier.resolve();
    this.barriers.delete(operation);
  }

  async _delay(operation) {
    if (this.barriers.has(operation)) {
      await this.waitForOperation(operation);
    } else {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
  }

  async getWeeklyGoals(weekId) {
    await this._delay('getWeeklyGoals');
    return this.weeks[weekId]?.goals || [];
  }

  async addGoal(weekId, goal) {
    await this._delay('addGoal');
    const newGoal = {
      id: generateId(),
      ...goal,
    };

    this.weeks[weekId] = this.weeks[weekId] || { goals: [] };
    this.weeks[weekId].goals.push(newGoal);

    return newGoal.id;
  }

  async updateGoal(weekId, goal) {
    await this._delay('updateGoal');
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
    await this._delay('deleteGoal');
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
    await this._delay('getAvailableWeeks');
    return Object.keys(this.weeks).sort().reverse();
  }
}

export default InMemoryGoalsService;
