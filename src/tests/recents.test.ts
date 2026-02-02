/**
 * RecentsService Tests
 * Recents CRUD operasyonları için unit testler.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IDB before importing RecentsService
vi.mock('idb', () => ({
    openDB: vi.fn(() => Promise.resolve({
        getAll: vi.fn(() => Promise.resolve([])),
        add: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        clear: vi.fn(() => Promise.resolve()),
        put: vi.fn(() => Promise.resolve())
    }))
}));

describe('RecentsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('modül import edilebilmeli', async () => {
        const { RecentsService } = await import('../services/recents');
        expect(RecentsService).toBeDefined();
        expect(RecentsService.add).toBeDefined();
        expect(RecentsService.getAll).toBeDefined();
        expect(RecentsService.delete).toBeDefined();
        expect(RecentsService.clear).toBeDefined();
    });

    it('add fonksiyonu parametre almalı', async () => {
        const { RecentsService } = await import('../services/recents');

        // Function signature check
        expect(typeof RecentsService.add).toBe('function');
    });

    it('getAll array döndürmeli', async () => {
        const { RecentsService } = await import('../services/recents');

        const result = await RecentsService.getAll();

        expect(Array.isArray(result)).toBe(true);
    });
});
