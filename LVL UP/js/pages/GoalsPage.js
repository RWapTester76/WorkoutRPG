// js/pages/GoalsPage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class GoalsPage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('goalChanged', () => this.render());
        this.subscribe('taskChanged', () => this.render());
    }

    render() {
        this.clear();
        this.setPageTitle('Цели');

        const goals = data.goals;

        this.renderHTML(`
            <div class="section-header">
                <h2>Цели</h2>
                <button class="btn" id="addGoalBtn">+ Новая цель</button>
            </div>
            ${goals.length === 0 ? `
                <div class="tasks-empty">
                    <div class="empty-icon">🎯</div>
                    <p>У вас пока нет целей</p>
                    <p style="color:var(--text-secondary)">Создайте первую цель!</p>
                </div>
            ` : `
                ${goals.map(goal => this._renderGoalCard(goal)).join('')}
            `}
        `);

        // Кнопка "Новая цель"
        this.find('#addGoalBtn')?.addEventListener('click', () => {
            this.ui.openGoalModal();
        });

        // Обработчики для карточек целей
        this.findAll('.goal-card').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const id = el.dataset.goalId;
                const goal = data.goals.find(g => g.id === id);
                if (goal) {
                    this.ui.toast(
                        `🎯 ${goal.title} — ${goal.achieved ? 'Достигнута' : 'В процессе'}`,
                        'info'
                    );
                }
            });
        });

        // Кнопки "Редактировать"
        this.findAll('.edit-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.openGoalModal(btn.dataset.goalId);
            });
        });

        // Кнопки "Удалить"
        this.findAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.deleteGoal(btn.dataset.goalId);
            });
        });
    }

    _renderGoalCard(goal) {
        const tasks = data.tasks.filter(t => t.goalId === goal.id);
        const done = tasks.reduce((acc, t) => acc + t.completedDates.length, 0);
        const total = tasks.reduce((acc, t) => {
            const start = t.startDate || t.date;
            const end = t.endDate || t.date;
            return acc + data.getDateRange(start, end).length;
        }, 0);
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        const checkpoints = goal.checkpoints ? 
            goal.checkpoints.map(d => this.ui.formatDate(d)).join(', ') : 
            '—';

        return `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <div>
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-desc">${goal.description || 'Без описания'}</div>
                    </div>
                    <span class="chip ${goal.achieved ? 'active' : ''}">
                        ${goal.achieved ? '✅ Достигнута' : 'В процессе'}
                    </span>
                </div>
                <div class="goal-meta">
                    <span>📅 Дедлайн: ${this.ui.formatDate(goal.deadline)}</span>
                    <span>🎯 Контрольные точки: ${checkpoints}</span>
                </div>
                <div class="goal-progress">
                    <div class="progress">
                        <div class="progress-bar" style="width:${progress}%;"></div>
                    </div>
                </div>
                <div class="goal-meta">
                    <span>${done}/${total} задач выполнено</span>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-sm btn-secondary edit-goal-btn" data-goal-id="${goal.id}">✏️</button>
                    <button class="btn btn-sm btn-danger delete-goal-btn" data-goal-id="${goal.id}">🗑</button>
                </div>
            </div>
        `;
    }
}

export default GoalsPage;