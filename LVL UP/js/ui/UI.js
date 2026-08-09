// js/ui/UI.js
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class UIManager {
    constructor() {
        this.initModals();
        this.initToast();
    }

    // ===== ТОСТЫ =====
    toast(message, type = 'info', duration = 3000) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // ===== ФОРМАТИРОВАНИЕ ДАТ =====
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const formats = {
            short: () => d.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            long: () => d.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            weekday: () => d.toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            }),
            datetime: () => d.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        return formats[format] ? formats[format]() : d.toLocaleDateString('ru-RU');
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро 👋';
        if (hour < 18) return 'Добрый день ☀️';
        return 'Добрый вечер 🌙';
    }

    // ===== МОДАЛКИ =====
    initModals() {
        this.modals = {
            task: document.getElementById('taskModal'),
            detail: document.getElementById('detailModal'),
            goal: document.getElementById('goalModal'),
            note: document.getElementById('noteModal'),
            noteView: document.getElementById('noteViewModal'),
            photoView: document.getElementById('photoViewModal'),
            photoDesc: document.getElementById('photoDescModal'),
            help: document.getElementById('helpModal'),
            settings: document.getElementById('settingsModal')
        };

        Object.values(this.modals).forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('open');
                    }
                });
            }
        });
    }

    openModal(name) {
        if (this.modals[name]) {
            this.modals[name].classList.add('open');
        }
    }

    closeModal(name) {
        if (this.modals[name]) {
            this.modals[name].classList.remove('open');
        }
    }

    // ===== ОБНОВЛЕНИЕ АВАТАРА (НОВЫЙ МЕТОД) =====
    updateHeaderAvatar() {
        const avatarEl = document.getElementById('avatarPreview');
        const profile = data.profile;
        
        if (avatarEl) {
            if (profile.avatar) {
                avatarEl.innerHTML = `
                    <img src="${profile.avatar}" alt="avatar">
                    <input type="file" id="avatarInput" accept="image/*" style="display:none;">
                `;
            } else {
                avatarEl.innerHTML = `
                    <span id="avatarInitials">${profile.name.charAt(0).toUpperCase()}</span>
                    <input type="file" id="avatarInput" accept="image/*" style="display:none;">
                `;
            }
        }
        
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = profile.name;
        
        const initialsEl = document.getElementById('avatarInitials');
        if (initialsEl) initialsEl.textContent = profile.name.charAt(0).toUpperCase();
    }

    // ===== ОСТАЛЬНЫЕ МЕТОДЫ (openTaskModal, openGoalModal и т.д.) =====
    // ... они у тебя уже есть из предыдущих этапов ...
}

// Экспортируем экземпляр
const ui = new UIManager();
export default ui;