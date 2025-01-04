import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import FirestoreGoalsService from './FirestoreGoalsService';

// Mock Firebase modules
vi.mock('../../firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('firebase/firestore');
vi.mock('../../utils/dateUtils', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));

describe('FirestoreGoalsService', () => {
  let service;
  let mockAuth;
  const weekId = '2024-03-25';
  const testGoal = { id: 'test-id-123', title: 'Test Goal', count: 0 };
  const firestoreError = new Error('Firestore operation failed');

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked module and set up auth state
    const firebase = await import('../../firebase');
    mockAuth = firebase.auth;
    mockAuth.currentUser = { uid: 'test-user-id' };

    service = new FirestoreGoalsService();
  });

  describe('getWeeklyGoals', () => {
    it('returns empty array when week document does not exist', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });

      const goals = await service.getWeeklyGoals(weekId);

      expect(goals).toEqual([]);
      expect(getDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId)
      );
    });

    it('returns goals array when week exists', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });

      const goals = await service.getWeeklyGoals(weekId);

      expect(goals).toEqual([testGoal]);
    });

    it('throws error when user is not authenticated', async () => {
      mockAuth.currentUser = null;

      await expect(service.getWeeklyGoals(weekId)).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('propagates Firestore errors', async () => {
      getDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.getWeeklyGoals(weekId)).rejects.toThrow(
        firestoreError
      );
    });
  });

  describe('addGoal', () => {
    const newGoal = { title: 'New Goal', count: 0 };

    it('creates new week document when it does not exist', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });

      const goalId = await service.addGoal(weekId, newGoal);

      expect(goalId).toBe('test-id-123');
      expect(setDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId),
        { goals: [{ id: 'test-id-123', ...newGoal }] }
      );
    });

    it('adds goal to existing week', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });

      await service.addGoal(weekId, newGoal);

      expect(updateDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId),
        { goals: [testGoal, { id: 'test-id-123', ...newGoal }] }
      );
    });

    it('propagates error when getDoc fails', async () => {
      getDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.addGoal(weekId, newGoal)).rejects.toThrow(
        firestoreError
      );
    });

    it('propagates error when setDoc fails', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });
      setDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.addGoal(weekId, newGoal)).rejects.toThrow(
        firestoreError
      );
    });

    it('propagates error when updateDoc fails', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });
      updateDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.addGoal(weekId, newGoal)).rejects.toThrow(
        firestoreError
      );
    });
  });

  describe('updateGoal', () => {
    it('updates existing goal', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });

      const updatedGoal = { ...testGoal, count: 1 };
      await service.updateGoal(weekId, updatedGoal);

      expect(updateDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId),
        { goals: [updatedGoal] }
      );
    });

    it('throws error when goal does not exist', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [] }),
      });

      await expect(service.updateGoal(weekId, testGoal)).rejects.toThrow(
        `Goal with id ${testGoal.id} not found`
      );
    });

    it('throws error when week does not exist', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });

      await expect(service.updateGoal(weekId, testGoal)).rejects.toThrow(
        'Week not found'
      );
    });

    it('propagates error when getDoc fails', async () => {
      getDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.updateGoal(weekId, testGoal)).rejects.toThrow(
        firestoreError
      );
    });

    it('propagates error when updateDoc fails', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });
      updateDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.updateGoal(weekId, testGoal)).rejects.toThrow(
        firestoreError
      );
    });
  });

  describe('deleteGoal', () => {
    it('deletes goal and keeps week when other goals exist', async () => {
      const otherGoal = { id: 'other-id', title: 'Other Goal', count: 0 };
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal, otherGoal] }),
      });

      await service.deleteGoal(weekId, testGoal.id);

      expect(updateDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId),
        { goals: [otherGoal] }
      );
    });

    it('deletes week document when deleting last goal', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });

      await service.deleteGoal(weekId, testGoal.id);

      expect(deleteDoc).toHaveBeenCalledWith(
        doc({}, 'users', 'test-user-id', 'weeks', weekId)
      );
    });

    it('throws error when goal does not exist', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [] }),
      });

      await expect(service.deleteGoal(weekId, testGoal.id)).rejects.toThrow(
        `Goal with id ${testGoal.id} not found`
      );
    });

    it('propagates error when getDoc fails', async () => {
      getDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.deleteGoal(weekId, testGoal.id)).rejects.toThrow(
        firestoreError
      );
    });

    it('propagates error when deleteDoc fails', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal] }),
      });
      deleteDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.deleteGoal(weekId, testGoal.id)).rejects.toThrow(
        firestoreError
      );
    });

    it('propagates error when updateDoc fails', async () => {
      const otherGoal = { id: 'other-id', title: 'Other Goal', count: 0 };
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ goals: [testGoal, otherGoal] }),
      });
      updateDoc.mockRejectedValueOnce(firestoreError);

      await expect(service.deleteGoal(weekId, testGoal.id)).rejects.toThrow(
        firestoreError
      );
    });
  });

  describe('getAvailableWeeks', () => {
    it('returns sorted week IDs', async () => {
      getDocs.mockResolvedValueOnce({
        docs: [{ id: '2024-03-25' }, { id: '2024-03-18' }],
      });

      const weeks = await service.getAvailableWeeks();

      expect(weeks).toEqual(['2024-03-25', '2024-03-18']);
    });

    it('propagates Firestore errors', async () => {
      getDocs.mockRejectedValueOnce(firestoreError);

      await expect(service.getAvailableWeeks()).rejects.toThrow(firestoreError);
    });
  });
});
