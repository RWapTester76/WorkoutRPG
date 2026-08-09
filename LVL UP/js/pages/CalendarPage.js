// js/pages/CalendarPage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';
import calendar from '../core/Calendar.js';

class CalendarPage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('taskChanged', () => this.render());
        
        // Инициализируем календарь при создании страницы
        if (!calendar.isInitialized) {
            calendar.init();
        }
    }

    render() {
        this.clear();
        this.setPageTitle('Календарь');

        const view = calendar.getView();
        const baseDate = calendar.getBaseDate();
        const selectedDate = calendar.getSelectedDate();
        const activeFilters = calendar.getActiveFilters();
        const selectedStr = selectedDate.toISOString().split('T')[0];

        // Фильтруем задачи
        const filteredTasks = data.tasks.filter(t => activeFilters.includes(t.journal));

        // Задачи для выбранного дня
        const dayTasks = filteredTasks.filter(task => {
            const dates = data.getDateRange(
                task.startDate || task.date,
                task.endDate || task.date
            );
            return dates.includes(selectedStr) && 
                (task.daysOfWeek.length === 0 || 
                task.daysOfWeek.includes(new Date(selectedStr).getDay()));
        });

        let calendarHTML = '';
        let dayDetailHTML = '';

        // Генерируем календарь в зависимости от представления
        if (view === 'day') {
            calendarHTML = `<div class="calendar-grid week">${this._renderDayView(baseDate, filteredTasks)}</div>`;
        } else if (view === 'week') {
            const week = calendar.getWeekData(baseDate);
            calendarHTML = `<div class="calendar-grid week">${week.map(d => 
                this._renderDayCell(d, filteredTasks, selectedDate)
            ).join('')}</div>`;
        } else if (view === 'month') {
            const year = baseDate.getFullYear();
            const month = baseDate.getMonth();
            const weeks = calendar.getMonthData(year, month);
            const weekDays = calendar.getWeekDays();
            
            calendarHTML = weekDays.map(d => `<div class="day-header">${d}</div>`).join('') +
                weeks.flat().map(cell => {
                    const date = new Date(cell.year, cell.month, cell.day);
                    return this._renderDayCell(date, filteredTasks, selectedDate, cell.isOtherMonth);
                }).join('');
        } else if (view === 'year') {
            const year = baseDate.getFullYear();
            const months = calendar.getYearData(year);
            calendarHTML = `<div class="year-grid">${months.map((m, idx) => {
                const hasTasks = filteredTasks.some(task => {
                    const start = new Date(task.startDate || task.date);
                    const end = new Date(task.endDate || task.date);
                    return (start.getFullYear() === year && start.getMonth() === idx) || 
                           (end.getFullYear() === year && end.getMonth() === idx);
                });
                return `<div class="month-card" data-month="${idx}">
                    <div class="month-name">${m.name}</div>
                    <div class="month-dots">${Array.from({length:7}, (_, i) => 
                        `<div class="dot ${i<3 && hasTasks ? 'has-task' : ''}"></div>`
                    ).join('')}</div>
                </div>`;
            }).join('')}</div>`;
        }

        // Детали дня
        if (dayTasks.length > 0) {
            dayDetailHTML = `
                <div class="calendar-day-detail">
                    <div class="day-title">📋 ${selectedDate.toLocaleDateString('ru-RU', { 
                        weekday:'long', 
                        day:'numeric', 
                        month:'long' 
                    })}</div>
                    <div class="day-tasks">${dayTasks.map(task => {
                        const status = data.getTaskStatus(task, selectedStr);
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
                                    data-task-id="${task.id}" data-date="${selectedStr}">${btnText}</button>
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
                    }).join('')}</div>
                </div>
            `;
        }

        this.renderHTML(`
            <div class="calendar-container">
                <div class="calendar-controls">
                    <div class="btn-group">
                        <button class="btn btn-sm ${view === 'day' ? 'active' : ''}" data-view="day">День</button>
                        <button class="btn btn-sm ${view === 'week' ? 'active' : ''}" data-view="week">Неделя</button>
                        <button class="btn btn-sm ${view === 'month' ? 'active' : ''}" data-view="month">Месяц</button>
                        <button class="btn btn-sm ${view === 'year' ? 'active' : ''}" data-view="year">Год</button>
                    </div>
                    <div class="calendar-nav">
                        <button data-nav="prev">◀</button>
                        <span class="title">${calendar.getTitle()}</span>
                        <button data-nav="next">▶</button>
                    </div>
                </div>
                <div class="calendar-filters" id="calendarFilters">
                    ${data.journals.map(j => {
                        const isActive = activeFilters.includes(j.name);
                        return `<span class="chip ${isActive ? 'active' : ''}" data-filter="${j.name}">
                            ${j.icon} ${j.name}
                        </span>`;
                    }).join('')}
                    <span class="chip" data-filter="all" style="background:var(--primary);color:#fff;">Все</span>
                </div>
                <div class="calendar-grid ${view === 'month' ? 'month' : view === 'week' ? 'week' : ''}">
                    ${calendarHTML}
                </div>
                ${dayDetailHTML}
            </div>
        `);

        // Навешиваем обработчики
        this._bindEvents();
    }

    _renderDayCell(date, tasks, selectedDate, isOtherMonth = false) {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => {
            const dates = data.getDateRange(
                task.startDate || task.date,
                task.endDate || task.date
            );
            return dates.includes(dateStr) && 
                (task.daysOfWeek.length === 0 || 
                task.daysOfWeek.includes(new Date(dateStr).getDay()));
        });

        const isToday = data.isSameDay(date, new Date());
        const isSelected = data.isSameDay(date, selectedDate);

        const badgeCounts = {};
        dayTasks.forEach(task => {
            const status = data.getTaskStatus(task, dateStr);
            if (status !== 'missed') {
                badgeCounts[task.journal] = (badgeCounts[task.journal] || 0) + 1;
            }
        });

        const badgeHTML = Object.entries(badgeCounts)
            .map(([name, count]) => `<span class="badge">${name}:${count}</span>`)
            .join('');

        let cls = 'calendar-cell';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        if (isOtherMonth) cls += ' other-month';

        return `<div class="${cls}" 
                    data-year="${date.getFullYear()}" 
                    data-month="${date.getMonth()}" 
                    data-day="${date.getDate()}">
            <div class="date">${date.getDate()}</div>
            ${badgeHTML ? `<div class="badge-container">${badgeHTML}</div>` : ''}
            ${dayTasks.length > 0 && !badgeHTML ? '<div class="task-indicator"></div>' : ''}
        </div>`;
    }

    _renderDayView(date, tasks) {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => {
            const dates = data.getDateRange(
                task.startDate || task.date,
                task.endDate || task.date
            );
            return dates.includes(dateStr) && 
                (task.daysOfWeek.length === 0 || 
                task.daysOfWeek.includes(new Date(dateStr).getDay()));
        });

        if (dayTasks.length === 0) {
            return '<div style="grid-column:span 7;text-align:center;padding:20px;color:var(--text-secondary);">Нет задач на этот день</div>';
        }

        return dayTasks.map(task => {
            const status = data.getTaskStatus(task, dateStr);
            const journal = data.getJournalByName(task.journal);
            const icon = journal ? journal.icon : '📌';
            const statusLabels = { done: '✅', pending: '⏳', missed: '❌' };
            
            let actions = '';
            if (status === 'pending' || status === 'missed') {
                const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
                const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
                actions = `<div class="task-actions">
                    <button class="btn btn-sm ${btnClass} complete-btn" 
                        data-task-id="${task.id}" data-date="${dateStr}">${btnText}</button>
                </div>`;
            }

            return `<div class="task-item" data-task-id="${task.id}" style="grid-column:span 7;">
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
        }).join('');
    }

    _bindEvents() {
        // Переключение видов
        this.findAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                calendar.setView(btn.dataset.view);
                this.render();
            });
        });

        // Навигация
        this.findAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = btn.dataset.nav === 'prev' ? -1 : 1;
                calendar.navigate(dir);
                this.render();
            });
        });

        // Клик по ячейке календаря
        this.findAll('.calendar-cell:not(.other-month)').forEach(el => {
            el.addEventListener('click', () => {
                const date = new Date(el.dataset.year, el.dataset.month, el.dataset.day);
                calendar.setSelectedDate(date);
                if (calendar.getView() !== 'day') calendar.setView('day');
                this.render();
            });
        });

        // Клик по месяцу в годовом виде
        this.findAll('.month-card').forEach(el => {
            el.addEventListener('click', () => {
                const month = parseInt(el.dataset.month, 10);
                const baseDate = calendar.getBaseDate();
                const year = baseDate.getFullYear();
                calendar.setBaseDate(new Date(year, month, 1));
                calendar.setView('month');
                this.render();
            });
        });

        // Фильтры
        this.findAll('#calendarFilters .chip[data-filter]').forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;
                if (filter === 'all') {
                    calendar.setAllFilters();
                } else {
                    calendar.toggleFilter(filter);
                }
                this.render();
            });
        });

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
        this.findAll('.task-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.complete-btn')) return;
                const taskId = el.dataset.taskId;
                if (taskId) this.ui.openTaskDetail(taskId);
            });
        });
    }
}

export default CalendarPage;