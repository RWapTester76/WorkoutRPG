const UI = {
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
    },

    openModal(content, fullscreen = false) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay open';
        overlay.innerHTML = `
            <div class="modal ${fullscreen ? 'modal-fullscreen' : ''}">
                ${content}
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });

        return overlay;
    },

    closeModal(modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    },

    formatDate(date, format = 'short') {
        const d = new Date(date);
        if (format === 'short') {
            return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        if (format === 'long') {
            return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        if (format === 'weekday') {
            return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
        }
        return d.toLocaleDateString('ru-RU');
    },

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро 👋';
        if (hour < 18) return 'Добрый день ☀️';
        return 'Добрый вечер 🌙';
    },

    debounce(fn, delay = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    throttle(fn, limit = 300) {
        let inThrottle = false;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Функция для демо-переключения тем
    cycleTheme() {
        const themes = ['default', 'jade', 'ruby', 'sapphire', 'amber', 'coral', 'amethyst'];
        const current = document.body.className.match(/theme-(\w+)/)?.[1] || 'default';
        const index = themes.indexOf(current);
        const next = themes[(index + 1) % themes.length];
        document.body.className = document.body.className
            .split(' ')
            .filter(c => !c.startsWith('theme-'))
            .join(' ');
        if (next !== 'default') {
            document.body.classList.add('theme-' + next);
        }
        this.toast(`🎨 Тема: ${next}`, 'info', 1500);
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark');
        this.toast(`🌓 ${document.body.classList.contains('dark') ? 'Темный' : 'Светлый'} режим`, 'info', 1500);
    }
};

window.UI = UI;