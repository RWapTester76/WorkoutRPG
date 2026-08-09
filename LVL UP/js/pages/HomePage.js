// js/pages/HomePage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class HomePage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('taskChanged', () => this.render());
        this.subscribe('goalChanged', () => this.render());
    }

    render() {
        this.clear();
        this.updateGreeting();
        this.updateAvatar();

        const profile = data.profile;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = data.getTodayTasks();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const totalTasks = data.tasks.length;
        const completedTasks = data.tasks.reduce((acc, t) => acc + t.completedDates.length, 0);
        const plannedToday = todayTasks.length;
        const missedToday = todayTasks.filter(t => data.getTaskStatus(t, today) === 'missed').length;

        let expWeek = 0,
            expMonth = 0;
        data.tasks.forEach(task => {
            task.completedDates.forEach(dateStr => {
                const d = new Date(dateStr);
                if (d >= weekAgo) expWeek += task.duration * 0.005;
                if (d >= monthAgo) expMonth += task.duration * 0.005;
            });
        });

        const { level, exp, needed } = data.recalcLevel();
        const topJournals = [...data.journals].sort((a, b) => b.exp - a.exp).slice(0, 4);

        this.setPageTitle('Главная');

        this.renderHTML(`
            <div class="level-card">
                <div class="level-header">
                    <div>
                        <div class="level-label">УРОВЕНЬ</div>
                        <div class="level-number">${level}</div>
                        <div style="font-size:14px; opacity:0.8; margin-top:4px;">${Math.floor(exp)} / ${needed} XP</div>
                    </div>
                    <div class="level-stats">
                        <span>🔥 ${profile.streak || 0} дней</span>
                        <span style="font-size:13px;">${Math.round((exp/needed)*100)}%</span>
                    </div>
                </div>
                <div class="progress"><div class="progress-bar" style="width: ${(exp/needed)*100}%;"></div></div>
            </div>

            <div class="home-stats-grid">
                <div class="stat-card"><div class="stat-number">${totalTasks}</div><div class="stat-label">Всего задач</div></div>
                <div class="stat-card"><div class="stat-number">${completedTasks}</div><div class="stat-label">Выполнено</div></div>
                <div class="stat-card"><div class="stat-number">${plannedToday}</div><div class="stat-label">Запланировано сегодня</div></div>
                <div class="stat-card"><div class="stat-number">${missedToday}</div><div class="stat-label">Пропущено сегодня</div></div>
            </div>

            <div class="home-exp-grid">
                <div class="stat-card"><div class="stat-number">${expWeek.toFixed(1)} XP</div><div class="stat-label">Опыт за неделю</div></div>
                <div class="stat-card"><div class="stat-number">${expMonth.toFixed(1)} XP</div><div class="stat-label">Опыт за месяц</div></div>
            </div>

            <div class="section-header"><h2>Журналы</h2><button class="btn btn-sm btn-secondary" data-nav="journals">Все →</button></div>
            <div class="journals-grid">
                ${topJournals.map(journal => {
                    const progress = Math.min((journal.exp / 1000) * 100, 100);
                    return `<div class="journal-card-mini" data-journal="${journal.name}">
                        <div class="journal-icon">${journal.icon || '📌'}</div>
                        <div class="journal-name">${journal.name.charAt(0).toUpperCase() + journal.name.slice(1)}</div>
                        <div class="journal-exp">${Math.floor(journal.exp)} XP</div>
                        <div class="journal-progress"><div class="fill" style="width: ${progress}%;"></div></div>
                    </div>`;
                }).join('')}
            </div>
        `);

        // Обработчики событий
        this.find('[data-nav="journals"]')?.addEventListener('click', () => {
            eventBus.publish('navigate', 'journals');
        });

        this.findAll('.journal-card-mini').forEach(el => {
            el.addEventListener('click', () => {
                const journalName = el.dataset.journal;
                eventBus.publish('navigate', 'journals');
                setTimeout(() => {
                    eventBus.publish('navigateToJournal', journalName);
                }, 100);
            });
        });

        // Обновляем бейдж целей
        const badge = document.getElementById('goalsBadge');
        if (badge) {
            const count = data.goals.filter(g => !g.achieved).length;
            badge.textContent = count;
            badge.className = 'badge' + (count > 0 ? ' show' : '');
        }
    }
}

export default HomePage;