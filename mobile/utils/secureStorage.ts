import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Secure storage wrapper that uses expo-secure-store on native
 * and AsyncStorage on web (where SecureStore is not available)
 */
class SecureStorage {
  private isSecureStoreAvailable = Platform.OS !== 'web';

  async setItem(key: string, value: string): Promise<void> {
    if (this.isSecureStoreAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  /**
   * Clear all secure items (use with caution)
   */
  async clear(): Promise<void> {
    // SecureStore doesn't have a clear all method, so we manually remove known keys
    const keysToRemove = ['auth_token', 'user', 'refresh_token'];

    for (const key of keysToRemove) {
      try {
        await this.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    }
  }
}

export const secureStorage = new SecureStorage();
