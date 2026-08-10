/**
 * ============================================================
 * APP — ИНИЦИАЛИЗАЦИЯ, НАВИГАЦИЯ, EVENT DELEGATION
 * ============================================================
 */
import { Data } from './data.js';
import { UI } from './ui.js';
import { Calendar } from './calendar.js';
import { Renderers } from './renderers.js';
import { Modals } from './modals.js';
import { CONFIG } from './config.js';

export const App = (() => {
    let _currentPage = 'home';
    let _journalContext = null;
    let _unsubscribe = null;
    let _isRendering = false;

    // ============================================================
    // НАВИГАЦИЯ
    // ============================================================
    const navigateTo = (page) => {
        _currentPage = page;
        _journalContext = null;

        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        const titles = {
            home: 'Главная',
            calendar: 'Календарь',
            journals: 'Журналы',
            goals: 'Цели',
            profile: 'Профиль',
            notes: 'Заметки',
            gallery: 'Галерея',
            settings: 'Настройки',
        };
        const titleEl = document.querySelector('.header-title');
        if (titleEl) titleEl.textContent = titles[page] || 'SkillQuest';

        renderCurrentPage();
    };

    // ============================================================
    // РЕНДЕРИНГ
    // ============================================================
    const renderCurrentPage = () => {
        const container = document.getElementById('mainContent');
        if (!container) return;

        _isRendering = true;

        try {
            switch (_currentPage) {
                case 'home':
                    Renderers.renderHome(container);
                    break;
                case 'calendar':
                    Renderers.renderCalendar(container);
                    break;
                case 'journals':
                    Renderers.renderJournals(container);
                    break;
                case 'goals':
                    Renderers.renderGoals(container);
                    break;
                case 'profile':
                    Renderers.renderProfile(container);
                    break;
                case 'notes':
                    Renderers.renderNotes(container);
                    break;
                case 'gallery':
                    Renderers.renderGallery(container);
                    break;
                case 'settings':
                    Renderers.renderSettings(container);
                    break;
                default:
                    container.innerHTML = '<div class="card"><p>Страница в разработке</p></div>';
            }
        } catch (err) {
            console.error('Render error:', err);
            container.innerHTML =
                `<div class="card" style="text-align:center;padding:40px;"><p>⚠️ Ошибка загрузки страницы</p><p style="font-size:13px;color:var(--text-secondary);">${err.message}</p></div>`;
        }

        _isRendering = false;
        updateBadges();
    };

    const updateBadges = () => {
        const badge = document.getElementById('goalsBadge');
        if (badge) {
            const count = Data.goals().filter(g => !g.achieved).length;
            badge.textContent = count;
            badge.className = 'badge' + (count > 0 ? ' show' : '');
        }
    };

    // ============================================================
    // EVENT DELEGATION — ЕДИНСТВЕННЫЙ ОБРАБОТЧИК
    // ============================================================
    const setupEventDelegation = () => {
        // ---- ВСЕ КЛИКИ ----
        document.addEventListener('click', (e) => {
            // 1. НАВИГАЦИЯ
            const navItem = e.target.closest('.bottom-nav .nav-item');
            if (navItem) {
                e.preventDefault();
                const page = navItem.dataset.page;
                if (page) navigateTo(page);
                return;
            }

            // 2. FAB
            if (e.target.closest('#fabAdd')) {
                e.preventDefault();
                Modals.openTaskModal();
                return;
            }

            // 3. ВЫПОЛНИТЬ ЗАДАЧУ
            const completeBtn = e.target.closest('.complete-btn');
            if (completeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const taskId = completeBtn.dataset.taskId;
                const dateStr = completeBtn.dataset.date;
                if (taskId && dateStr) {
                    const result = Data.completeTaskInstance(taskId, dateStr);
                    if (result?.success) {
                        UI.toast(result.message, result.isLate ? 'warning' : 'success', 3000);
                        renderCurrentPage();
                    } else {
                        UI.toast('⚠️ Не удалось выполнить задачу', 'error');
                    }
                }
                return;
            }

            // 4. КАРТОЧКА ЗАДАЧИ
            const taskItem = e.target.closest('.task-item');
            if (taskItem && !e.target.closest('.complete-btn') && !e.target.closest('.task-actions')) {
                e.preventDefault();
                const taskId = taskItem.dataset.taskId;
                if (taskId) Modals.openTaskDetail(taskId);
                return;
            }

            // 5. КАРТОЧКА ЖУРНАЛА
            const journalCard = e.target.closest('.journal-card-mini');
            if (journalCard) {
                e.preventDefault();
                const journalName = journalCard.dataset.journal;
                if (journalName) {
                    _journalContext = { journalName };
                    renderCurrentPage();
                }
                return;
            }

            // 6. НАЗАД В ЖУРНАЛЕ
            if (e.target.closest('#backToJournalsFromTasks')) {
                e.preventDefault();
                _journalContext = null;
                renderCurrentPage();
                return;
            }

            // 7. ДОБАВИТЬ ЗАДАЧУ В ЖУРНАЛ
            if (e.target.closest('#addTaskToJournal')) {
                e.preventDefault();
                const journalName = _journalContext?.journalName;
                Modals.openTaskModal(null, journalName);
                return;
            }

            // 8. ВСЕ ЗАДАЧИ В ЖУРНАЛАХ
            if (e.target.closest('#showAllTasksFromJournals')) {
                e.preventDefault();
                _journalContext = { showAllTasks: true };
                renderCurrentPage();
                return;
            }

            // 9. ВИД КАЛЕНДАРЯ
            const viewBtn = e.target.closest('[data-view]');
            if (viewBtn) {
                e.preventDefault();
                Calendar.setView(viewBtn.dataset.view);
                renderCurrentPage();
                return;
            }

            // 10. СТРЕЛКИ КАЛЕНДАРЯ
            const navBtn = e.target.closest('[data-nav]');
            if (navBtn && navBtn.closest('.calendar-nav')) {
                e.preventDefault();
                const dir = navBtn.dataset.nav === 'prev' ? -1 : 1;
                Calendar.navigate(dir);
                renderCurrentPage();
                return;
            }

            // 11. ЯЧЕЙКА КАЛЕНДАРЯ
            const cell = e.target.closest('.calendar-cell:not(.other-month)');
            if (cell) {
                e.preventDefault();
                const date = new Date(cell.dataset.year, cell.dataset.month, cell.dataset.day);
                Calendar.setSelectedDate(date);
                if (Calendar.getView() !== 'day') Calendar.setView('day');
                renderCurrentPage();
                return;
            }

            // 12. МЕСЯЦ В ГОДОВОМ ВИДЕ
            const monthCard = e.target.closest('.month-card');
            if (monthCard) {
                e.preventDefault();
                const month = parseInt(monthCard.dataset.month, 10);
                const year = Calendar.getBaseDate().getFullYear();
                Calendar.setBaseDate(new Date(year, month, 1));
                Calendar.setView('month');
                renderCurrentPage();
                return;
            }

            // 13. ФИЛЬТРЫ КАЛЕНДАРЯ
            const filterChip = e.target.closest('.calendar-filters .chip[data-filter]');
            if (filterChip) {
                e.preventDefault();
                const filter = filterChip.dataset.filter;
                if (filter === 'all') {
                    Calendar._activeFilters = Data.journals().map(j => j.name);
                } else {
                    Calendar.toggleFilter(filter);
                }
                renderCurrentPage();
                return;
            }

            // 14. ДОБАВИТЬ ЦЕЛЬ
            if (e.target.closest('#addGoalBtn')) {
                e.preventDefault();
                Modals.openGoalModal();
                return;
            }

            // 15. РЕДАКТИРОВАТЬ ЦЕЛЬ
            const editGoalBtn = e.target.closest('.edit-goal-btn');
            if (editGoalBtn) {
                e.preventDefault();
                e.stopPropagation();
                Modals.openGoalModal(editGoalBtn.dataset.goalId);
                return;
            }

            // 16. УДАЛИТЬ ЦЕЛЬ
            const deleteGoalBtn = e.target.closest('.delete-goal-btn');
            if (deleteGoalBtn) {
                e.preventDefault();
                e.stopPropagation();
                Modals.deleteGoal(deleteGoalBtn.dataset.goalId);
                return;
            }

            // 17. КАРТОЧКА ЦЕЛИ
            const goalCard = e.target.closest('.goal-card');
            if (goalCard && !e.target.closest('button')) {
                e.preventDefault();
                const goal = Data.goals().find(g => g.id === goalCard.dataset.goalId);
                if (goal) UI.toast(`🎯 ${goal.title} — ${goal.achieved ? 'Достигнута' : 'В процессе'}`, 'info');
                return;
            }

            // 18. СОХРАНИТЬ ПРОФИЛЬ
            if (e.target.closest('#saveProfileBtn')) {
                e.preventDefault();
                saveProfile();
                return;
            }

            // 19. ДОБАВИТЬ ВЕС
            if (e.target.closest('#addWeightBtn')) {
                e.preventDefault();
                addWeightEntry();
                return;
            }

            // 20. ЗАМЕТКИ
            if (e.target.closest('#addNoteBtn')) {
                e.preventDefault();
                Modals.openNoteModal();
                return;
            }

            const editNoteBtn = e.target.closest('.edit-note-btn');
            if (editNoteBtn) {
                e.preventDefault();
                e.stopPropagation();
                Modals.openNoteModal(editNoteBtn.dataset.noteId);
                return;
            }

            const deleteNoteBtn = e.target.closest('.delete-note-btn');
            if (deleteNoteBtn) {
                e.preventDefault();
                e.stopPropagation();
                Modals.deleteNote(deleteNoteBtn.dataset.noteId);
                return;
            }

            const noteItem = e.target.closest('.note-item');
            if (noteItem && !e.target.closest('button')) {
                e.preventDefault();
                Modals.openNoteView(noteItem.dataset.noteId);
                return;
            }

            // 21. ГАЛЕРЕЯ
            if (e.target.closest('#addPhotoBtn')) {
                e.preventDefault();
                Modals.addPhoto();
                return;
            }

            const photoDelete = e.target.closest('.photo-delete');
            if (photoDelete) {
                e.preventDefault();
                e.stopPropagation();
                Modals.deletePhoto(photoDelete.dataset.photoId);
                return;
            }

            const photoItem = e.target.closest('.photo-item');
            if (photoItem && !e.target.closest('.photo-delete')) {
                e.preventDefault();
                Modals.openPhotoView(photoItem.dataset.photoId);
                return;
            }

            // 22. НАСТРОЙКИ
            if (e.target.closest('#settingsDarkMode')) {
                UI.toggleDarkMode();
                renderCurrentPage();
                return;
            }

            const themeChip = e.target.closest('[data-theme]');
            if (themeChip && themeChip.closest('.form-group')) {
                e.preventDefault();
                UI.setTheme(themeChip.dataset.theme);
                renderCurrentPage();
                return;
            }

            if (e.target.closest('#exportDataBtn')) {
                e.preventDefault();
                UI.exportData();
                return;
            }

            if (e.target.closest('#importDataBtn')) {
                e.preventDefault();
                document.getElementById('importDataInput')?.click();
                return;
            }

            if (e.target.closest('#resetDataBtn')) {
                e.preventDefault();
                if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие необратимо.')) {
                    if (confirm('Ещё раз подтвердите:')) {
                        Data.resetAllData();
                        UI.toast('🗑 Данные сброшены', 'info');
                        navigateTo('home');
                    }
                }
                return;
            }

            if (e.target.closest('#settingsCloseBtn')) {
                e.preventDefault();
                navigateTo('home');
                return;
            }

            // 23. МОДАЛКИ
            if (e.target.closest('.modal-close')) {
                e.preventDefault();
                const modal = e.target.closest('.modal-overlay');
                if (modal) UI.closeModal(modal.id);
                return;
            }

            if (e.target.closest('.modal-overlay')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal && e.target === modal) {
                    UI.closeModal(modal.id);
                }
                return;
            }

            if (e.target.closest('#modalCancel')) {
                e.preventDefault();
                UI.closeModal('taskModal');
                return;
            }

            if (e.target.closest('#goalModalCancel')) {
                e.preventDefault();
                UI.closeModal('goalModal');
                return;
            }

            if (e.target.closest('#noteModalCancel')) {
                e.preventDefault();
                UI.closeModal('noteModal');
                return;
            }

            // 24. ДЕТАЛИ ЗАДАЧИ
            if (e.target.closest('#detailDelete')) {
                e.preventDefault();
                Modals.deleteTask(e.target.closest('#detailDelete').dataset.taskId);
                return;
            }

            if (e.target.closest('#detailEdit')) {
                e.preventDefault();
                const taskId = e.target.closest('#detailEdit').dataset.taskId;
                UI.closeModal('detailModal');
                setTimeout(() => Modals.openTaskModal(taskId), 300);
                return;
            }

            if (e.target.closest('#detailCloseBtn') || e.target.closest('#detailClose')) {
                e.preventDefault();
                UI.closeModal('detailModal');
                return;
            }

            // 25. ПРОСМОТР ЗАМЕТКИ
            if (e.target.closest('#noteViewEditBtn')) {
                e.preventDefault();
                const noteId = e.target.closest('#noteViewEditBtn').dataset.noteId;
                UI.closeModal('noteViewModal');
                setTimeout(() => Modals.openNoteModal(noteId), 300);
                return;
            }

            if (e.target.closest('#noteViewCloseBtn') || e.target.closest('#noteViewClose')) {
                e.preventDefault();
                UI.closeModal('noteViewModal');
                return;
            }

            // 26. ФОТО
            if (e.target.closest('#photoViewCloseBtn') || e.target.closest('#photoViewClose')) {
                e.preventDefault();
                UI.closeModal('photoViewModal');
                return;
            }

            if (e.target.closest('#photoDescSave')) {
                e.preventDefault();
                const note = document.getElementById('photoDescInput').value.trim();
                const pendingPhoto = window._pendingPhotoData;
                if (pendingPhoto) {
                    Data.addPhoto({ data: pendingPhoto, note });
                    UI.toast('✅ Фото добавлено', 'success');
                    UI.closeModal('photoDescModal');
                    renderCurrentPage();
                    window._pendingPhotoData = null;
                }
                return;
            }

            if (e.target.closest('#photoDescCancel') || e.target.closest('#photoDescClose')) {
                e.preventDefault();
                UI.closeModal('photoDescModal');
                window._pendingPhotoData = null;
                return;
            }

            // 27. HELP
            if (e.target.closest('#helpBtn')) {
                e.preventDefault();
                UI.openModal('helpModal');
                return;
            }

            if (e.target.closest('#helpModalClose') || e.target.closest('#helpCloseBtn')) {
                e.preventDefault();
                UI.closeModal('helpModal');
                return;
            }

            // 28. АВАТАР
            if (e.target.closest('#avatarPreview') && !e.target.closest('input')) {
                document.getElementById('avatarInput')?.click();
                return;
            }
        });

        // ---- ИЗМЕНЕНИЯ ----
        document.addEventListener('change', (e) => {
            // Аватар
            if (e.target.closest('#avatarInput')) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const profile = Data.profile();
                    profile.avatar = ev.target.result;
                    Data.save();
                    UI.updateHeader();
                    renderCurrentPage();
                    UI.toast('✅ Аватар обновлён', 'success');
                };
                reader.readAsDataURL(file);
                e.target.value = '';
                return;
            }

            // Аватар в профиле
            if (e.target.closest('#profileAvatarInput')) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const profile = Data.profile();
                    profile.avatar = ev.target.result;
                    Data.save();
                    UI.updateHeader();
                    renderCurrentPage();
                    UI.toast('✅ Аватар обновлён', 'success');
                };
                reader.readAsDataURL(file);
                e.target.value = '';
                return;
            }

            // Импорт данных
            if (e.target.closest('#importDataInput')) {
                const file = e.target.files[0];
                if (file) UI.importData(file);
                e.target.value = '';
                return;
            }
        });

        // ---- ОТПРАВКА ФОРМ ----
        document.addEventListener('submit', (e) => {
            if (e.target.closest('#taskForm')) {
                e.preventDefault();
                handleTaskFormSubmit(e.target);
                return;
            }

            if (e.target.closest('#goalForm')) {
                e.preventDefault();
                handleGoalFormSubmit(e.target);
                return;
            }

            if (e.target.closest('#noteForm')) {
                e.preventDefault();
                handleNoteFormSubmit(e.target);
                return;
            }
        });
    };

    // ============================================================
    // ОБРАБОТЧИКИ ФОРМ
    // ============================================================
    const handleTaskFormSubmit = (form) => {
        const taskId = form.dataset.editId;
        const isEdit = !!taskId;

        const title = document.getElementById('taskTitle').value.trim();
        const journal = document.getElementById('taskJournal').value;
        const startDate = document.getElementById('taskStart').value;
        const endDate = document.getElementById('taskEnd').value;
        const daysOfWeek = Array.from(document.querySelectorAll('#dayCheckboxes input:checked'))
            .map(cb => Number(cb.value));
        const time = document.getElementById('taskTime').value;
        const duration = Number(document.getElementById('taskDuration').value);
        const note = document.getElementById('taskNote').value.trim();
        const reminder = Number(document.getElementById('taskReminder').value);
        const goalId = document.getElementById('taskGoal').value || null;

        if (!title || !startDate || !endDate || !time || duration <= 0) {
            UI.toast('⚠️ Заполните все обязательные поля', 'error');
            return;
        }

        if (isEdit) {
            Data.updateTask(taskId, { title, journal, startDate, endDate, daysOfWeek, time, duration, note,
                reminderMinutes: reminder, goalId });
            UI.toast('✅ Задача обновлена!', 'success');
        } else {
            Data.addTask({ title, journal, startDate, endDate, daysOfWeek, time, duration, note,
                reminderMinutes: reminder, goalId });
            UI.toast('✅ Задача создана!', 'success');
        }
        UI.closeModal('taskModal');
        renderCurrentPage();
        delete form.dataset.editId;
    };

    const handleGoalFormSubmit = (form) => {
        const goalId = form.dataset.editId;
        const isEdit = !!goalId;

        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDesc').value.trim();
        const deadline = document.getElementById('goalDeadline').value;
        const checkpoints = document.getElementById('goalCheckpoints').value
            .split(',').map(s => s.trim()).filter(s => s);

        if (!title || !deadline) {
            UI.toast('⚠️ Заполните название и дедлайн', 'error');
            return;
        }

        if (isEdit) {
            Data.updateGoal(goalId, { title, description, deadline, checkpoints });
            UI.toast('✅ Цель обновлена!', 'success');
        } else {
            Data.addGoal({ title, description, deadline, checkpoints });
            UI.toast('✅ Цель создана!', 'success');
        }
        UI.closeModal('goalModal');
        renderCurrentPage();
        delete form.dataset.editId;
    };

    const handleNoteFormSubmit = (form) => {
        const noteId = form.dataset.editId;
        const isEdit = !!noteId;

        const text = document.getElementById('noteText').value.trim();
        const taskId = document.getElementById('noteTask').value || null;

        if (!text) {
            UI.toast('⚠️ Введите текст заметки', 'error');
            return;
        }

        if (isEdit) {
            Data.updateNote(noteId, { text, taskId });
            UI.toast('✅ Заметка обновлена', 'success');
        } else {
            Data.addNote({ text, taskId });
            UI.toast('✅ Заметка создана', 'success');
        }
        UI.closeModal('noteModal');
        renderCurrentPage();
        delete form.dataset.editId;
    };

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================
    const saveProfile = () => {
        const profile = Data.profile();
        const name = document.getElementById('pName').value.trim() || 'Герой';
        const age = parseInt(document.getElementById('pAge').value) || 0;
        const weight = parseFloat(document.getElementById('pWeight').value) || 0;
        const height = parseFloat(document.getElementById('pHeight').value) || 0;
        const neck = parseFloat(document.getElementById('pNeck').value) || 0;
        const chest = parseFloat(document.getElementById('pChest').value) || 0;
        const waist = parseFloat(document.getElementById('pWaist').value) || 0;
        const hips = parseFloat(document.getElementById('pHips').value) || 0;
        const biceps = parseFloat(document.getElementById('pBiceps').value) || 0;

        Object.assign(profile, { name, age, weight, height, neck, chest, waist, hips, biceps });
        Data.save();
        UI.updateHeader();
        UI.toast('✅ Профиль сохранён!', 'success');
        renderCurrentPage();
    };

    const addWeightEntry = () => {
        const date = prompt('Введите дату (ГГГГ-ММ-ДД):', Utils.toDateStr(new Date()));
        if (!date) return;
        const value = prompt('Введите вес (кг):', '70');
        if (!value) return;
        const weightVal = parseFloat(value);
        if (isNaN(weightVal) || weightVal <= 0) {
            UI.toast('⚠️ Введите корректный вес', 'error');
            return;
        }
        const log = Data.weightLog();
        log.push({ date, value: weightVal });
        Data.save();
        renderCurrentPage();
        UI.toast('✅ Запись добавлена', 'success');
    };

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    const init = () => {
        UI.loadTheme();
        UI.updateHeader();

        _unsubscribe = Data.subscribe(() => {
            if (!_isRendering) {
                renderCurrentPage();
            }
        });

        setupEventDelegation();

        // Автоматический пропуск задач
        setInterval(() => {
            Data.autoMissTasks();
        }, CONFIG.AUTO_MISS_INTERVAL);

        navigateTo('home');
    };

    // ============================================================
    // ПУБЛИЧНЫЙ API
    // ============================================================
    return {
        init,
        navigateTo,
        renderCurrentPage,
    };
})();