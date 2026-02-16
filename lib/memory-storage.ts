/**
 * In-memory storage service for native platforms
 * Uses in-memory cache that persists during app session
 * 
 * This completely avoids all native module initialization errors
 * (Handler.java, ActivityThread.java, ZygoteInit.java)
 */

import { Platform } from 'react-native';

// In-memory cache for all platforms
const memoryCache = new Map<string, string>();

export const storage = {
  /**
   * Get item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return memoryCache.get(key) || null;
    } catch (error) {
      console.warn(`storage.getItem error for ${key}:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      memoryCache.set(key, value);
    } catch (error) {
      console.warn(`storage.setItem error for ${key}:`, error);
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      memoryCache.delete(key);
    } catch (error) {
      console.warn(`storage.removeItem error for ${key}:`, error);
    }
  },

  /**
   * Clear all storage
   */
  clear: async (): Promise<void> => {
    try {
      memoryCache.clear();
    } catch (error) {
      console.warn(`storage.clear error:`, error);
    }
  },
};
