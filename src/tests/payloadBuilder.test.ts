/**
 * PayloadBuilder Tests
 * buildPayload fonksiyonu için unit testler.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPayload } from '../services/contextMenu/payloadBuilder';

describe('buildPayload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createTab = (overrides?: Partial<chrome.tabs.Tab>): chrome.tabs.Tab => ({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: true,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'https://example.com',
        title: 'Example Page',
        ...overrides
    });

    it('text seçili iken text payload döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            selectionText: 'Selected text content'
        };

        const result = await buildPayload(info, createTab(), 'text');

        expect(result).not.toBeNull();
        expect(result?.text).toBe('Selected text content');
    });

    it('link context ise linkUrl döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            linkUrl: 'https://linked-page.com'
        };

        const result = await buildPayload(info, undefined, 'link');

        expect(result).not.toBeNull();
        expect(result?.text).toBe('https://linked-page.com');
    });

    it('image context ise photo döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            srcUrl: 'https://example.com/image.png',
            mediaType: 'image'
        };

        const result = await buildPayload(info, undefined, 'image');

        expect(result).not.toBeNull();
        expect(result?.photo).toBe('https://example.com/image.png');
    });

    it('sendAsFile true ise document döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            srcUrl: 'https://example.com/image.png',
            mediaType: 'image'
        };

        const result = await buildPayload(info, undefined, 'image', true);

        expect(result).not.toBeNull();
        expect(result?.document).toBe('https://example.com/image.png');
        expect(result?.photo).toBeUndefined();
    });

    it('audio context ise audio döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            srcUrl: 'https://example.com/song.mp3',
            mediaType: 'audio'
        };

        const result = await buildPayload(info, undefined, 'audio');

        expect(result).not.toBeNull();
        expect(result?.audio).toBe('https://example.com/song.mp3');
    });

    it('video context ise text (link) döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com',
            srcUrl: 'https://example.com/video.mp4',
            mediaType: 'video'
        };

        const result = await buildPayload(info, createTab(), 'video');

        expect(result).not.toBeNull();
        expect(result?.text).toContain('Video:');
    });

    it('page context ise sayfa URL si döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com/page'
        };
        const tab = createTab({
            url: 'https://example.com/page',
            title: 'Example Page Title'
        });

        const result = await buildPayload(info, tab, 'page');

        expect(result).not.toBeNull();
        expect(result?.text).toContain('Example Page Title');
        expect(result?.text).toContain('https://example.com/page');
    });

    it('hiçbir veri yoksa null döndürmeli', async () => {
        const info: chrome.contextMenus.OnClickData = {
            menuItemId: 'test',
            editable: false,
            pageUrl: 'https://example.com'
        };

        // Tab olmadan ve herhangi bir veri olmadan
        const result = await buildPayload(info, undefined);

        expect(result).toBeNull();
    });
});
