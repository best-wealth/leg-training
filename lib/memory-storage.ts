/**
 * Storage service that uses localStorage on web and in-memory cache on native
 * This ensures data persists across page refreshes on web while avoiding native module errors
 */

import { Platform } from 'react-native';

// In-memory cache for native platforms
const memoryCache = new Map<string, string>();

/**
 * Get localStorage (only available on web)
 */
function getLocalStorage(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch (error) {
    console.warn('localStorage not available:', error);
    return null;
  }
}

export const storage = {
  /**
   * Get item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        const localStorage = getLocalStorage();
        if (localStorage) {
          const value = localStorage.getItem(key);
          console.log(`📖 Retrieved from localStorage: ${key} (${value ? value.length : 0} bytes)`);
          return value;
        } else {
          console.warn(`⚠️ localStorage not available, checking memory cache for ${key}`);
        }
      }
      // Fallback to memory cache on native or if localStorage fails
      const cached = memoryCache.get(key);
      if (cached) {
        console.log(`📖 Retrieved from memory cache: ${key}`);
      }
      return cached || null;
    } catch (error) {
      console.warn(`storage.getItem error for ${key}:`, error);
      return memoryCache.get(key) || null;
    }
  },

  /**
   * Set item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Always cache in memory as backup
      memoryCache.set(key, value);
      console.log(`💾 Storage.setItem: ${key} (${value.length} bytes)`);
      
      if (Platform.OS === 'web') {
        const localStorage = getLocalStorage();
        if (localStorage) {
          localStorage.setItem(key, value);
          console.log(`✅ Saved to localStorage: ${key}`);
          return;
        } else {
          console.warn(`⚠️ localStorage not available, using memory cache for ${key}`);
        }
      }
    } catch (error) {
      console.warn(`storage.setItem error for ${key}:`, error);
      // Ensure it's at least in memory cache
      memoryCache.set(key, value);
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      // Always remove from memory cache
      memoryCache.delete(key);
      
      if (Platform.OS === 'web') {
        const localStorage = getLocalStorage();
        if (localStorage) {
          localStorage.removeItem(key);
          return;
        }
      }
    } catch (error) {
      console.warn(`storage.removeItem error for ${key}:`, error);
    }
  },

  /**
   * Clear all storage
   */
  clear: async (): Promise<void> => {
    try {
      // Always clear memory cache
      memoryCache.clear();
      
      if (Platform.OS === 'web') {
        const localStorage = getLocalStorage();
        if (localStorage) {
          localStorage.clear();
          return;
        }
      }
    } catch (error) {
      console.warn(`storage.clear error:`, error);
    }
  },
};
