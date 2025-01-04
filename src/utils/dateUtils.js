export function getCurrentWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(now.setDate(diff));
  return (
    monday.getFullYear() +
    '-' +
    String(monday.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(monday.getDate()).padStart(2, '0')
  );
}

/**
 * Generates a short, unique identifier with the following properties:
 * - Starts with base36 timestamp (sortable)
 * - Includes 3 random chars (collision prevention)
 * - URL-safe (uses only alphanumeric chars)
 * - Format: "timestamp-random" (e.g., "lrz5hj4-k7m")
 * @returns {string} A unique identifier
 */
export function generateId() {
  const timestamp = Date.now().toString(36); // base36 timestamp
  const random = Math.random().toString(36).substring(2, 5); // 3 random chars
  return `${timestamp}-${random}`;
}
