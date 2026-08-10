/**
 * ============================================================
 * UI — ТОСТЫ, МОДАЛКИ, ТЕМЫ
 * ============================================================
 */
import { CONFIG } from './config.js';
import { Data } from './data.js';

export const UI = (() => {
    let _toastTimeout = null;

    // === Toast ===
    const toast = (message, type = 'info', duration = 3000) => {
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
            if (_toastTimeout) clearTimeout(_toastTimeout);
        }

        const toastEl = document.createElement('div');
        toastEl.className = `toast ${type}`;
        toastEl.textContent = message;
        document.body.appendChild(toastEl);

        requestAnimationFrame(() => toastEl.classList.add('show'));

        _toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
            setTimeout(() => toastEl.remove(), 400);
            _toastTimeout = null;
        }, duration);
    };

    // === Модалки ===
    const modals = {};

    const registerModal = (id, openCallback, closeCallback) => {
        modals[id] = { openCallback, closeCallback };
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                if (e.target === el) close(id);
            });
        }
    };

    const open = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('open');
            if (modals[id]?.openCallback) modals[id].openCallback();
        }
    };

    const close = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('open');
            if (modals[id]?.closeCallback) modals[id].closeCallback();
        }
    };

    const isOpen = (id) => {
        const el = document.getElementById(id);
        return el?.classList.contains('open') || false;
    };

    // === Темы ===
    const loadTheme = () => {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE.THEME_KEY);
        if (savedTheme && savedTheme !== 'default') {
            document.body.classList.add('theme-' + savedTheme);
        }
        const savedDark = localStorage.getItem(CONFIG.STORAGE.DARK_KEY);
        if (savedDark === 'true') {
            document.body.classList.add('dark');
        }
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem(CONFIG.STORAGE.DARK_KEY, isDark ? 'true' : 'false');
        const label = document.getElementById('darkModeLabel');
        if (label) label.textContent = isDark ? 'Вкл' : 'Выкл';
        toast(isDark ? '🌓 Тёмный режим' : '🌓 Светлый режим', 'info', 1500);
    };

    const setTheme = (theme) => {
        document.body.className = document.body.className
            .split(' ')
            .filter(c => !c.startsWith('theme-'))
            .join('');
        if (theme !== 'default') {
            document.body.classList.add('theme-' + theme);
        }
        localStorage.setItem(CONFIG.STORAGE.THEME_KEY, theme);
        toast('🎨 Тема: ' + theme, 'info', 1500);
    };

    // === Экспорт/Импорт ===
    const exportData = () => {
        const data = Data.get();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'skillquest_backup.json';
        a.click();
        URL.revokeObjectURL(url);
        toast('📤 Данные экспортированы!', 'success');
    };

    const importData = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.profile && imported.journals && Array.isArray(imported.tasks)) {
                    const data = Data.get();
                    Object.assign(data, imported);
                    Data.save();
                    toast('📥 Данные импортированы!', 'success');
                    if (typeof App !== 'undefined' && App.renderCurrentPage) {
                        App.renderCurrentPage();
                    }
                    updateHeader();
                } else {
                    toast('⚠️ Неверный формат файла', 'error');
                }
            } catch (err) {
                toast('⚠️ Ошибка чтения файла: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    };

    // === Обновление шапки ===
    const updateHeader = () => {
        const profile = Data.profile();
        const name = profile?.name || 'Герой';
        const avatarEl = document.getElementById('avatarPreview');
        const initialsEl = document.getElementById('avatarInitials');
        const userNameEl = document.getElementById('userName');
        const greetingEl = document.getElementById('greetingText');

        if (userNameEl) userNameEl.textContent = name;
        if (greetingEl) greetingEl.textContent = Utils.getGreeting();

        if (avatarEl) {
            if (profile?.avatar) {
                avatarEl.innerHTML =
                    `<img src="${profile.avatar}" alt="avatar"><input type="file" id="avatarInput" accept="image/*" style="display:none;">`;
            } else if (initialsEl) {
                initialsEl.textContent = name.charAt(0).toUpperCase();
            }
        }
    };

    return {
        toast,
        openModal: open,
        closeModal: close,
        isModalOpen: isOpen,
        registerModal,
        loadTheme,
        toggleDarkMode,
        setTheme,
        exportData,
        importData,
        updateHeader,
    };
})();