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
 * Wrapper around chrome.storage.local for SwiftShift.
 * Handles Profile management and secure token storage.
 */
export const StorageService = {
    /**
     * Initialize storage with default values if empty
     */
    async init(): Promise<void> {
        // Attempt Migration FIRST if applicable
        await this.migrateFromLegacy();

        const data = await chrome.storage.local.get(['profiles', 'activeProfileId', 'recentTargets']);
        if (!data.profiles) {
            await chrome.storage.local.set({
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
        const legacy = await chrome.storage.local.get(['botToken', 'chatId', 'targets', 'displayName', 'profiles']);

        // Check if legacy data exists and NO profiles exist yet
        if (legacy.botToken && !legacy.profiles) {
            const legacyProfile: UserProfile = {
                id: legacy.chatId || 'legacy-default',
                name: 'Migrated Bot',
                displayName: legacy.displayName || 'Legacy User',
                botToken: legacy.botToken,
                chatId: legacy.chatId || '',
                targets: legacy.targets || [],
                lastSynced: Date.now()
            };

            await chrome.storage.local.set({
                profiles: { [legacyProfile.id]: legacyProfile },
                activeProfileId: legacyProfile.id,
                recentTargets: legacy.targets ? legacy.targets.map((t: any) => t.id).slice(0, 3) : []
            });

            // Cleanup legacy keys
            await chrome.storage.local.remove(['botToken', 'chatId', 'targets', 'displayName']);
        }
    },

    /**
     * Save a new profile or update existing one
     */
    async saveProfile(profile: UserProfile): Promise<void> {
        const { profiles } = await chrome.storage.local.get('profiles');
        const updatedProfiles = { ...profiles, [profile.id]: profile };

        // If this is the first profile, set it as active
        const { activeProfileId } = await chrome.storage.local.get('activeProfileId');
        const newActiveId = activeProfileId || profile.id;

        await chrome.storage.local.set({
            profiles: updatedProfiles,
            activeProfileId: newActiveId,
        });
    },

    /**
     * Get the currently active profile
     */
    async getActiveProfile(): Promise<UserProfile | null> {
        const { activeProfileId, profiles } = await chrome.storage.local.get(['activeProfileId', 'profiles']);
        if (!activeProfileId || !profiles) return null;
        return profiles[activeProfileId] || null;
    },

    /**
     * Get all profiles
     */
    async getAllProfiles(): Promise<UserProfile[]> {
        const { profiles } = await chrome.storage.local.get('profiles');
        return profiles ? Object.values(profiles) : [];
    },

    /**
     * Switch active profile
     */
    async setActiveProfile(profileId: string): Promise<void> {
        const { profiles } = await chrome.storage.local.get('profiles');
        if (profiles && profiles[profileId]) {
            await chrome.storage.local.set({ activeProfileId: profileId });
        }
    },

    /**
     * Update cached targets for a profile
     */
    async updateProfileTargets(profileId: string, targets: TelegramTarget[]): Promise<void> {
        const { profiles } = await chrome.storage.local.get('profiles');
        if (profiles && profiles[profileId]) {
            profiles[profileId].targets = targets;
            profiles[profileId].lastSynced = Date.now();
            await chrome.storage.local.set({ profiles });
        }
    },

    /**
     * Add a target to the recent list (Top 3 logic)
     */
    async addRecentTarget(targetId: string): Promise<void> {
        const { recentTargets } = await chrome.storage.local.get('recentTargets') as { recentTargets: string[] };
        let newRecents = [targetId, ...(recentTargets || [])];

        // Remove duplicates
        newRecents = [...new Set(newRecents)];

        // Keep only top 10 (we show top 3 but keep memory of 10)
        if (newRecents.length > 10) {
            newRecents = newRecents.slice(0, 10);
        }

        await chrome.storage.local.set({ recentTargets: newRecents });
    },

    /**
     * Clear all data (Debug/Reset)
     */
    async clear(): Promise<void> {
        await chrome.storage.local.clear();
    },

    /**
     * Get Recents view mode preference
     */
    async getViewMode(): Promise<'compact' | 'bento' | 'gallery'> {
        const { viewMode } = await chrome.storage.local.get('viewMode');
        return viewMode || 'bento'; // Default to bento
    },

    /**
     * Set Recents view mode preference
     */
    async setViewMode(mode: 'compact' | 'bento' | 'gallery'): Promise<void> {
        await chrome.storage.local.set({ viewMode: mode });
    },

    /**
     * Tema tercihini al
     */
    async getTheme(): Promise<'light' | 'dark'> {
        const { theme } = await chrome.storage.local.get('theme');
        return theme || 'dark'; // Default to dark
    },

    /**
     * Tema tercihini kaydet
     */
    async setTheme(theme: 'light' | 'dark'): Promise<void> {
        await chrome.storage.local.set({ theme });
    }
};
