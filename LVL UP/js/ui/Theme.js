// js/ui/Theme.js
import eventBus from '../core/EventBus.js';

class ThemeManager {
    constructor() {
        this.themes = ['default', 'jade', 'ruby', 'sapphire', 'amber', 'coral', 'amethyst'];
        this.loadTheme();
        this.loadDarkMode();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('skillquest_theme');
        if (savedTheme && savedTheme !== 'default') {
            document.body.classList.add('theme-' + savedTheme);
        }
    }

    loadDarkMode() {
        const savedDark = localStorage.getItem('skillquest_dark');
        if (savedDark === 'true') {
            document.body.classList.add('dark');
        }
    }

    setTheme(theme) {
        document.body.className = document.body.className
            .split(' ')
            .filter(c => !c.startsWith('theme-'))
            .join('');
        
        if (theme !== 'default') {
            document.body.classList.add('theme-' + theme);
        }
        
        localStorage.setItem('skillquest_theme', theme);
        eventBus.publish('themeChanged', theme);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('skillquest_dark', isDark ? 'true' : 'false');
        eventBus.publish('darkModeToggled', isDark);
        return isDark;
    }

    getCurrentTheme() {
        return document.body.className.match(/theme-(\w+)/)?.[1] || 'default';
    }

    isDarkMode() {
        return document.body.classList.contains('dark');
    }
}

const theme = new ThemeManager();
export default theme;