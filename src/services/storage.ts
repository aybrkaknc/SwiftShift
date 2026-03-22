import { browser } from '../utils/browser-api';

export interface TelegramTarget {
    id: string; // Chat ID or Topic ID
    name: string;
    type: 'channel' | 'group' | 'topic' | 'private';
    username?: string; // Optional: username for display
    threadId?: number; // For Topics
    pinned?: boolean; // Pin to top
    parentId?: string; // Parent channel/group ID for topics
}

export interface UserProfile {
    id: string;
    name: string; // e.g. "My Private Bot"
    displayName?: string; // User's chosen display name
    username?: string; // Bot's @username
    botToken: string; // Stored securely
    chatId: string; // Default chat ID
    targets: TelegramTarget[]; // Cached list of topics
    lastSynced: number; // Timestamp
}

export interface StorageSchema {
    activeProfileId: string;
    profiles: Record<string, UserProfile>;
    recentTargets: string[]; // List of IDs sorted by recency
}

/**
 * StorageService
 * Wrapper around browser.storage.local for SwiftShift.
 * Handles Profile management and secure token storage.
 */

// Basit Token Obfuscation Yardımcıları (Güvenliği artırmak için)
const OBFUSCATE_PREFIX = "ENC_";

function obfuscateToken(token: string): string {
    if (token.startsWith(OBFUSCATE_PREFIX)) return token; // Zaten şifreli
    try {
        // Basit ters çevirme ve Base64 - eklentinin sandbox dışından sadece düz okunmasını zorlaştırır.
        const reversed = token.split('').reverse().join('');
        return OBFUSCATE_PREFIX + btoa(reversed);
    } catch {
        return token;
    }
}

function deobfuscateToken(token: string): string {
    if (!token.startsWith(OBFUSCATE_PREFIX)) return token; // Şifreli değilse düz döndür (Geri dönüklük/Legacy)
    try {
        const base64Str = token.replace(OBFUSCATE_PREFIX, '');
        const reversed = atob(base64Str);
        return reversed.split('').reverse().join('');
    } catch {
        return token;
    }
}

export const StorageService = {
    /**
     * Initialize storage with default values if empty
     */
    async init(): Promise<void> {
        // Attempt Migration FIRST if applicable
        await this.migrateFromLegacy();

        const data = await browser.storage.local.get(['profiles', 'activeProfileId', 'recentTargets']);
        if (!data.profiles) {
            await browser.storage.local.set({
                profiles: {},
                activeProfileId: '',
                recentTargets: [],
            });
        }
    },

    /**
     * Migrate from v3 (flat structure) to v4 (profile-based)
     */
    async migrateFromLegacy(): Promise<void> {
        const legacy: any = await browser.storage.local.get(['botToken', 'chatId', 'targets', 'displayName', 'profiles']);

        // Check if legacy data exists and NO profiles exist yet
        if (legacy.botToken && !legacy.profiles) {
            const legacyProfile: UserProfile = {
                id: legacy.chatId || 'legacy-default',
                name: 'Migrated Bot',
                displayName: legacy.displayName || 'Legacy User',
                botToken: obfuscateToken(legacy.botToken),
                chatId: legacy.chatId || '',
                targets: legacy.targets || [],
                lastSynced: Date.now()
            };

            await browser.storage.local.set({
                profiles: { [legacyProfile.id]: legacyProfile },
                activeProfileId: legacyProfile.id,
                recentTargets: legacy.targets ? legacy.targets.map((t: any) => t.id).slice(0, 3) : []
            });

            // Cleanup legacy keys
            await browser.storage.local.remove(['botToken', 'chatId', 'targets', 'displayName']);
        }
    },

    /**
     * Save a new profile or update existing one
     */
    async saveProfile(profile: UserProfile): Promise<void> {
        const profileToSave = { ...profile, botToken: obfuscateToken(profile.botToken) };
        const { profiles }: any = await browser.storage.local.get('profiles');
        const updatedProfiles = { ...profiles, [profileToSave.id]: profileToSave };

        // If this is the first profile, set it as active
        const { activeProfileId }: any = await browser.storage.local.get('activeProfileId');
        const newActiveId = activeProfileId || profile.id;

        await browser.storage.local.set({
            profiles: updatedProfiles,
            activeProfileId: newActiveId,
        });
    },

    /**
     * Get the currently active profile
     */
    async getActiveProfile(): Promise<UserProfile | null> {
        const { activeProfileId, profiles }: any = await browser.storage.local.get(['activeProfileId', 'profiles']);
        if (!activeProfileId || !profiles) return null;
        let profile = (profiles as any)[activeProfileId];
        if (!profile) return null;

        // Okurken token'ı çöz
        return {
            ...profile,
            botToken: deobfuscateToken(profile.botToken)
        } as UserProfile;
    },

    /**
     * Get all profiles
     */
    async getAllProfiles(): Promise<UserProfile[]> {
        const { profiles }: any = await browser.storage.local.get('profiles');
        if (!profiles) return [];
        
        return Object.values(profiles).map((p: any) => ({
            ...p,
            botToken: deobfuscateToken(p.botToken)
        })) as UserProfile[];
    },

    /**
     * Switch active profile
     */
    async setActiveProfile(profileId: string): Promise<void> {
        const { profiles }: any = await browser.storage.local.get('profiles');
        if (profiles && (profiles as any)[profileId]) {
            await browser.storage.local.set({ activeProfileId: profileId });
        }
    },

    /**
     * Update cached targets for a profile
     */
    async updateProfileTargets(profileId: string, targets: TelegramTarget[]): Promise<void> {
        const { profiles }: any = await browser.storage.local.get('profiles');
        if (profiles && (profiles as any)[profileId]) {
            (profiles as any)[profileId].targets = targets;
            (profiles as any)[profileId].lastSynced = Date.now();
            await browser.storage.local.set({ profiles });
        }
    },

    /**
     * Add a target to the recent list (Top 3 logic)
     */
    async addRecentTarget(targetId: string): Promise<void> {
        const { recentTargets }: any = await browser.storage.local.get('recentTargets');
        let newRecents = [targetId, ...(recentTargets || [])];

        // Remove duplicates
        newRecents = [...new Set(newRecents)];

        // Keep only top 10 (we show top 3 but keep memory of 10)
        if (newRecents.length > 10) {
            newRecents = newRecents.slice(0, 10);
        }

        await browser.storage.local.set({ recentTargets: newRecents });
    },

    /**
     * Clear all data (Debug/Reset)
     */
    async clear(): Promise<void> {
        await browser.storage.local.clear();
    },

    /**
     * Get Recents view mode preference
     */
    async getViewMode(): Promise<'compact' | 'bento' | 'gallery'> {
        const { viewMode }: any = await browser.storage.local.get('viewMode');
        return viewMode || 'bento'; // Default to bento
    },

    /**
     * Set Recents view mode preference
     */
    async setViewMode(mode: 'compact' | 'bento' | 'gallery'): Promise<void> {
        await browser.storage.local.set({ viewMode: mode });
    }
};
