import { describe, it, beforeEach, afterAll } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules', () => {
  let testEnv;
  const projectId = 'demo-' + Date.now();
  const userId = 'user123';
  const weekId = '2024-03-25';

  beforeEach(async () => {
    const rules = fs.readFileSync(
      path.resolve(process.cwd(), 'firestore.rules'),
      'utf8'
    );

    testEnv = await initializeTestEnvironment({
      projectId,
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('weeks collection', () => {
    it('allows authenticated users to read their own weeks', async () => {
      const authedDb = testEnv.authenticatedContext(userId).firestore();

      await assertSucceeds(
        getDoc(doc(authedDb, 'users', userId, 'weeks', weekId))
      );
    });

    it('allows authenticated users to write to their own weeks', async () => {
      const authedDb = testEnv.authenticatedContext(userId).firestore();

      await assertSucceeds(
        setDoc(doc(authedDb, 'users', userId, 'weeks', weekId), {
          goals: [{ id: '123', title: 'Test Goal', count: 0 }],
        })
      );
    });

    it('allows authenticated users to delete their own weeks', async () => {
      const authedDb = testEnv.authenticatedContext(userId).firestore();

      await assertSucceeds(
        deleteDoc(doc(authedDb, 'users', userId, 'weeks', weekId))
      );
    });

    it('denies unauthenticated access', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();

      await assertFails(
        getDoc(doc(unauthedDb, 'users', userId, 'weeks', weekId))
      );
    });

    it('denies access to other users weeks', async () => {
      const authedDb = testEnv.authenticatedContext('other-user').firestore();

      await assertFails(
        getDoc(doc(authedDb, 'users', userId, 'weeks', weekId))
      );
    });

    it('allows authenticated users to list their own weeks', async () => {
      const authedDb = testEnv.authenticatedContext(userId).firestore();

      await assertSucceeds(
        getDocs(collection(authedDb, 'users', userId, 'weeks'))
      );
    });

    it('denies listing weeks of other users', async () => {
      const authedDb = testEnv.authenticatedContext('other-user').firestore();

      await assertFails(
        getDocs(collection(authedDb, 'users', userId, 'weeks'))
      );
    });
  });

  describe('other collections', () => {
    it('denies access to other collections', async () => {
      const authedDb = testEnv.authenticatedContext(userId).firestore();

      await assertFails(
        getDoc(doc(authedDb, 'some-other-collection', 'document'))
      );
    });
  });
});
