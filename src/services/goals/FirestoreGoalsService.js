import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import GoalsService from './GoalsService';
import { generateId } from '../../utils/dateUtils';

class FirestoreGoalsService extends GoalsService {
  /**
   * @param {string} weekId
   * @returns {Promise<Goal[]>}
   */
  async getWeeklyGoals(weekId) {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weekRef = doc(db, 'users', auth.currentUser.uid, 'weeks', weekId);
    const weekDoc = await getDoc(weekRef);

    if (!weekDoc.exists()) {
      return [];
    }

    return weekDoc.data().goals || [];
  }

  /**
   * @param {string} weekId
   * @param {NewGoal} goal
   * @returns {Promise<string>} The ID of the created goal
   */
  async addGoal(weekId, goal) {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weekRef = doc(db, 'users', auth.currentUser.uid, 'weeks', weekId);
    const weekDoc = await getDoc(weekRef);
    const newGoal = {
      id: generateId(),
      ...goal,
    };

    if (!weekDoc.exists()) {
      // Create new week document with the goal
      await setDoc(weekRef, { goals: [newGoal] });
    } else {
      // Add goal to existing week
      const goals = weekDoc.data().goals || [];
      await updateDoc(weekRef, {
        goals: [...goals, newGoal],
      });
    }

    return newGoal.id;
  }

  /**
   * @param {string} weekId
   * @param {Goal} goal
   * @returns {Promise<void>}
   * @throws {Error} If user is not authenticated, week not found, or goal not found
   */
  async updateGoal(weekId, goal) {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weekRef = doc(db, 'users', auth.currentUser.uid, 'weeks', weekId);
    const weekDoc = await getDoc(weekRef);

    if (!weekDoc.exists()) {
      throw new Error('Week not found');
    }

    const goals = weekDoc.data().goals || [];
    const existingGoal = goals.find(g => g.id === goal.id);

    if (!existingGoal) {
      throw new Error(`Goal with id ${goal.id} not found`);
    }

    const updatedGoals = goals.map(g => (g.id === goal.id ? goal : g));
    await updateDoc(weekRef, { goals: updatedGoals });
  }

  /**
   * @param {string} weekId
   * @param {string} goalId
   * @returns {Promise<void>}
   * @throws {Error} If user is not authenticated, week not found, or goal not found
   */
  async deleteGoal(weekId, goalId) {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weekRef = doc(db, 'users', auth.currentUser.uid, 'weeks', weekId);
    const weekDoc = await getDoc(weekRef);

    if (!weekDoc.exists()) {
      throw new Error('Week not found');
    }

    const goals = weekDoc.data().goals || [];
    const existingGoal = goals.find(g => g.id === goalId);

    if (!existingGoal) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    const updatedGoals = goals.filter(g => g.id !== goalId);

    if (updatedGoals.length === 0) {
      // If no goals left, delete the week document
      await deleteDoc(weekRef);
    } else {
      await updateDoc(weekRef, { goals: updatedGoals });
    }
  }

  /**
   * @returns {Promise<string[]>}
   */
  async getAvailableWeeks() {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weeksRef = collection(db, 'users', auth.currentUser.uid, 'weeks');
    const snapshot = await getDocs(weeksRef);

    return snapshot.docs
      .map(doc => doc.id)
      .sort()
      .reverse();
  }

  /**
   * @returns {Promise<Array<{id: string, goals: Goal[]}>>}
   */
  async getAllHistoricalGoals() {
    if (!auth.currentUser?.uid) throw new Error('User not authenticated');

    const weeksRef = collection(db, 'users', auth.currentUser.uid, 'weeks');
    const snapshot = await getDocs(weeksRef);

    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        goals: doc.data().goals || [],
      }))
      .sort();
  }
}

export default FirestoreGoalsService;
