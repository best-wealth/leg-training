/**
 * In-memory storage service that replaces AsyncStorage on native platforms
 * This avoids all native module initialization errors (Handler.java, ActivityThread.java, ZygoteInit.java)
 * 
 * On web: uses AsyncStorage for persistence
 * On native: uses in-memory cache (data persists during app session)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In-memory cache for native platforms
const memoryCache = new Map<string, string>();

export const storage = {
  /**
   * Get item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      // On native, use in-memory cache
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
      if (Platform.OS === 'web') {
        return await AsyncStorage.setItem(key, value);
      }
      // On native, use in-memory cache
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
      if (Platform.OS === 'web') {
        return await AsyncStorage.removeItem(key);
      }
      // On native, use in-memory cache
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
      if (Platform.OS === 'web') {
        return await AsyncStorage.clear();
      }
      // On native, clear in-memory cache
      memoryCache.clear();
    } catch (error) {
      console.warn(`storage.clear error:`, error);
    }
  },
};
