import { AsyncLocalStorage } from 'node:async_hooks';

export enum RequestContextKey {
  USER_ID = 'USER_ID',
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<Map<string, any>>();

  // Run this to create a new context for each request
  static run(fn: () => void) {
    const store = new Map<string, any>();
    this.storage.run(store, fn);
  }

  // Set data in the current context
  static set(key: string, value: any) {
    const store = this.storage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  // Get data from the current context
  static get<T>(key: string): T | undefined {
    const store = this.storage.getStore();
    return store ? store.get(key) : undefined;
  }
}
