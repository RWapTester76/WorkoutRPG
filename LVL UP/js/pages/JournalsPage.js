// js/pages/JournalsPage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class JournalsPage extends BasePage {
    constructor() {
        super();
        this.currentJournal = null;
        this.showAllTasks = false;
        
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('taskChanged', () => this.render());
    }

    render() {
        if (this.currentJournal) {
            this.renderJournalTasks();
        } else if (this.showAllTasks) {
            this.renderAllTasks();
        } else {
            this.renderJournalsList();
        }
    }

    navigateToJournal(journalName) {
        this.currentJournal = journalName;
        this.showAllTasks = false;
        this.render();
    }

    showAllTasksList() {
        this.showAllTasks = true;
        this.currentJournal = null;
        this.render();
    }

    goBack() {
        this.currentJournal = null;
        this.showAllTasks = false;
        this.render();
    }

    renderJournalsList() {
        this.clear();
        this.setPageTitle('Журналы');

        const journals = data.journals;

        this.renderHTML(`
            <div class="section-header">
                <h2>Все журналы</h2>
                <button class="btn btn-sm btn-secondary" id="showAllTasksBtn">📋 Все задачи</button>
            </div>
            <div class="journals-grid">
                ${journals.map(j => {
                    const tasks = data.tasks.filter(t => t.journal === j.name);
                    const progress = Math.min((j.exp / 1000) * 100, 100);
                    return `<div class="journal-card-mini" data-journal="${j.name}">
                        <div class="journal-icon" style="font-size:40px;">${j.icon || '📌'}</div>
                        <div class="journal-name">${j.name.charAt(0).toUpperCase() + j.name.slice(1)}</div>
                        <div class="journal-exp">${Math.floor(j.exp)} XP</div>
                        <div class="journal-progress"><div class="fill" style="width:${progress}%;"></div></div>
                        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${tasks.length} задач</div>
                    </div>`;
                }).join('')}
            </div>
        `);

        // Кнопка "Все задачи"
        this.find('#showAllTasksBtn')?.addEventListener('click', () => {
            this.showAllTasksList();
        });

        // Клик по карточке журнала
        this.findAll('.journal-card-mini').forEach(el => {
            el.addEventListener('click', () => {
                this.navigateToJournal(el.dataset.journal);
            });
        });
    }

    renderJournalTasks() {
        const journal = data.getJournalByName(this.currentJournal);
        if (!journal) {
            this.currentJournal = null;
            this.render();
            return;
        }

        this.clear();
        this.setPageTitle(`📚 ${journal.name.charAt(0).toUpperCase() + journal.name.slice(1)}`);

        const tasks = data.tasks.filter(t => t.journal === this.currentJournal);

        this.renderHTML(`
            <div class="section-header">
                <h2>${journal.icon} ${journal.name.charAt(0).toUpperCase() + journal.name.slice(1)} — задачи</h2>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="backToJournalsBtn">← Назад</button>
                    <button class="btn btn-sm" id="addTaskBtn">➕ Добавить задачу</button>
                </div>
            </div>
            ${tasks.length === 0 ? `
                <div class="tasks-empty">
                    <div class="empty-icon">📭</div>
                    <p>В этом журнале пока нет задач</p>
                </div>
            ` : `
                <div class="tasks-list">
                    ${tasks.slice().sort((a, b) => 
                        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
                    ).map(task => this._renderTaskItem(task, journal)).join('')}
                </div>
            `}
        `);

        // Кнопка "Назад"
        this.find('#backToJournalsBtn')?.addEventListener('click', () => {
            this.goBack();
        });

        // Кнопка "Добавить задачу"
        this.find('#addTaskBtn')?.addEventListener('click', () => {
            this.ui.openTaskModal(null, this.currentJournal);
        });

        // Обработчики задач
        this._bindTaskEvents();
    }

    renderAllTasks() {
        this.clear();
        this.setPageTitle('📋 Все задачи');

        const tasks = data.tasks;
        let filterJournal = 'all';
        let filterStatus = 'all';

        if (tasks.length === 0) {
            this.renderHTML(`
                <div class="section-header">
                    <h2>Все задачи</h2>
                    <button class="btn btn-sm btn-secondary" id="backToJournalsBtn">← Назад</button>
                </div>
                <div class="tasks-empty">
                    <div class="empty-icon">📭</div>
                    <p>Задач пока нет</p>
                </div>
            `);
            this.find('#backToJournalsBtn')?.addEventListener('click', () => {
                this.goBack();
            });
            return;
        }

        this.renderHTML(`
            <div class="section-header">
                <h2>Все задачи</h2>
                <button class="btn btn-sm btn-secondary" id="backToJournalsBtn">← Назад</button>
            </div>
            <div class="all-task-filters" id="journalFilters">
                <span class="chip active" data-filter-journal="all">Все журналы</span>
                ${data.journals.map(j => 
                    `<span class="chip" data-filter-journal="${j.name}">${j.icon} ${j.name}</span>`
                ).join('')}
            </div>
            <div class="all-task-filters" id="statusFilters">
                <span class="chip active" data-filter-status="all">Все статусы</span>
                <span class="chip" data-filter-status="pending">⏳ Ожидает</span>
                <span class="chip" data-filter-status="done">✅ Выполнено</span>
                <span class="chip" data-filter-status="missed">❌ Пропущено</span>
            </div>
            <div id="allTasksList">
                ${tasks.slice().sort((a, b) => 
                    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
                ).map(task => {
                    const today = new Date().toISOString().split('T')[0];
                    const status = data.getTaskStatus(task, today);
                    const journal = data.getJournalByName(task.journal);
                    const icon = journal ? journal.icon : '📌';
                    const statusLabels = { 
                        done: '✅ Выполнено', 
                        pending: '⏳ Ожидает', 
                        missed: '❌ Пропущено' 
                    };
                    
                    let actions = '';
                    if (status === 'pending' || status === 'missed') {
                        const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
                        const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
                        actions = `<div class="task-actions">
                            <button class="btn btn-sm ${btnClass} complete-btn" 
                                data-task-id="${task.id}" data-date="${today}">${btnText}</button>
                        </div>`;
                    }

                    return `
                        <div class="all-task-item" data-task-id="${task.id}" 
                             data-journal="${task.journal}" data-status="${status}">
                            <div class="task-info-text">
                                <div style="font-weight:500;">${icon} ${task.title}</div>
                                <div class="task-meta-text">
                                    ${task.journal} · ${task.time || '—'} · ${task.duration || 0} мин · 
                                    Обновлено: ${this.ui.formatDate(task.updatedAt || task.createdAt, 'datetime')}
                                </div>
                            </div>
                            <span class="task-status ${status}">${statusLabels[status] || status}</span>
                            ${actions}
                        </div>
                    `;
                }).join('')}
            </div>
        `);

        // Кнопка "Назад"
        this.find('#backToJournalsBtn')?.addEventListener('click', () => {
            this.goBack();
        });

        // Фильтры
        this.findAll('#journalFilters .chip').forEach(chip => {
            chip.addEventListener('click', function() {
                this.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                filterJournal = this.dataset.filterJournal;
                applyFilters();
            });
        });

        this.findAll('#statusFilters .chip').forEach(chip => {
            chip.addEventListener('click', function() {
                this.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                filterStatus = this.dataset.filterStatus;
                applyFilters();
            });
        });

        const applyFilters = () => {
            this.findAll('.all-task-item').forEach(item => {
                const journal = item.dataset.journal;
                const status = item.dataset.status;
                let show = true;
                if (filterJournal !== 'all' && journal !== filterJournal) show = false;
                if (filterStatus !== 'all' && status !== filterStatus) show = false;
                item.style.display = show ? 'flex' : 'none';
            });
        };

        this._bindTaskEvents();
    }

    _renderTaskItem(task, journal) {
        const today = new Date().toISOString().split('T')[0];
        const status = data.getTaskStatus(task, today);
        const icon = journal.icon || '📌';
        const statusLabels = { 
            done: '✅ Выполнено', 
            pending: '⏳ Ожидает', 
            missed: '❌ Пропущено' 
        };

        let actions = '';
        if (status === 'pending' || status === 'missed') {
            const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
            const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
            actions = `<div class="task-actions">
                <button class="btn btn-sm ${btnClass} complete-btn" 
                    data-task-id="${task.id}" data-date="${today}">${btnText}</button>
            </div>`;
        }

        return `<div class="task-item" data-task-id="${task.id}">
            <div class="task-icon">${icon}</div>
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>${task.time || '—'}</span>
                    <span>${task.duration || 0} мин</span>
                    <span>${task.journal}</span>
                </div>
            </div>
            <span class="task-status ${status}">${statusLabels[status] || status}</span>
            ${actions}
        </div>`;
    }

    _bindTaskEvents() {
        // Кнопки "Выполнить"
        this.findAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.dataset.taskId;
                const dateStr = btn.dataset.date;
                const earned = data.completeTaskInstance(taskId, dateStr);
                if (earned) {
                    this.ui.toast(`✅ Задача выполнена! +${earned.toFixed(2)} XP`, 'success');
                    this.render();
                } else {
                    this.ui.toast('⚠️ Не удалось выполнить задачу', 'error');
                }
            });
        });

        // Клик по задаче для открытия деталей
        this.findAll('.task-item, .all-task-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.complete-btn')) return;
                const taskId = el.dataset.taskId;
                if (taskId) this.ui.openTaskDetail(taskId);
            });
        });
    }
}

export default JournalsPage;