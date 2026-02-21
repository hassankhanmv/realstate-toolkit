/**
 * Service for managing localStorage operations safely with backward compatibility.
 */
export const localStorageManager = {
  /**
   * Safe getter for localStorage items.
   * @param key Storage key
   * @param defaultValue Default value if key is not found or error occurs
   */
  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      // Fallback for non-JSON strings (backward compatibility)
      try {
        const item = window.localStorage.getItem(key);
        if (item === "true") return true as unknown as T;
        if (item === "false") return false as unknown as T;
        if (item !== null && typeof defaultValue === "string") {
          return item as unknown as T;
        }
      } catch (e) {} // Ignore
      return defaultValue;
    }
  },

  /**
   * Safe setter for localStorage items.
   * @param key Storage key
   * @param value Value to store
   */
  setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  },

  /**
   * Safe removal of localStorage items.
   * @param key Storage key
   */
  removeItem(key: string): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  },
};
