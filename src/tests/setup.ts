/**
 * Test Setup
 * Global test yapılandırması ve Chrome API mock'ları.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Chrome API Mock
const chromeMock = {
    storage: {
        local: {
            get: vi.fn((_keys, callback) => {
                const result: Record<string, any> = {};
                if (callback) callback(result);
                return Promise.resolve(result);
            }),
            set: vi.fn((_items, callback) => {
                if (callback) callback();
                return Promise.resolve();
            }),
            remove: vi.fn((_keys, callback) => {
                if (callback) callback();
                return Promise.resolve();
            })
        }
    },
    runtime: {
        sendMessage: vi.fn(),
        onMessage: {
            addListener: vi.fn()
        },
        onInstalled: {
            addListener: vi.fn()
        },
        onStartup: {
            addListener: vi.fn()
        }
    },
    tabs: {
        query: vi.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com', title: 'Example' }])),
        sendMessage: vi.fn(),
        captureVisibleTab: vi.fn(() => Promise.resolve('data:image/png;base64,test'))
    },
    contextMenus: {
        create: vi.fn(),
        removeAll: vi.fn((callback) => callback && callback()),
        onClicked: {
            addListener: vi.fn()
        }
    },
    notifications: {
        create: vi.fn()
    },
    commands: {
        onCommand: {
            addListener: vi.fn()
        }
    }
};

// Global'e ata
Object.defineProperty(globalThis, 'chrome', {
    value: chromeMock,
    writable: true
});

// Fetch mock (varsayılan)
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, result: {} })
    } as Response)
);

// Console hata filtreleme (test sırasında gereksiz hataları gizle)
const originalError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render') ||
            args[0].includes('Warning: An update to'))
    ) {
        return;
    }
    originalError.call(console, ...args);
};
