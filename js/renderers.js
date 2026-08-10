/**
 * ============================================================
 * RENDERERS — ВСЕ ФУНКЦИИ ОТРИСОВКИ СТРАНИЦ
 * ============================================================
 */
import { Data } from './data.js';
import { Calendar } from './calendar.js';
import { UI } from './ui.js';
import { Utils } from './utils.js';
import { CONFIG } from './config.js';

export const Renderers = {
    renderHome: (container) => {
        const profile = Data.profile();
        const journals = Data.journals();
        const tasks = Data.tasks();
        const today = Utils.toDateStr(new Date());
        const todayTasks = Data.getTasksForDate(today);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        const totalTasks = tasks.length;
        const completedTasks = tasks.reduce((acc, t) => acc + (t.completedDates?.length || 0), 0);
        const plannedToday = todayTasks.length;
        const missedToday = todayTasks.filter(t => Data.getTaskStatus(t, today) === 'missed').length;

        let expWeek = 0,
            expMonth = 0;
        tasks.forEach(task => {
            (task.completedDates || []).forEach(dateStr => {
                const d = new Date(dateStr);
                if (d >= weekAgo) expWeek += task.duration * CONFIG.XP.TOTAL_PER_MIN;
                if (d >= monthAgo) expMonth += task.duration * CONFIG.XP.TOTAL_PER_MIN;
            });
        });

        const levelInfo = Data.getLevelInfo(profile.totalExp);
        const topJournals = [...journals].sort((a, b) => b.exp - a.exp).slice(0, 4);

        container.innerHTML = `
            <div class="level-card">
                <div class="level-header">
                    <div>
                        <div class="level-label">УРОВЕНЬ</div>
                        <div class="level-number">${levelInfo.level}</div>
                        <div style="font-size:14px; opacity:0.8; margin-top:4px;">
                            ${Math.floor(levelInfo.expInLevel)} / ${levelInfo.neededForNext} XP
                        </div>
                    </div>
                    <div class="level-stats">
                        <span>🔥 ${profile.streak || 0} дней</span>
                        <span style="font-size:13px;">${Math.round(levelInfo.progress)}%</span>
                    </div>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${levelInfo.progress}%;"></div>
                </div>
            </div>

            <div class="home-stats-grid">
                <div class="stat-card"><div class="stat-number">${totalTasks}</div><div class="stat-label">Всего задач</div></div>
                <div class="stat-card"><div class="stat-number">${completedTasks}</div><div class="stat-label">Выполнено</div></div>
                <div class="stat-card"><div class="stat-number">${plannedToday}</div><div class="stat-label">Запланировано сегодня</div></div>
                <div class="stat-card"><div class="stat-number">${missedToday}</div><div class="stat-label">Пропущено сегодня</div></div>
            </div>

            <div class="home-exp-grid">
                <div class="stat-card"><div class="stat-number">${Utils.round(expWeek, 1)} XP</div><div class="stat-label">Опыт за неделю</div></div>
                <div class="stat-card"><div class="stat-number">${Utils.round(expMonth, 1)} XP</div><div class="stat-label">Опыт за месяц</div></div>
            </div>

            <div class="section-header">
                <h2>Журналы</h2>
                <button class="btn btn-sm btn-secondary" data-nav="journals">Все →</button>
            </div>
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
        `;
    },

    renderJournals: (container) => {
        // Если есть контекст — показываем задачи журнала
        if (window._journalContext?.journalName) {
            Renderers._renderJournalTasks(container, window._journalContext.journalName);
            return;
        }

        const journals = Data.journals();
        container.innerHTML = `
            <div class="section-header">
                <h2>Все журналы</h2>
                <button class="btn btn-sm btn-secondary" id="showAllTasksFromJournals">📋 Все задачи</button>
            </div>
            <div class="journals-grid">
                ${journals.map(j => {
                    const tasks = Data.tasks().filter(t => t.journal === j.name);
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
        `;
    },

    _renderJournalTasks: (container, journalName) => {
        const journal = Data.getJournalByName(journalName);
        if (!journal) {
            window._journalContext = null;
            Renderers.renderJournals(container);
            return;
        }

        const tasks = Data.tasks().filter(t => t.journal === journalName);
        const today = Utils.toDateStr(new Date());

        container.innerHTML = `
            <div class="section-header">
                <h2>📚 ${journalName.charAt(0).toUpperCase() + journalName.slice(1)} — задачи</h2>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-secondary" id="backToJournalsFromTasks">← Назад</button>
                    <button class="btn btn-sm" id="addTaskToJournal">➕ Добавить задачу</button>
                </div>
            </div>
            ${tasks.length === 0 ? `
                <div class="tasks-empty"><div class="empty-icon">📭</div><p>В этом журнале пока нет задач</p></div>
            ` : `
                <div class="tasks-list">
                    ${tasks.slice().sort((a,b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).map(task => {
                        const status = Data.getTaskStatus(task, today);
                        const icon = journal.icon || '📌';
                        const statusLabels = { done:'✅ Выполнено', pending:'⏳ Ожидает', missed:'❌ Пропущено' };
                        let actions = '';
                        if (status === 'pending' || status === 'missed') {
                            const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
                            const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
                            actions = `<div class="task-actions"><button class="btn btn-sm ${btnClass} complete-btn" data-task-id="${task.id}" data-date="${today}">${btnText}</button></div>`;
                        }
                        return `<div class="task-item" data-task-id="${task.id}">
                            <div class="task-icon">${icon}</div>
                            <div class="task-info">
                                <div class="task-title">${task.title}</div>
                                <div class="task-meta"><span>${task.time || '—'}</span><span>${task.duration || 0} мин</span><span>${task.journal}</span></div>
                            </div>
                            <span class="task-status ${status}">${statusLabels[status] || status}</span>
                            ${actions}
                        </div>`;
                    }).join('')}
                </div>
            `}
        `;
    },

    renderCalendar: (container) => {
        const view = Calendar.getView();
        const baseDate = Calendar.getBaseDate();
        const selectedDate = Calendar.getSelectedDate();
        const tasks = Data.tasks();
        const journals = Data.journals();
        const activeFilters = Calendar.getActiveFilters();
        const selectedStr = Utils.toDateStr(selectedDate);

        const filteredTasks = tasks.filter(t => activeFilters.includes(t.journal));

        const dayTasks = filteredTasks.filter(task => {
            const dates = Data.getDateRange(task.startDate || task.date, task.endDate || task.date);
            return dates.includes(selectedStr) && (task.daysOfWeek.length === 0 || task.daysOfWeek.includes(
                new Date(selectedStr).getDay()));
        });

        let calendarHTML = '';
        let dayDetailHTML = '';

        if (view === 'day') {
            calendarHTML =
                `<div class="calendar-grid week">${Renderers._renderDayView(baseDate, filteredTasks)}</div>`;
        } else if (view === 'week') {
            const week = Calendar.getWeekData(baseDate);
            calendarHTML =
                `<div class="calendar-grid week">${week.map(d => Renderers._renderDayCell(d, filteredTasks, selectedDate)).join('')}</div>`;
        } else if (view === 'month') {
            const year = baseDate.getFullYear();
            const month = baseDate.getMonth();
            const weeks = Calendar.getMonthData(year, month);
            const weekDays = Calendar.getWeekDays();
            calendarHTML = weekDays.map(d => `<div class="day-header">${d}</div>`).join('') +
                weeks.flat().map(cell => {
                    const date = new Date(cell.year, cell.month, cell.day);
                    return Renderers._renderDayCell(date, filteredTasks, selectedDate, cell.isOtherMonth);
                }).join('');
        } else if (view === 'year') {
            const year = baseDate.getFullYear();
            const months = Calendar.getYearData(year);
            calendarHTML =
            `<div class="year-grid">${months.map((m, idx) => {
                const hasTasks = filteredTasks.some(task => {
                    const start = new Date(task.startDate || task.date);
                    const end = new Date(task.endDate || task.date);
                    return (start.getFullYear() === year && start.getMonth() === idx) || (end.getFullYear() === year && end.getMonth() === idx);
                });
                return `<div class="month-card" data-month="${idx}"><div class="month-name">${m.name}</div><div class="month-dots">${Array.from({length:7}, (_, i) => `<div class="dot ${i<3 && hasTasks ? 'has-task' : ''}"></div>`).join('')}</div></div>`;
            }).join('')}</div>`;
        }

        if (dayTasks.length > 0) {
            dayDetailHTML =
            `<div class="calendar-day-detail"><div class="day-title">📋 ${selectedDate.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}</div><div class="day-tasks">${dayTasks.map(task => {
                const status = Data.getTaskStatus(task, selectedStr);
                const journal = Data.getJournalByName(task.journal);
                const icon = journal ? journal.icon : '📌';
                const statusLabels = { done:'✅ Выполнено', pending:'⏳ Ожидает', missed:'❌ Пропущено' };
                let actions = '';
                if (status === 'pending' || status === 'missed') {
                    const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
                    const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
                    actions = `<div class="task-actions"><button class="btn btn-sm ${btnClass} complete-btn" data-task-id="${task.id}" data-date="${selectedStr}">${btnText}</button></div>`;
                }
                return `<div class="task-item" data-task-id="${task.id}">
                    <div class="task-icon">${icon}</div>
                    <div class="task-info"><div class="task-title">${task.title}</div><div class="task-meta"><span>${task.time || '—'}</span><span>${task.duration || 0} мин</span><span>${task.journal}</span></div></div>
                    <span class="task-status ${status}">${statusLabels[status] || status}</span>
                    ${actions}
                </div>`;
            }).join('')}</div></div>`;
        }

        container.innerHTML = `
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
                        <span class="title">${Calendar.getTitle()}</span>
                        <button data-nav="next">▶</button>
                    </div>
                </div>
                <div class="calendar-filters" id="calendarFilters">
                    ${journals.map(j => {
                        const isActive = activeFilters.includes(j.name);
                        return `<span class="chip ${isActive ? 'active' : ''}" data-filter="${j.name}">${j.icon} ${j.name}</span>`;
                    }).join('')}
                    <span class="chip" data-filter="all" style="background:var(--primary);color:#fff;">Все</span>
                </div>
                <div class="calendar-grid ${view === 'month' ? 'month' : view === 'week' ? 'week' : ''}">
                    ${calendarHTML}
                </div>
                ${dayDetailHTML}
            </div>
        `;
    },

    _renderDayCell: (date, tasks, selectedDate, isOtherMonth = false) => {
        const dateStr = Utils.toDateStr(date);
        const dayTasks = tasks.filter(task => {
            const dates = Data.getDateRange(task.startDate || task.date, task.endDate || task.date);
            return dates.includes(dateStr) && (task.daysOfWeek.length === 0 || task.daysOfWeek.includes(
                new Date(dateStr).getDay()));
        });
        const isToday = Utils.isToday(date);
        const isSelected = date.toDateString() === selectedDate.toDateString();

        const badgeCounts = {};
        dayTasks.forEach(task => {
            const status = Data.getTaskStatus(task, dateStr);
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

        return `<div class="${cls}" data-year="${date.getFullYear()}" data-month="${date.getMonth()}" data-day="${date.getDate()}">
            <div class="date">${date.getDate()}</div>
            ${badgeHTML ? `<div class="badge-container">${badgeHTML}</div>` : ''}
            ${dayTasks.length > 0 && !badgeHTML ? '<div class="task-indicator"></div>' : ''}
        </div>`;
    },

    _renderDayView: (date, tasks) => {
        const dateStr = Utils.toDateStr(date);
        const dayTasks = tasks.filter(task => {
            const dates = Data.getDateRange(task.startDate || task.date, task.endDate || task.date);
            return dates.includes(dateStr) && (task.daysOfWeek.length === 0 || task.daysOfWeek.includes(
                new Date(dateStr).getDay()));
        });
        if (dayTasks.length === 0) {
            return '<div style="grid-column:span 7;text-align:center;padding:20px;color:var(--text-secondary);">Нет задач на этот день</div>';
        }
        return dayTasks.map(task => {
            const status = Data.getTaskStatus(task, dateStr);
            const journal = Data.getJournalByName(task.journal);
            const icon = journal ? journal.icon : '📌';
            const statusLabels = { done: '✅', pending: '⏳', missed: '❌' };
            let actions = '';
            if (status === 'pending' || status === 'missed') {
                const btnClass = status === 'missed' ? 'btn-warning' : 'btn-success';
                const btnText = status === 'missed' ? 'Восстановить' : 'Выполнить';
                actions =
                    `<div class="task-actions"><button class="btn btn-sm ${btnClass} complete-btn" data-task-id="${task.id}" data-date="${dateStr}">${btnText}</button></div>`;
            }
            return `<div class="task-item" data-task-id="${task.id}" style="grid-column:span 7;">
                <div class="task-icon">${icon}</div>
                <div class="task-info"><div class="task-title">${task.title}</div><div class="task-meta"><span>${task.time || '—'}</span><span>${task.duration || 0} мин</span><span>${task.journal}</span></div></div>
                <span class="task-status ${status}">${statusLabels[status] || status}</span>
                ${actions}
            </div>`;
        }).join('');
    },

    renderGoals: (container) => {
        const goals = Data.goals();
        container.innerHTML =
            `<div class="section-header"><h2>Цели</h2><button class="btn" id="addGoalBtn">+ Новая цель</button></div>`;

        if (goals.length === 0) {
            container.innerHTML +=
                `<div class="tasks-empty"><div class="empty-icon">🎯</div><p>У вас пока нет целей</p><p style="color:var(--text-secondary)">Создайте первую цель!</p></div>`;
            return;
        }

        goals.forEach(goal => {
            const tasks = Data.tasks().filter(t => t.goalId === goal.id);
            const done = tasks.reduce((acc, t) => acc + (t.completedDates?.length || 0), 0);
            const total = tasks.reduce((acc, t) => {
                const start = t.startDate || t.date;
                const end = t.endDate || t.date;
                return acc + Data.getDateRange(start, end).length;
            }, 0);
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const checkpoints = goal.checkpoints?.map(d => Utils.formatDate(d)).join(', ') || '—';

            container.innerHTML += `
                <div class="goal-card" data-goal-id="${goal.id}">
                    <div class="goal-header">
                        <div>
                            <div class="goal-title">${goal.title}</div>
                            <div class="goal-desc">${goal.description || 'Без описания'}</div>
                        </div>
                        <span class="chip ${goal.achieved ? 'active' : ''}">${goal.achieved ? '✅ Достигнута' : 'В процессе'}</span>
                    </div>
                    <div class="goal-meta"><span>📅 Дедлайн: ${Utils.formatDate(goal.deadline)}</span><span>🎯 Контрольные точки: ${checkpoints}</span></div>
                    <div class="goal-progress"><div class="progress"><div class="progress-bar" style="width:${progress}%;"></div></div></div>
                    <div class="goal-meta"><span>${done}/${total} задач выполнено</span></div>
                    <div class="goal-actions">
                        <button class="btn btn-sm btn-secondary edit-goal-btn" data-goal-id="${goal.id}">✏️</button>
                        <button class="btn btn-sm btn-danger delete-goal-btn" data-goal-id="${goal.id}">🗑</button>
                    </div>
                </div>
            `;
        });
    },

    renderProfile: (container) => {
        const profile = Data.profile();
        const levelInfo = Data.getLevelInfo(profile.totalExp);
        const journals = Data.journals();
        const weightLog = Data.weightLog().slice().sort((a, b) => b.date.localeCompare(a.date));

        const stats = journals.map(j => {
            const tasks = Data.tasks().filter(t => t.journal === j.name);
            const total = tasks.length;
            const done = tasks.reduce((acc, t) => acc + (t.completedDates?.length || 0), 0);
            const missed = tasks.reduce((acc, t) => acc + (t.missedDates?.length || 0), 0);
            return { ...j, total, done, missed };
        }).sort((a, b) => b.total - a.total);

        container.innerHTML = `
            <div class="card" style="text-align:center;">
                <div class="avatar avatar-xl" style="margin:0 auto;width:88px;height:88px;font-size:36px;position:relative;">
                    ${profile.avatar ? `<img src="${profile.avatar}" alt="avatar">` : `<span>${profile.name.charAt(0).toUpperCase()}</span>`}
                    <input type="file" id="profileAvatarInput" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
                </div>
                <h2 style="font-size:24px;margin-top:12px;">${profile.name}</h2>
                <p style="color:var(--text-secondary);">Уровень ${levelInfo.level} · ${Math.floor(levelInfo.expInLevel)} / ${levelInfo.neededForNext} XP</p>
                <div style="margin-top:12px;">
                    <div class="progress" style="height:8px; background:var(--card-border);">
                        <div class="progress-bar" style="width:${levelInfo.progress}%;"></div>
                    </div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">${Math.round(levelInfo.progress)}% до следующего уровня</div>
                </div>
                <div style="display:flex;justify-content:center;gap:24px;margin-top:16px;flex-wrap:wrap;">
                    <div><span style="font-size:20px;font-weight:700;">${profile.streak || 0}</span><br><span style="font-size:13px;color:var(--text-secondary);">🔥 Дней</span></div>
                    <div><span style="font-size:20px;font-weight:700;">${profile.age}</span><br><span style="font-size:13px;color:var(--text-secondary);">Возраст</span></div>
                    <div><span style="font-size:20px;font-weight:700;">${profile.weight} кг</span><br><span style="font-size:13px;color:var(--text-secondary);">Вес</span></div>
                </div>
            </div>

            <div class="card" style="margin-top:16px;">
                <h3 style="font-size:18px;font-weight:600;margin-bottom:12px;">📝 Редактировать профиль</h3>
                <div class="form-group">
                    <label class="input-label">Имя</label>
                    <input type="text" class="input" id="pName" value="${profile.name}">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div><label class="input-label">Рост (см)</label><input type="number" class="input" id="pHeight" value="${profile.height}" step="0.1"></div>
                    <div><label class="input-label">Вес (кг)</label><input type="number" class="input" id="pWeight" value="${profile.weight}" step="0.1"></div>
                    <div><label class="input-label">Возраст</label><input type="number" class="input" id="pAge" value="${profile.age}"></div>
                    <div><label class="input-label">Шея (см)</label><input type="number" class="input" id="pNeck" value="${profile.neck || 0}" step="0.5"></div>
                    <div><label class="input-label">Грудь (см)</label><input type="number" class="input" id="pChest" value="${profile.chest}" step="0.5"></div>
                    <div><label class="input-label">Талия (см)</label><input type="number" class="input" id="pWaist" value="${profile.waist}" step="0.5"></div>
                    <div><label class="input-label">Бёдра (см)</label><input type="number" class="input" id="pHips" value="${profile.hips}" step="0.5"></div>
                    <div><label class="input-label">Бицепс (см)</label><input type="number" class="input" id="pBiceps" value="${profile.biceps}" step="0.5"></div>
                </div>
                <button class="btn" id="saveProfileBtn" style="width:100%;margin-top:16px;">💾 Сохранить профиль</button>
            </div>

            <div class="card" style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-size:18px;font-weight:600;">⚖️ Журнал веса</h3>
                    <button class="btn btn-sm" id="addWeightBtn">+ Добавить</button>
                </div>
                <div style="max-height:200px;overflow-y:auto;">
                    ${weightLog.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:var(--text-secondary);">Нет записей</div>
                    ` : weightLog.slice(0, 7).map(w => `
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--card-border);">
                            <span>${Utils.formatDate(w.date, 'short')}</span>
                            <span><strong>${w.value} кг</strong></span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" style="margin-top:16px;">
                <h3 style="font-size:18px;font-weight:600;margin-bottom:12px;">📊 Статистика по журналам</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${stats.map(s => `
                        <div style="background:var(--card-border);padding:8px;border-radius:var(--radius-sm);">
                            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:500;">
                                <span>${s.icon} ${s.name.charAt(0).toUpperCase() + s.name.slice(1)}</span>
                                <span>${s.total} задач</span>
                            </div>
                            <div style="display:flex;gap:8px;font-size:12px;color:var(--text-secondary);margin-top:4px;">
                                <span>✅ ${s.done}</span>
                                <span>❌ ${s.missed}</span>
                                <span>${s.total > 0 ? Math.round((s.done / s.total) * 100) : 0}%</span>
                            </div>
                            <div class="progress" style="height:4px;margin-top:4px;">
                                <div class="progress-bar" style="width:${s.total > 0 ? (s.done / s.total) * 100 : 0}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderNotes: (container) => {
        const notes = Data.notes();
        container.innerHTML =
            `<div class="section-header"><h2>Заметки</h2><button class="btn" id="addNoteBtn">+ Новая заметка</button></div>`;

        if (notes.length === 0) {
            container.innerHTML +=
                `<div class="tasks-empty"><div class="empty-icon">📝</div><p>Заметок пока нет</p><p style="color:var(--text-secondary)">Создайте первую заметку</p></div>`;
            return;
        }

        notes.slice().reverse().forEach(note => {
            const task = Data.tasks().find(t => t.id === note.taskId);
            container.innerHTML += `
                <div class="note-item" data-note-id="${note.id}">
                    <div class="note-text">
                        <div style="font-weight:500;">${note.text}</div>
                        <div class="note-date">${Utils.formatDate(note.createdAt, 'datetime')} ${task ? '→ ' + task.title : ''}</div>
                    </div>
                    <div class="note-actions">
                        <button class="btn btn-sm btn-secondary edit-note-btn" data-note-id="${note.id}">✏️</button>
                        <button class="btn btn-sm btn-danger delete-note-btn" data-note-id="${note.id}">🗑</button>
                    </div>
                </div>
            `;
        });
    },

    renderGallery: (container) => {
        const photos = Data.photos();
        container.innerHTML =
            `<div class="section-header"><h2>Галерея</h2><button class="btn" id="addPhotoBtn">+ Добавить фото</button></div>`;

        if (photos.length === 0) {
            container.innerHTML +=
                `<div class="tasks-empty"><div class="empty-icon">🖼</div><p>Фото пока нет</p><p style="color:var(--text-secondary)">Добавьте первое фото</p></div>`;
            return;
        }

        container.innerHTML += `<div class="photo-grid">`;
        photos.slice().reverse().forEach(photo => {
            container.innerHTML += `
                <div class="photo-item" data-photo-id="${photo.id}">
                    <img src="${photo.data}" alt="Фото">
                    <div class="photo-meta">${photo.note ? photo.note : ''} ${Utils.formatDate(photo.date, 'short')}</div>
                    <button class="photo-delete" data-photo-id="${photo.id}">✕</button>
                </div>
            `;
        });
        container.innerHTML += `</div>`;
    },

    renderSettings: (container) => {
        const isDark = document.body.classList.contains('dark');
        const currentTheme = document.body.className.match(/theme-(\w+)/)?.[1] || 'default';

        container.innerHTML = `
            <div class="card" style="max-width:500px; margin:0 auto;">
                <h3 style="font-size:20px; font-weight:600; margin-bottom:20px;">⚙️ Настройки</h3>
                <div style="display:grid; gap:20px;">
                    <div class="form-group">
                        <label class="input-label">Тёмный режим</label>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <label class="switch"><input type="checkbox" id="settingsDarkMode" ${isDark ? 'checked' : ''}><span class="slider"></span></label>
                            <span class="body-2" id="darkModeLabel">${isDark ? 'Вкл' : 'Выкл'}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="input-label">Цветовая тема</label>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            ${['default','jade','ruby','sapphire','amber','coral','amethyst'].map(t => {
                                const isActive = currentTheme === t;
                                const colors = {
                                    default: 'var(--card)',
                                    jade: '#00b894',
                                    ruby: '#e17055',
                                    sapphire: '#0984e3',
                                    amber: '#fdcb6e',
                                    coral: '#e17055',
                                    amethyst: '#a29bfe'
                                };
                                const textColor = t === 'amber' ? '#1a1a2e' : '#fff';
                                return `<span class="chip ${isActive ? 'active' : ''}" data-theme="${t}" style="background:${colors[t]}; color:${textColor}; border-color:${isActive ? 'var(--primary)' : 'transparent'};">${t.charAt(0).toUpperCase() + t.slice(1)}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="form-group"><label class="input-label">Экспорт данных</label><button class="btn btn-sm" id="exportDataBtn">📤 Скачать JSON</button></div>
                        <div class="form-group"><label class="input-label">Импорт данных</label><input type="file" id="importDataInput" accept=".json" style="display:none;"><button class="btn btn-sm btn-secondary" id="importDataBtn">📥 Загрузить JSON</button></div>
                    </div>
                    <div class="form-group">
                        <label class="input-label">Сбросить все данные</label>
                        <button class="btn btn-sm btn-danger" id="resetDataBtn">🗑 Сбросить всё</button>
                        <span style="font-size:12px;color:var(--text-secondary);">Все данные будут удалены безвозвратно</span>
                    </div>
                    <div class="btn-group" style="justify-content:flex-end;">
                        <button class="btn btn-secondary" id="settingsCloseBtn">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
    }
};