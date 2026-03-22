import browserAPI from 'webextension-polyfill';

/**
 * Unified Browser API Wrapper
 * Uses webextension-polyfill to provide a promise-based 'browser' object
 * that works in both Chrome and Firefox.
 */
export const browser = browserAPI;

// Exporting types for better DX
export type { browserAPI as Browser };
