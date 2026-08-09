// js/app.js
import eventBus from './core/EventBus.js';
import data from './core/Data.js';
import ui from './ui/UI.js';
import theme from './ui/Theme.js';

// Импортируем страницы
import HomePage from './pages/HomePage.js';
import CalendarPage from './pages/CalendarPage.js';
import JournalsPage from './pages/JournalsPage.js';
import GoalsPage from './pages/GoalsPage.js';
import ProfilePage from './pages/ProfilePage.js';
import NotesPage from './pages/NotesPage.js';
import GalleryPage from './pages/GalleryPage.js';
import SettingsPage from './pages/SettingsPage.js';

class App {
    constructor() {
        this.currentPage = null;
        this.currentPageName = 'home';
        this.pages = {
            home: HomePage,
            calendar: CalendarPage,
            journals: JournalsPage,
            goals: GoalsPage,
            profile: ProfilePage,
            notes: NotesPage,
            gallery: GalleryPage,
            settings: SettingsPage
        };

        this.init();
    }

    init() {
        // Подписываемся на события
        this.subscribeToEvents();

        // Инициализируем навигацию
        this.initNavigation();

        // Инициализируем FAB кнопку
        this.initFab();

        // Инициализируем аватар
        this.initAvatar();

        // Инициализируем кнопку помощи
        this.initHelp();

        // Инициализируем настройки
        this.initSettings();

        // Запускаем авто-проверку пропущенных задач
        setInterval(() => {
            data.autoMissTasks();
        }, 60000);

        // Переходим на главную страницу
        this.navigateTo('home');
    }

    subscribeToEvents() {
        // Навигация
        eventBus.subscribe('navigate', (pageName) => {
            this.navigateTo(pageName);
        });

        // Обновление данных
        eventBus.subscribe('dataChanged', () => {
            if (this.currentPage) {
                this.currentPage.render();
            }
        });

        // Изменение задач
        eventBus.subscribe('taskChanged', () => {
            if (this.currentPage) {
                this.currentPage.render();
            }
            this.updateBadges();
        });

        // Изменение целей
        eventBus.subscribe('goalChanged', () => {
            if (this.currentPage) {
                this.currentPage.render();
            }
            this.updateBadges();
        });

        // Навигация к журналу
        eventBus.subscribe('navigateToJournal', (journalName) => {
            if (this.currentPage instanceof JournalsPage) {
                this.currentPage.navigateToJournal(journalName);
            } else {
                this.navigateTo('journals');
                setTimeout(() => {
                    if (this.currentPage instanceof JournalsPage) {
                        this.currentPage.navigateToJournal(journalName);
                    }
                }, 100);
            }
        });
    }

    initNavigation() {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    initFab() {
        document.getElementById('fabAdd').addEventListener('click', () => {
            ui.openTaskModal();
        });
    }

    initAvatar() {
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarInput = document.getElementById('avatarInput');

        avatarPreview.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') avatarInput.click();
        });

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                data.profile.avatar = ev.target.result;
                data.save();
                ui.updateHeaderAvatar();
                if (this.currentPage) {
                    this.currentPage.render();
                }
                ui.toast('✅ Аватар обновлён', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    initHelp() {
        document.getElementById('helpBtn').addEventListener('click', () => {
            ui.openModal('help');
        });

        document.getElementById('helpModalClose').addEventListener('click', () => {
            ui.closeModal('help');
        });

        document.getElementById('helpCloseBtn').addEventListener('click', () => {
            ui.closeModal('help');
        });
    }

    initSettings() {
        // Темный режим
        document.getElementById('settingsDarkMode').addEventListener('change', function() {
            const isDark = theme.toggleDarkMode();
            document.getElementById('darkModeLabel').textContent = isDark ? 'Вкл' : 'Выкл';
        });

        // Темы
        document.querySelectorAll('#settingsModal [data-theme]').forEach(chip => {
            chip.addEventListener('click', function() {
                const themeName = this.dataset.theme;
                theme.setTheme(themeName);
                ui.toast('🎨 Тема: ' + themeName, 'info', 1500);
            });
        });

        // Экспорт
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            ui.exportData();
        });

        // Импорт
        const importInput = document.getElementById('importDataInput');
        document.getElementById('importDataBtn').addEventListener('click', () => {
            importInput.click();
        });
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                ui.importData(file);
            }
            this.value = '';
        });

        // Сброс данных
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            ui.resetData();
        });

        // Закрытие настроек
        document.getElementById('settingsModalClose').addEventListener('click', () => {
            ui.closeModal('settings');
        });
        document.getElementById('settingsCloseBtn').addEventListener('click', () => {
            ui.closeModal('settings');
        });
    }

    navigateTo(pageName) {
        // Уничтожаем текущую страницу
        if (this.currentPage) {
            this.currentPage.destroy();
            this.currentPage = null;
        }

        this.currentPageName = pageName;

        // Обновляем навигацию
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Создаем новую страницу
        const PageClass = this.pages[pageName];
        if (PageClass) {
            this.currentPage = new PageClass();
            this.currentPage.render();
        }

        // Обновляем бейджи
        this.updateBadges();
    }

    updateBadges() {
        const badge = document.getElementById('goalsBadge');
        if (badge) {
            const count = data.goals.filter(g => !g.achieved).length;
            badge.textContent = count;
            badge.className = 'badge' + (count > 0 ? ' show' : '');
        }
    }
}

// Запускаем приложение
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});