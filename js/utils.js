/**
 * ============================================================
 * УТИЛИТЫ
 * ============================================================
 */
export const Utils = {
    safeJSONParse: (str, fallback) => {
        try { return JSON.parse(str); } catch { return fallback; }
    },

    generateId: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 7),

    isToday: (date) => {
        const d = new Date(date);
        const now = new Date();
        return d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
    },

    formatDate: (date, format = 'short') => {
        const d = new Date(date);
        switch (format) {
            case 'short':
                return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            case 'long':
                return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            case 'weekday':
                return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
            case 'datetime':
                return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            default:
                return d.toLocaleDateString('ru-RU');
        }
    },

    toDateStr: (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    daysBetween: (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    getGreeting: () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро 👋';
        if (hour < 18) return 'Добрый день ☀️';
        return 'Добрый вечер 🌙';
    },

    round: (num, decimals = 2) => Number(num.toFixed(decimals)),
};