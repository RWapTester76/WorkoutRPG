// ============================================================
//  APP — Главный контроллер
// ============================================================

const App = {
    _unsubscribe: null,
    _currentPage: 'home',

    // ===================== ИНИЦИАЛИЗАЦИЯ =====================
    init() {
        // Подписка на изменения данных
        this._unsubscribe = Data.subscribe(() => {
            this.renderCurrentPage();
        });

        // Навигация
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach((item) => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // FAB
        const fab = document.getElementById('fabAddTask');
        if (fab) {
            fab.addEventListener('click', () => {
                UI.toast('📝 Создание задачи (в разработке)', 'info');
            });
        }

        // Аватар → профиль
        const avatar = document.getElementById('avatarPreview');
        if (avatar) {
            avatar.addEventListener('click', () => {
                this.navigateTo('profile');
            });
        }

        // ДЕМО: двойной тап по header → смена темы
        let tapCount = 0;
        const header = document.querySelector('.header');
        if (header) {
            header.addEventListener('click', () => {
                tapCount++;
                if (tapCount === 2) {
                    UI.cycleTheme();
                    tapCount = 0;
                }
                clearTimeout(window.tapTimer);
                window.tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 500);
            });
        }

        // ДЕМО: тройной тап по аватару → тёмный режим
        let darkTapCount = 0;
        const avatarEl = document.querySelector('.header .avatar');
        if (avatarEl) {
            avatarEl.addEventListener('click', function(e) {
                e.stopPropagation();
                darkTapCount++;
                if (darkTapCount === 3) {
                    UI.toggleDarkMode();
                    darkTapCount = 0;
                }
                clearTimeout(window.darkTapTimer);
                window.darkTapTimer = setTimeout(() => {
                    darkTapCount = 0;
                }, 500);
            });
        }

        // Автоматическая проверка пропущенных задач (каждую минуту)
        setInterval(() => {
            Data.autoMissTasks();
            if (this._currentPage === 'home' || this._currentPage === 'calendar') {
                this.renderCurrentPage();
            }
        }, 60000);

        // Стартовый рендер
        this.navigateTo('home');
    },

    // ===================== НАВИГАЦИЯ =====================
    navigateTo(page) {
        this._currentPage = page;

        // Обновляем активный пункт в нижнем меню
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach((item) => {
            const isActive = item.dataset.page === page;
            item.classList.toggle('active', isActive);
        });

        // Рендерим страницу
        this.renderCurrentPage();

        // Обновляем заголовок (если есть)
        const titles = {
            home: 'Главная',
            calendar: 'Календарь',
            journals: 'Журналы',
            goals: 'Цели',
            profile: 'Профиль',
        };
        const titleEl = document.querySelector('.header .title-1');
        if (titleEl) {
            titleEl.textContent = titles[page] || 'SkillQuest';
        }
    },

    // ===================== РЕНДЕРИНГ ТЕКУЩЕЙ СТРАНИЦЫ =====================
    renderCurrentPage() {
        const container = document.getElementById('mainContent');
        if (!container) {
            return;
        }

        switch (this._currentPage) {
            case 'home':
                this.renderHome(container);
                break;
            case 'calendar':
                this.renderCalendar(container);
                break;
            case 'journals':
                this.renderJournals(container);
                break;
            case 'goals':
                this.renderGoals(container);
                break;
            case 'profile':
                this.renderProfile(container);
                break;
            default:
                container.innerHTML =
                    '<div class="card"><p class="body-1">Страница в разработке</p></div>';
        }
    },

    // ===================== HOME SCREEN =====================
    renderHome(container) {
        const data = Data._data;
        const profile = data.profile;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = Data.getTodayTasks();

        // Приветствие
        const greetingEl = document.getElementById('greetingText');
        if (greetingEl) greetingEl.textContent = UI.getGreeting();

        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = profile.name;

        const initialsEl = document.getElementById('avatarInitials');
        if (initialsEl) initialsEl.textContent = profile.name.charAt(0).toUpperCase();

        // Уровень и опыт
        const levelData = Data.recalcLevel();
        const level = levelData.level;
        const exp = levelData.exp;
        const needed = levelData.needed;

        // Статистика
        const doneCount = todayTasks.filter(function(t) {
            return Data.getTaskStatus(t, today) === 'done';
        }).length;
        const totalToday = todayTasks.length;
        const productivity = totalToday > 0 ? Math.round((doneCount / totalToday) * 100) : 0;

        // Активные задачи (только ожидающие, максимум 3)
        const activeTasks = todayTasks
            .filter(function(t) {
                return Data.getTaskStatus(t, today) === 'pending';
            })
            .slice(0, 3);

        // Топ-4 журнала по XP
        const sortedJournals = data.journals.slice().sort(function(a, b) {
            return b.exp - a.exp;
        });
        const topJournals = sortedJournals.slice(0, 4);

        // Генерируем HTML
        container.innerHTML = `
            <div class="home-content">
                <!-- Карточка уровня -->
                <section class="level-card card card-glow animate-slide-up">
                    <div class="level-card-header">
                        <div>
                            <span class="caption-2 text-secondary" style="color:rgba(255,255,255,0.7);">УРОВЕНЬ</span>
                            <span class="headline-2" style="color:var(--color-text-inverse);">${level}</span>
                        </div>
                        <div class="level-stats">
                            <span class="body-2" style="color:rgba(255,255,255,0.9);">${Math.floor(exp)} / ${needed} XP</span>
                            <span class="caption-2" style="color:rgba(255,255,255,0.7);">🔥 ${profile.streak || 0} дней</span>
                        </div>
                    </div>
                    <div class="progress level-progress">
                        <div class="progress-bar" style="width: ${(exp / needed) * 100}%;"></div>
                    </div>
                </section>

                <!-- Быстрая статистика -->
                <section class="stats-grid grid grid-3">
                    <div class="stat-card card">
                        <span class="stat-icon">📋</span>
                        <span class="stat-number">${totalToday}</span>
                        <span class="stat-label caption-1 text-secondary">Задач сегодня</span>
                    </div>
                    <div class="stat-card card">
                        <span class="stat-icon">✅</span>
                        <span class="stat-number">${doneCount}</span>
                        <span class="stat-label caption-1 text-secondary">Выполнено</span>
                    </div>
                    <div class="stat-card card">
                        <span class="stat-icon">📊</span>
                        <span class="stat-number">${productivity}%</span>
                        <span class="stat-label caption-1 text-secondary">Продуктивность</span>
                    </div>
                </section>

                <!-- Активные задачи -->
                <section class="tasks-section">
                    <div class="section-header flex-between">
                        <h2 class="title-2">Активные задачи</h2>
                        <button class="btn btn-ghost btn-sm" data-nav="calendar">Все →</button>
                    </div>
                    <div class="tasks-list">
                        ${
                            activeTasks.length === 0
                                ? `
                            <div class="tasks-empty">
                                <div class="empty-icon">🎉</div>
                                <p class="body-1">На сегодня задач нет</p>
                                <p class="caption-1 text-secondary">Отличная работа!</p>
                            </div>
                        `
                                : activeTasks
                                        .map(function(task) {
                                            const journal = Data.getJournalByName(task.journal);
                                            const icon = journal ? journal.icon : '📌';
                                            return `
                                <div class="task-item" data-task-id="${task.id}">
                                    <div class="task-icon">${icon}</div>
                                    <div class="task-info">
                                        <div class="task-title">${task.title}</div>
                                        <div class="task-meta">
                                            <span>${task.time || '—'}</span>
                                            <span>${task.duration || 0} мин</span>
                                            <span>${task.journal}</span>
                                        </div>
                                    </div>
                                    <span class="task-status pending">Ожидает</span>
                                </div>
                            `;
                                        })
                                        .join('')
                        }
                    </div>
                </section>

                <!-- Быстрый доступ к журналам -->
                <section class="journals-section">
                    <div class="section-header flex-between">
                        <h2 class="title-2">Журналы</h2>
                        <button class="btn btn-ghost btn-sm" data-nav="journals">Все →</button>
                    </div>
                    <div class="journals-grid grid grid-4">
                        ${
                            topJournals
                                .map(function(journal) {
                                    const maxExp = 1000;
                                    const progress = Math.min((journal.exp / maxExp) * 100, 100);
                                    return `
                                <div class="journal-card-mini" data-journal="${journal.name}">
                                    <div class="journal-icon">${journal.icon || '📌'}</div>
                                    <div class="journal-name">${journal.name.charAt(0).toUpperCase() + journal.name.slice(1)}</div>
                                    <div class="journal-exp">${Math.floor(journal.exp)} XP</div>
                                    <div class="journal-progress">
                                        <div class="fill" style="width: ${progress}%;"></div>
                                    </div>
                                </div>
                            `;
                                })
                                .join('')
                        }
                    </div>
                </section>
            </div>
        `;

        // Обработчики событий
        const navButtons = container.querySelectorAll('[data-nav]');
        navButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                App.navigateTo(btn.dataset.nav);
            });
        });

        const taskItems = container.querySelectorAll('.task-item');
        taskItems.forEach(function(el) {
            el.addEventListener('click', function() {
                const id = el.dataset.taskId;
                const task = Data.tasks.find(function(t) {
                    return t.id === id;
                });
                if (task) {
                    UI.toast(`📋 ${task.title}`, 'info');
                }
            });
        });

        const journalCards = container.querySelectorAll('.journal-card-mini');
        journalCards.forEach(function(el) {
            el.addEventListener('click', function() {
                const name = el.dataset.journal;
                UI.toast(`📚 Журнал "${name}"`, 'info');
            });
        });

        // Бейдж целей
        const goalsBadge = document.getElementById('goalsBadge');
        if (goalsBadge) {
            const activeGoals = data.goals.filter(function(g) {
                return !g.achieved;
            }).length;
            goalsBadge.textContent = activeGoals;
            goalsBadge.className = 'badge' + (activeGoals > 0 ? ' show' : '');
        }
    },

    // ===================== КАЛЕНДАРЬ =====================
    renderCalendar(container) {
        const view = Calendar.getView();
        const baseDate = Calendar.getBaseDate();
        const selectedDate = Calendar.getSelectedDate();
        const tasks = Data.tasks;
        const journals = Data.journals;

        const selectedStr = selectedDate.toISOString().split('T')[0];
        const dayTasks = Data.getTasksForDate(selectedStr);

        let calendarHTML = '';
        let dayDetailHTML = '';

        if (view === 'day') {
            calendarHTML = `
                <div class="calendar-grid week">
                    ${this._renderDayView(baseDate, tasks, journals)}
                </div>
            `;
        } else if (view === 'week') {
            const week = Calendar.getWeekData(baseDate);
            calendarHTML = `
                <div class="calendar-grid week">
                    ${week
                        .map(function(d) {
                            return App._renderDayCell(d, tasks, journals, selectedDate);
                        })
                        .join('')}
                </div>
            `;
        } else if (view === 'month') {
            const year = baseDate.getFullYear();
            const month = baseDate.getMonth();
            const weeks = Calendar.getMonthData(year, month);
            const weekDays = Calendar.getWeekDays();
            const flatCells = weeks.flat();
            calendarHTML = `
                ${weekDays.map(function(d) {
                    return `<div class="day-header">${d}</div>`;
                }).join('')}
                ${flatCells
                    .map(function(cell) {
                        const date = new Date(cell.year, cell.month, cell.day);
                        return App._renderDayCell(
                            date,
                            tasks,
                            journals,
                            selectedDate,
                            cell.isOtherMonth
                        );
                    })
                    .join('')}
            `;
        } else if (view === 'year') {
            const year = baseDate.getFullYear();
            const months = Calendar.getYearData(year);
            calendarHTML = `
                <div class="year-grid">
                    ${months
                        .map(function(m, idx) {
                            const hasTasks = Data._data.tasks.some(function(task) {
                                const start = new Date(task.startDate || task.date);
                                const end = new Date(task.endDate || task.date);
                                return (
                                    (start.getFullYear() === year && start.getMonth() === idx) ||
                                    (end.getFullYear() === year && end.getMonth() === idx)
                                );
                            });
                            return `
                                <div class="month-card" data-month="${idx}">
                                    <div class="month-name">${m.name}</div>
                                    <div class="month-dots">
                                        ${Array.from({ length: 7 }, function(_, i) {
                                            return `
                                                <div class="dot ${i < 3 && hasTasks ? 'has-task' : ''}"></div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        })
                        .join('')}
                </div>
            `;
        }

        if (dayTasks.length > 0) {
            dayDetailHTML = `
                <div class="calendar-day-detail">
                    <div class="day-title">📋 ${selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div class="day-tasks">
                        ${dayTasks
                            .map(function(task) {
                                const status = Data.getTaskStatus(task, selectedStr);
                                const journal = Data.getJournalByName(task.journal);
                                const icon = journal ? journal.icon : '📌';
                                const statusLabels = {
                                    done: '✅ Выполнено',
                                    pending: '⏳ Ожидает',
                                    missed: '❌ Пропущено',
                                };
                                return `
                                    <div class="task-item">
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
                                        ${
                                            status === 'pending'
                                                ? `
                                            <button class="btn btn-sm btn-success" data-complete="${task.id}" data-date="${selectedStr}">Выполнить</button>
                                        `
                                                : ''
                                        }
                                    </div>
                                `;
                            })
                            .join('')}
                    </div>
                </div>
            `;
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

                <div class="calendar-filters">
                    ${journals
                        .map(function(j) {
                            return `
                                <span class="chip active" data-filter="${j.name}">${j.icon} ${j.name}</span>
                            `;
                        })
                        .join('')}
                    <span class="chip" data-filter="all" style="background:var(--color-primary);color:var(--color-text-inverse);">Все</span>
                </div>

                <div class="calendar-grid ${view === 'month' ? 'month' : view === 'week' ? 'week' : ''}">
                    ${calendarHTML}
                </div>

                ${dayDetailHTML}
            </div>
        `;

        // Обработчики
        const viewButtons = container.querySelectorAll('[data-view]');
        viewButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                Calendar.setView(btn.dataset.view);
                App.renderCalendar(container);
            });
        });

        const navButtons2 = container.querySelectorAll('[data-nav]');
        navButtons2.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const dir = btn.dataset.nav === 'prev' ? -1 : 1;
                Calendar.navigate(dir);
                App.renderCalendar(container);
            });
        });

        const cells = container.querySelectorAll('.calendar-cell:not(.other-month)');
        cells.forEach(function(el) {
            el.addEventListener('click', function() {
                const date = new Date(el.dataset.year, el.dataset.month, el.dataset.day);
                Calendar.setSelectedDate(date);
                if (view !== 'day') {
                    Calendar.setView('day');
                }
                App.renderCalendar(container);
            });
        });

        const monthCards = container.querySelectorAll('.month-card');
        monthCards.forEach(function(el) {
            el.addEventListener('click', function() {
                const month = parseInt(el.dataset.month, 10);
                const year = baseDate.getFullYear();
                Calendar.setBaseDate(new Date(year, month, 1));
                Calendar.setView('month');
                App.renderCalendar(container);
            });
        });

        const completeBtns = container.querySelectorAll('[data-complete]');
        completeBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = btn.dataset.complete;
                const dateStr = btn.dataset.date;
                if (Data.completeTaskInstance(taskId, dateStr)) {
                    UI.toast('✅ Задача выполнена!', 'success');
                    App.renderCalendar(container);
                }
            });
        });

        const filterChips = container.querySelectorAll('[data-filter]');
        filterChips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                chip.classList.toggle('active');
                UI.toast('Фильтр: ' + chip.textContent, 'info');
            });
        });
    },

    _renderDayCell: function(date, tasks, journals, selectedDate, isOtherMonth) {
        isOtherMonth = isOtherMonth || false;
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = Data.getTasksForDate(dateStr);
        const isToday = Data.isSameDay(date, new Date());
        const isSelected = Data.isSameDay(date, selectedDate);

        const badgeCounts = {};
        dayTasks.forEach(function(task) {
            const status = Data.getTaskStatus(task, dateStr);
            if (status !== 'missed') {
                badgeCounts[task.journal] = (badgeCounts[task.journal] || 0) + 1;
            }
        });

        const badgeEntries = Object.entries(badgeCounts);
        const badgeHTML = badgeEntries
            .map(function(entry) {
                return '<span class="badge">' + entry[0] + ':' + entry[1] + '</span>';
            })
            .join('');

        var cellClass = 'calendar-cell';
        if (isToday) cellClass += ' today';
        if (isSelected) cellClass += ' selected';
        if (isOtherMonth) cellClass += ' other-month';

        var indicator = '';
        if (dayTasks.length > 0 && badgeHTML === '') {
            indicator = '<div class="task-indicator"></div>';
        }

        return (
            '<div class="' +
            cellClass +
            '" data-year="' +
            date.getFullYear() +
            '" data-month="' +
            date.getMonth() +
            '" data-day="' +
            date.getDate() +
            '">' +
            '<div class="date">' +
            date.getDate() +
            '</div>' +
            (badgeHTML ? '<div class="badge-container">' + badgeHTML + '</div>' : '') +
            indicator +
            '</div>'
        );
    },

    _renderDayView: function(date, tasks, journals) {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = Data.getTasksForDate(dateStr);

        if (dayTasks.length === 0) {
            return '<div style="grid-column:span 7;text-align:center;padding:var(--spacing-2xl);color:var(--color-text-secondary);">Нет задач на этот день</div>';
        }

        return dayTasks
            .map(function(task) {
                const status = Data.getTaskStatus(task, dateStr);
                const journal = Data.getJournalByName(task.journal);
                const icon = journal ? journal.icon : '📌';
                const statusLabels = {
                    done: '✅',
                    pending: '⏳',
                    missed: '❌',
                };
                return (
                    '<div class="task-item" style="grid-column:span 7;">' +
                    '<div class="task-icon">' +
                    icon +
                    '</div>' +
                    '<div class="task-info">' +
                    '<div class="task-title">' +
                    task.title +
                    '</div>' +
                    '<div class="task-meta">' +
                    '<span>' +
                    (task.time || '—') +
                    '</span>' +
                    '<span>' +
                    (task.duration || 0) +
                    ' мин</span>' +
                    '<span>' +
                    task.journal +
                    '</span>' +
                    '</div>' +
                    '</div>' +
                    '<span class="task-status ' +
                    status +
                    '">' +
                    (statusLabels[status] || status) +
                    '</span>' +
                    (status === 'pending'
                        ? '<button class="btn btn-sm btn-success" data-complete="' +
                          task.id +
                          '" data-date="' +
                          dateStr +
                          '">Выполнить</button>'
                        : '') +
                    '</div>'
                );
            })
            .join('');
    },

    // ===================== ЖУРНАЛЫ =====================
    renderJournals: function(container) {
        var journals = Data.journals;

        var html =
            '<div class="home-content">' +
            '<div class="section-header">' +
            '<h2 class="title-1">Все журналы</h2>' +
            '<p class="body-2 text-secondary">' +
            journals.length +
            ' журналов</p>' +
            '</div>' +
            '<div class="journals-grid grid grid-4">';

        journals.forEach(function(journal) {
            var tasks = Data.tasks.filter(function(t) {
                return t.journal === journal.name;
            });
            var maxExp = 1000;
            var progress = Math.min((journal.exp / maxExp) * 100, 100);
            html +=
                '<div class="journal-card-mini" data-journal="' +
                journal.name +
                '">' +
                '<div class="journal-icon" style="font-size:var(--font-size-4xl);">' +
                (journal.icon || '📌') +
                '</div>' +
                '<div class="journal-name" style="font-size:var(--font-size-lg);">' +
                journal.name.charAt(0).toUpperCase() +
                journal.name.slice(1) +
                '</div>' +
                '<div class="journal-exp">' +
                Math.floor(journal.exp) +
                ' XP</div>' +
                '<div class="journal-progress"><div class="fill" style="width:' +
                progress +
                '%;"></div></div>' +
                '<div class="caption-1 text-secondary">' +
                tasks.length +
                ' задач</div>' +
                '</div>';
        });

        html += '</div></div>';
        container.innerHTML = html;

        var cards = container.querySelectorAll('.journal-card-mini');
        cards.forEach(function(el) {
            el.addEventListener('click', function() {
                var name = el.dataset.journal;
                UI.toast('📚 Журнал "' + name + '"', 'info');
            });
        });
    },

    // ===================== ЦЕЛИ =====================
    renderGoals: function(container) {
        var goals = Data.goals;

        if (goals.length === 0) {
            container.innerHTML =
                '<div class="home-content">' +
                '<div class="section-header flex-between">' +
                '<h2 class="title-1">Цели</h2>' +
                '<button class="btn btn-primary btn-sm">+ Новая цель</button>' +
                '</div>' +
                '<div class="tasks-empty">' +
                '<div class="empty-icon">🎯</div>' +
                '<p class="body-1">У вас пока нет целей</p>' +
                '<p class="caption-1 text-secondary">Создайте первую цель и начните достигать!</p>' +
                '</div>' +
                '</div>';
            return;
        }

        var html =
            '<div class="home-content">' +
            '<div class="section-header flex-between">' +
            '<h2 class="title-1">Цели</h2>' +
            '<button class="btn btn-primary btn-sm">+ Новая цель</button>' +
            '</div>';

        goals.forEach(function(goal) {
            var tasks = Data.tasks.filter(function(t) {
                return t.goalId === goal.id;
            });
            var done = tasks.reduce(function(acc, t) {
                return acc + t.completedDates.length;
            }, 0);
            var total = tasks.reduce(function(acc, t) {
                var start = t.startDate || t.date;
                var end = t.endDate || t.date;
                var dates = Data.getDateRange(start, end);
                return acc + dates.length;
            }, 0);
            var progress = total > 0 ? Math.round((done / total) * 100) : 0;

            html +=
                '<div class="card" style="margin-bottom:var(--spacing-md);">' +
                '<div class="flex-between">' +
                '<div>' +
                '<h3 class="title-2">' +
                goal.title +
                '</h3>' +
                '<p class="body-2 text-secondary">' +
                (goal.description || 'Без описания') +
                '</p>' +
                '</div>' +
                '<span class="chip ' +
                (goal.achieved ? 'active' : '') +
                '">' +
                (goal.achieved ? '✅ Достигнута' : 'В процессе') +
                '</span>' +
                '</div>' +
                '<div class="progress" style="margin-top:var(--spacing-md);">' +
                '<div class="progress-bar" style="width:' +
                progress +
                '%;"></div>' +
                '</div>' +
                '<div class="flex-between" style="margin-top:var(--spacing-sm);">' +
                '<span class="caption-1 text-secondary">' +
                done +
                '/' +
                total +
                ' задач</span>' +
                '<span class="caption-1 text-secondary">📅 ' +
                UI.formatDate(goal.deadline) +
                '</span>' +
                '</div>' +
                '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    },

    // ===================== ПРОФИЛЬ =====================
    renderProfile: function(container) {
        var profile = Data.profile;

        var html =
            '<div class="home-content">' +
            '<div class="card" style="text-align:center;">' +
            '<div class="avatar avatar-xl" style="margin:0 auto;">' +
            '<span>' +
            profile.name.charAt(0).toUpperCase() +
            '</span>' +
            '</div>' +
            '<h2 class="title-1" style="margin-top:var(--spacing-md);">' +
            profile.name +
            '</h2>' +
            '<p class="body-2 text-secondary">Уровень ' +
            profile.level +
            ' · ' +
            Math.floor(profile.totalExp) +
            ' XP</p>' +
            '<div class="flex" style="justify-content:center;gap:var(--spacing-2xl);margin-top:var(--spacing-lg);">' +
            '<div><span class="title-2">' +
            (profile.streak || 0) +
            '</span><br><span class="caption-1 text-secondary">🔥 Дней</span></div>' +
            '<div><span class="title-2">' +
            profile.age +
            '</span><br><span class="caption-1 text-secondary">Возраст</span></div>' +
            '<div><span class="title-2">' +
            profile.weight +
            ' кг</span><br><span class="caption-1 text-secondary">Вес</span></div>' +
            '</div>' +
            '</div>' +
            '<div class="card">' +
            '<h3 class="title-2">Параметры тела</h3>' +
            '<div class="grid grid-2" style="margin-top:var(--spacing-md);">' +
            '<div><span class="caption-1 text-secondary">Рост</span><br><span class="body-1">' +
            profile.height +
            ' см</span></div>' +
            '<div><span class="caption-1 text-secondary">Грудь</span><br><span class="body-1">' +
            profile.chest +
            ' см</span></div>' +
            '<div><span class="caption-1 text-secondary">Талия</span><br><span class="body-1">' +
            profile.waist +
            ' см</span></div>' +
            '<div><span class="caption-1 text-secondary">Бёдра</span><br><span class="body-1">' +
            profile.hips +
            ' см</span></div>' +
            '<div><span class="caption-1 text-secondary">Бицепс</span><br><span class="body-1">' +
            profile.biceps +
            ' см</span></div>' +
            '</div>' +
            '</div>' +
            '<div class="card">' +
            '<h3 class="title-2">Настройки</h3>' +
            '<div class="flex-between" style="padding:var(--spacing-sm) 0;border-bottom:1px solid var(--color-border);">' +
            '<span class="body-2">Тёмный режим</span>' +
            '<label class="switch">' +
            '<input type="checkbox" id="darkModeSwitch" ' +
            (document.body.classList.contains('dark') ? 'checked' : '') +
            '>' +
            '<span class="slider"></span>' +
            '</label>' +
            '</div>' +
            '<div class="flex-between" style="padding:var(--spacing-sm) 0;">' +
            '<span class="body-2">Тема</span>' +
            '<div style="display:flex;gap:var(--spacing-xs);">';

        var themes = ['default', 'jade', 'ruby', 'sapphire', 'amber', 'coral', 'amethyst'];
        themes.forEach(function(t) {
            var isActive = document.body.classList.contains('theme-' + t);
            var bgColor = t !== 'default' ? 'var(--color-primary);' : 'var(--color-border);';
            html +=
                '<span class="chip ' +
                (isActive ? 'active' : '') +
                '" data-theme="' +
                t +
                '" style="width:28px;height:28px;padding:0;border-radius:var(--radius-full);background:' +
                bgColor +
                '"></span>';
        });

        html +=
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        container.innerHTML = html;

        var darkSwitch = container.querySelector('#darkModeSwitch');
        if (darkSwitch) {
            darkSwitch.addEventListener('change', function() {
                UI.toggleDarkMode();
            });
        }

        var themeChips = container.querySelectorAll('[data-theme]');
        themeChips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                var theme = chip.dataset.theme;
                document.body.className = document.body.className
                    .split(' ')
                    .filter(function(c) {
                        return !c.startsWith('theme-');
                    })
                    .join(' ');
                if (theme !== 'default') {
                    document.body.classList.add('theme-' + theme);
                }
                UI.toast('🎨 Тема: ' + theme, 'info', 1500);
                App.renderProfile(container);
            });
        });
    },
};

// ===================== СТАРТ =====================
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});

window.App = App;
