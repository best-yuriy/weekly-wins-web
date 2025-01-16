/**
 * @typedef {Object} Goal
 * @property {string} id - Unique identifier
 * @property {string} title - Goal title
 * @property {number} count - Current count
 */

/**
 * @typedef {Object} NewGoal
 * @property {string} title - Goal title
 * @property {number} count - Initial count
 */

/**
 * Goals Service Interface
 * @interface
 */
class GoalsService {
  /**
   * Fetches goals for a specific week
   * @param {string} weekId - The week identifier (YYYY-MM-DD)
   * @returns {Promise<Goal[]>}
   * @throws {Error} If user is not authenticated
   */
  // eslint-disable-next-line no-unused-vars
  async getWeeklyGoals(weekId) {
    throw new Error('Not implemented');
  }

  /**
   * Adds a new goal
   * @param {string} weekId - The week identifier (YYYY-MM-DD)
   * @param {NewGoal} goal - The goal to add
   * @returns {Promise<string>} The ID of the created goal
   * @throws {Error} If user is not authenticated
   */
  // eslint-disable-next-line no-unused-vars
  async addGoal(weekId, goal) {
    throw new Error('Not implemented');
  }

  /**
   * Updates an existing goal
   * @param {string} weekId - The week identifier (YYYY-MM-DD)
   * @param {Goal} goal - The updated goal
   * @returns {Promise<void>}
   * @throws {Error} If user is not authenticated or goal not found
   */
  // eslint-disable-next-line no-unused-vars
  async updateGoal(weekId, goal) {
    throw new Error('Not implemented');
  }

  /**
   * Deletes a goal
   * @param {string} weekId - The week identifier (YYYY-MM-DD)
   * @param {string} goalId - The goal identifier
   * @returns {Promise<void>}
   * @throws {Error} If user is not authenticated
   */
  // eslint-disable-next-line no-unused-vars
  async deleteGoal(weekId, goalId) {
    throw new Error('Not implemented');
  }

  /**
   * Gets all available week IDs for the current user
   * @returns {Promise<string[]>} Array of week IDs (YYYY-MM-DD)
   * @throws {Error} If user is not authenticated
   */
  async getAvailableWeeks() {
    throw new Error('Not implemented');
  }

  /**
   * Gets all historical goals across all weeks
   * @returns {Promise<Array<{id: string, goals: Goal[]}>>} Array of week documents with their goals
   * @throws {Error} If user is not authenticated
   */
  async getAllHistoricalGoals() {
    throw new Error('Not implemented');
  }
}

export default GoalsService;
