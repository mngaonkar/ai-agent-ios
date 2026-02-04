import { Preferences } from '@capacitor/preferences';
import { AppConfig } from '../types';

export class StorageService {
  private static readonly CONFIG_KEY = 'app_config';
  private static readonly THREADS_KEY = 'conversation_threads';

  async getConfig(): Promise<AppConfig | null> {
    try {
      const { value } = await Preferences.get({ key: StorageService.CONFIG_KEY });
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error('Error getting config:', error);
      return null;
    }
  }

  async saveConfig(config: AppConfig): Promise<void> {
    try {
      await Preferences.set({
        key: StorageService.CONFIG_KEY,
        value: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  async clearConfig(): Promise<void> {
    try {
      await Preferences.remove({ key: StorageService.CONFIG_KEY });
    } catch (error) {
      console.error('Error clearing config:', error);
      throw error;
    }
  }

  async getThreads(): Promise<Record<string, any>> {
    try {
      const { value } = await Preferences.get({ key: StorageService.THREADS_KEY });
      if (value) {
        return JSON.parse(value);
      }
      return {};
    } catch (error) {
      console.error('Error getting threads:', error);
      return {};
    }
  }

  async saveThread(threadId: string, threadData: any): Promise<void> {
    try {
      const threads = await this.getThreads();
      threads[threadId] = threadData;
      await Preferences.set({
        key: StorageService.THREADS_KEY,
        value: JSON.stringify(threads),
      });
    } catch (error) {
      console.error('Error saving thread:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
