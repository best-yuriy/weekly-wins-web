import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentWeekKey, generateId } from './dateUtils';

describe('getCurrentWeekKey', () => {
  beforeEach(() => {
    // Reset the date to a known value before each test
    vi.useFakeTimers();
  });

  it('returns Monday date when current day is Wednesday', () => {
    // Use Date constructor with individual components to ensure
    // local timezone and avoid shifts to adjacent days
    // Note: months are 0-based (0-11)
    const testDate = new Date(2024, 2, 20, 12, 0, 0);
    expect(testDate.getDay()).toBe(3);
    vi.setSystemTime(testDate);
    expect(getCurrentWeekKey()).toBe('2024-03-18');
  });

  it('returns previous Monday date when current day is Sunday', () => {
    // Use Date constructor with individual components to ensure
    // local timezone and avoid shifts to adjacent days
    // Note: months are 0-based (0-11)
    const testDate = new Date(2024, 2, 24, 12, 0, 0);
    expect(testDate.getDay()).toBe(0);
    vi.setSystemTime(testDate);
    expect(getCurrentWeekKey()).toBe('2024-03-18');
  });

  it('returns current date when current day is Monday', () => {
    // Use Date constructor with individual components to ensure
    // local timezone and avoid shifts to adjacent days
    // Note: months are 0-based (0-11)
    const testDate = new Date(2024, 2, 25, 12, 0, 0);
    expect(testDate.getDay()).toBe(1);
    vi.setSystemTime(testDate);
    expect(getCurrentWeekKey()).toBe('2024-03-25');
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe('generateId', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  it('generates an ID with the expected format', () => {
    // Use Date constructor with individual components to ensure
    // local timezone and avoid shifts to adjacent days
    const testDate = new Date(2024, 2, 25, 12, 0, 0);
    vi.setSystemTime(testDate);
    const id = generateId();

    // Check format
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]{3}$/);

    // Check specific parts
    const [timestamp, random] = id.split('-');
    expect(random).toBe(Math.random().toString(36).substring(2, 5));
    expect(timestamp).toBe(testDate.getTime().toString(36));
  });

  it('generates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(new Date(2024, 2, 25, 12, 0, i)); // Increment time for each iteration
      ids.add(generateId());
    }
    expect(ids.size).toBe(10); // All IDs should be unique
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
