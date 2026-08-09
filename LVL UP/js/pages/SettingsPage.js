// js/pages/SettingsPage.js
import BasePage from './BasePage.js';
import theme from '../ui/Theme.js';
import eventBus from '../core/EventBus.js';

class SettingsPage extends BasePage {
    constructor() {
        super();
        this.subscribe('themeChanged', () => this.render());
        this.subscribe('darkModeToggled', () => this.render());
    }

    render() {
        this.clear();
        this.setPageTitle('Настройки');

        const isDark = theme.isDarkMode();
        const currentTheme = theme.getCurrentTheme();

        const themes = ['default', 'jade', 'ruby', 'sapphire', 'amber', 'coral', 'amethyst'];
        const themeColors = {
            default: 'var(--card)',
            jade: '#00b894',
            ruby: '#e17055',
            sapphire: '#0984e3',
            amber: '#fdcb6e',
            coral: '#e17055',
            amethyst: '#a29bfe'
        };
        const themeLabels = {
            default: 'По умолчанию',
            jade: 'Изумруд',
            ruby: 'Рубин',
            sapphire: 'Сапфир',
            amber: 'Янтарь',
            coral: 'Коралл',
            amethyst: 'Аметист'
        };

        this.renderHTML(`
            <div class="card" style="max-width:500px; margin:0 auto;">
                <h3 style="font-size:20px; font-weight:600; margin-bottom:20px;">⚙️ Настройки</h3>
                <div style="display:grid; gap:20px;">
                    <div class="form-group">
                        <label class="input-label">Тёмный режим</label>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <label class="switch">
                                <input type="checkbox" id="settingsDarkMode" ${isDark ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="body-2">${isDark ? 'Вкл' : 'Выкл'}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="input-label">Цветовая тема</label>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            ${themes.map(t => {
                                const isActive = currentTheme === t;
                                const textColor = t === 'amber' ? '#1a1a2e' : '#fff';
                                return `<span class="chip ${isActive ? 'active' : ''}" 
                                    data-theme="${t}" 
                                    style="background:${themeColors[t]}; color:${textColor}; 
                                           border-color:${isActive ? 'var(--primary)' : 'transparent'};">
                                    ${themeLabels[t]}
                                </span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="form-group">
                            <label class="input-label">Экспорт данных</label>
                            <button class="btn btn-sm" id="exportDataBtn">📤 Скачать JSON</button>
                        </div>
                        <div class="form-group">
                            <label class="input-label">Импорт данных</label>
                            <input type="file" id="importDataInput" accept=".json" style="display:none;">
                            <button class="btn btn-sm btn-secondary" id="importDataBtn">📥 Загрузить JSON</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="input-label">Сбросить все данные</label>
                        <button class="btn btn-sm btn-danger" id="resetDataBtn">🗑 Сбросить всё</button>
                        <span class="caption-1 text-secondary">Все данные будут удалены безвозвратно</span>
                    </div>
                    <div class="btn-group" style="justify-content:flex-end;">
                        <button class="btn btn-secondary" id="settingsCloseBtn">Закрыть</button>
                    </div>
                </div>
            </div>
        `);

        // Темный режим
        this.find('#settingsDarkMode')?.addEventListener('change', function() {
            const isDark = theme.toggleDarkMode();
            this.parentElement.querySelector('.body-2').textContent = isDark ? 'Вкл' : 'Выкл';
        });

        // Темы
        this.findAll('[data-theme]').forEach(chip => {
            chip.addEventListener('click', function() {
                const themeName = this.dataset.theme;
                theme.setTheme(themeName);
                this.ui.toast('🎨 Тема: ' + themeLabels[themeName], 'info', 1500);
            });
        });

        // Экспорт
        this.find('#exportDataBtn')?.addEventListener('click', () => {
            this.ui.exportData();
        });

        // Импорт
        const importInput = this.find('#importDataInput');
        this.find('#importDataBtn')?.addEventListener('click', () => {
            importInput.click();
        });
        importInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.ui.importData(file);
            }
            this.value = '';
        });

        // Сброс данных
        this.find('#resetDataBtn')?.addEventListener('click', () => {
            this.ui.resetData();
        });

        // Закрыть
        this.find('#settingsCloseBtn')?.addEventListener('click', () => {
            eventBus.publish('navigate', 'home');
        });
    }
}

export default SettingsPage;