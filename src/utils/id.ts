/**
 * ID generation utilities
 */

/**
 * Generates a unique ID using random + timestamp
 * Suitable for in-memory storage and demos
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
