/**
 * ============================================================
 * КОНФИГУРАЦИЯ
 * ============================================================
 */
export const CONFIG = {
    XP: {
        PER_LEVEL: 100,
        JOURNAL_PER_MIN: 0.01,
        TOTAL_PER_MIN: 0.005,
        LATE_MULTIPLIER: 0.25,
        GOAL_BONUS: 0.05,
    },
    STORAGE: {
        KEY: 'skillquest_data',
        THEME_KEY: 'skillquest_theme',
        DARK_KEY: 'skillquest_dark',
        CALENDAR_VIEW_KEY: 'skillquest_calendar_view',
    },
    AUTO_MISS_INTERVAL: 60000,
    MAX_PHOTO_SIZE: 5 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};