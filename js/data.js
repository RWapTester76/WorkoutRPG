/**
 * ============================================================
 * DATA LAYER — ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ
 * ============================================================
 */
import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export const Data = (() => {
    // === Приватное состояние ===
    let _data = null;
    let _listeners = [];

    // === Схема данных ===
    const DEFAULT_DATA = () => ({
        profile: {
            name: 'Герой',
            age: 25,
            weight: 70,
            height: 175,
            neck: 0,
            chest: 100,
            waist: 80,
            hips: 100,
            biceps: 35,
            avatar: null,
            totalExp: 0,
            level: 1,
            streak: 0,
            lastActive: null,
        },
        journals: [
            { name: 'тело', exp: 0, icon: '💪' },
            { name: 'питание', exp: 0, icon: '🍎' },
            { name: 'дела', exp: 0, icon: '📋' },
            { name: 'учеба', exp: 0, icon: '📚' },
            { name: 'хобби', exp: 0, icon: '🎨' },
            { name: 'путешествия', exp: 0, icon: '✈️' },
            { name: 'долги', exp: 0, icon: '💰' },
            { name: 'другое', exp: 0, icon: '📌' },
        ],
        tasks: [],
        goals: [],
        weightLog: [],
        notes: [],
        photos: [],
    });

    // === Валидация данных ===
    const validateData = (raw) => {
        if (!raw || typeof raw !== 'object') return DEFAULT_DATA();
        const defaultData = DEFAULT_DATA();
        const validated = { ...defaultData };

        if (raw.profile && typeof raw.profile === 'object') {
            validated.profile = { ...validated.profile, ...raw.profile };
        }

        if (Array.isArray(raw.journals) && raw.journals.length === 8) {
            validated.journals = raw.journals.map((j, i) => ({
                ...validated.journals[i],
                ...j,
                exp: typeof j.exp === 'number' ? j.exp : 0,
            }));
        }

        if (Array.isArray(raw.tasks)) {
            validated.tasks = raw.tasks.filter(t => t && typeof t === 'object');
        }

        if (Array.isArray(raw.goals)) {
            validated.goals = raw.goals.filter(g => g && typeof g === 'object');
        }

        if (Array.isArray(raw.weightLog)) {
            validated.weightLog = raw.weightLog.filter(w => w && typeof w === 'object');
        }

        if (Array.isArray(raw.notes)) {
            validated.notes = raw.notes.filter(n => n && typeof n === 'object');
        }

        if (Array.isArray(raw.photos)) {
            validated.photos = raw.photos.filter(p => p && typeof p === 'object');
        }

        return validated;
    };

    // === Загрузка ===
    const load = () => {
        const raw = localStorage.getItem(CONFIG.STORAGE.KEY);
        if (raw) {
            const parsed = Utils.safeJSONParse(raw, null);
            _data = validateData(parsed);
        } else {
            _data = DEFAULT_DATA();
        }
        _data.profile.level = calculateLevel(_data.profile.totalExp);
        return _data;
    };

    // === Сохранение ===
    const save = () => {
        if (!_data) return;
        localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify(_data));
        notify();
    };

    // === Подписка ===
    const subscribe = (callback) => {
        _listeners.push(callback);
        return () => {
            _listeners = _listeners.filter(cb => cb !== callback);
        };
    };

    const notify = () => {
        _listeners.forEach(cb => {
            try { cb(_data); } catch (e) { console.warn('Listener error:', e); }
        });
    };

    // === Вычисление уровня ===
    const calculateLevel = (exp) => {
        let level = 1;
        let needed = CONFIG.XP.PER_LEVEL;
        while (exp >= needed) {
            level++;
            needed = level * CONFIG.XP.PER_LEVEL;
        }
        return level;
    };

    const getLevelInfo = (exp) => {
        let level = 1;
        let needed = CONFIG.XP.PER_LEVEL;
        let totalNeeded = 0;

        while (exp >= needed) {
            level++;
            totalNeeded += needed;
            needed = level * CONFIG.XP.PER_LEVEL;
        }

        const startOfLevel = totalNeeded;
        const expInLevel = exp - startOfLevel;

        return {
            level,
            expInLevel: Utils.round(expInLevel, 2),
            neededForNext: needed,
            progress: Math.min((expInLevel / needed) * 100, 100),
            totalExp: exp,
        };
    };

    const getJournalByName = (name) => {
        return _data.journals.find(j => j.name === name);
    };

    const getDateRange = (startDate, endDate) => {
        const dates = [];
        let current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
            dates.push(Utils.toDateStr(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const getTasksForDate = (date) => {
        const dateStr = typeof date === 'string' ? date : Utils.toDateStr(date);
        return _data.tasks.filter(task => {
            const start = task.startDate || task.date;
            const end = task.endDate || task.date;
            if (!start || !end) return false;
            const days = task.daysOfWeek || [];
            const d = new Date(dateStr);
            const dayOfWeek = d.getDay();
            if (days.length > 0 && !days.includes(dayOfWeek)) return false;
            return dateStr >= start && dateStr <= end;
        });
    };

    const getTaskStatus = (task, dateStr) => {
        if (task.completedDates?.includes(dateStr)) return 'done';
        if (task.missedDates?.includes(dateStr)) return 'missed';
        const taskDate = new Date(dateStr);
        const now = new Date();
        if (taskDate < now && !Utils.isToday(taskDate)) return 'missed';
        return 'pending';
    };

    // === Геттеры ===
    const getData = () => _data;
    const getProfile = () => _data.profile;
    const getJournals = () => _data.journals;
    const getTasks = () => _data.tasks;
    const getGoals = () => _data.goals;
    const getNotes = () => _data.notes;
    const getPhotos = () => _data.photos;
    const getWeightLog = () => _data.weightLog || [];

    // === Мутации ===
    const addTask = (task) => {
        const newTask = {
            id: Utils.generateId(),
            title: task.title || 'Без названия',
            journal: task.journal || 'другое',
            startDate: task.startDate || Utils.toDateStr(new Date()),
            endDate: task.endDate || Utils.toDateStr(new Date()),
            daysOfWeek: task.daysOfWeek || [],
            time: task.time || '09:00',
            duration: Math.max(1, task.duration || 30),
            note: task.note || '',
            reminderMinutes: Math.max(0, task.reminderMinutes || 0),
            goalId: task.goalId || null,
            completedDates: [],
            missedDates: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        _data.tasks.push(newTask);
        save();
        return newTask;
    };

    const updateTask = (id, updates) => {
        const idx = _data.tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        _data.tasks[idx] = {
            ..._data.tasks[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        save();
        return _data.tasks[idx];
    };

    const deleteTask = (id) => {
        _data.tasks = _data.tasks.filter(t => t.id !== id);
        save();
    };

    const addGoal = (goal) => {
        const newGoal = {
            id: Utils.generateId(),
            title: goal.title || 'Без названия',
            description: goal.description || '',
            deadline: goal.deadline || Utils.toDateStr(new Date()),
            checkpoints: goal.checkpoints || [],
            achieved: false,
            createdAt: new Date().toISOString(),
        };
        _data.goals.push(newGoal);
        save();
        return newGoal;
    };

    const updateGoal = (id, updates) => {
        const idx = _data.goals.findIndex(g => g.id === id);
        if (idx === -1) return null;
        _data.goals[idx] = { ..._data.goals[idx], ...updates };
        save();
        return _data.goals[idx];
    };

    const deleteGoal = (id) => {
        _data.goals = _data.goals.filter(g => g.id !== id);
        save();
    };

    const addNote = (note) => {
        const newNote = {
            id: Utils.generateId(),
            text: note.text || '',
            taskId: note.taskId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        _data.notes.push(newNote);
        save();
        return newNote;
    };

    const updateNote = (id, updates) => {
        const idx = _data.notes.findIndex(n => n.id === id);
        if (idx === -1) return null;
        _data.notes[idx] = {
            ..._data.notes[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        save();
        return _data.notes[idx];
    };

    const deleteNote = (id) => {
        _data.notes = _data.notes.filter(n => n.id !== id);
        save();
    };

    const addPhoto = (photo) => {
        const newPhoto = {
            id: Utils.generateId(),
            data: photo.data || '',
            note: photo.note || '',
            date: photo.date || new Date().toISOString(),
        };
        _data.photos.push(newPhoto);
        save();
        return newPhoto;
    };

    const deletePhoto = (id) => {
        _data.photos = _data.photos.filter(p => p.id !== id);
        save();
    };

    const completeTaskInstance = (taskId, dateStr) => {
        const task = _data.tasks.find(t => t.id === taskId);
        if (!task) return false;
        if (task.completedDates?.includes(dateStr)) return false;

        const now = new Date();
        const taskDate = new Date(dateStr);
        const isLate = taskDate < now && !Utils.isToday(taskDate);
        const multiplier = isLate ? CONFIG.XP.LATE_MULTIPLIER : 1;

        const expJournal = task.duration * CONFIG.XP.JOURNAL_PER_MIN;
        const expTotal = task.duration * CONFIG.XP.TOTAL_PER_MIN;

        const journal = getJournalByName(task.journal);
        if (journal) {
            journal.exp += expJournal * multiplier;
        }

        _data.profile.totalExp += expTotal * multiplier;
        _data.profile.level = calculateLevel(_data.profile.totalExp);

        if (!task.completedDates) task.completedDates = [];
        task.completedDates.push(dateStr);

        if (task.missedDates) {
            const missedIdx = task.missedDates.indexOf(dateStr);
            if (missedIdx > -1) {
                task.missedDates.splice(missedIdx, 1);
            }
        }

        updateStreak();
        save();
        checkGoalsAchievement();

        const earned = Utils.round(expTotal * multiplier, 2);
        const message = `✅ Задача выполнена! +${earned} XP${isLate ? ' (опоздание, 25%)' : ''}`;
        return { success: true, earned, isLate, message };
    };

    const updateStreak = () => {
        const today = Utils.toDateStr(new Date());
        const last = _data.profile.lastActive;
        if (last === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = Utils.toDateStr(yesterday);

        if (last === yesterdayStr) {
            _data.profile.streak += 1;
        } else {
            _data.profile.streak = 1;
        }
        _data.profile.lastActive = today;
    };

    const checkGoalsAchievement = () => {
        _data.goals.forEach(goal => {
            if (goal.achieved) return;
            const goalTasks = _data.tasks.filter(t => t.goalId === goal.id);
            if (goalTasks.length === 0) return;

            const allDone = goalTasks.every(task => {
                const start = task.startDate || task.date;
                const end = task.endDate || task.date;
                const dates = getDateRange(start, end);
                return dates.every(d => task.completedDates?.includes(d) || task.missedDates?.includes(d));
            });

            if (allDone) {
                goal.achieved = true;
                _data.profile.totalExp += CONFIG.XP.GOAL_BONUS;
                _data.profile.level = calculateLevel(_data.profile.totalExp);
                save();
                return true;
            }
            return false;
        });
    };

    const autoMissTasks = () => {
        const now = new Date();
        const todayStr = Utils.toDateStr(now);
        let changed = false;

        _data.tasks.forEach(task => {
            const start = task.startDate || task.date;
            const end = task.endDate || task.date;
            const days = task.daysOfWeek || [];

            if (!start || !end) return;

            let current = new Date(start);
            const endDate = new Date(end);

            while (current <= endDate) {
                const dateStr = Utils.toDateStr(current);
                const d = new Date(dateStr);

                if (d < now && !Utils.isToday(d) &&
                    !task.completedDates?.includes(dateStr) &&
                    !task.missedDates?.includes(dateStr)) {
                    if (days.length === 0 || days.includes(d.getDay())) {
                        if (!task.missedDates) task.missedDates = [];
                        task.missedDates.push(dateStr);
                        changed = true;
                    }
                }
                current.setDate(current.getDate() + 1);
            }
        });

        if (changed) {
            save();
        }
        return changed;
    };

    const resetAllData = () => {
        localStorage.removeItem(CONFIG.STORAGE.KEY);
        localStorage.removeItem(CONFIG.STORAGE.THEME_KEY);
        localStorage.removeItem(CONFIG.STORAGE.DARK_KEY);
        localStorage.removeItem(CONFIG.STORAGE.CALENDAR_VIEW_KEY);
        _data = DEFAULT_DATA();
        save();
        return _data;
    };

    // Инициализация
    load();

    // === Публичный API ===
    return {
        get: getData,
        profile: getProfile,
        journals: getJournals,
        tasks: getTasks,
        goals: getGoals,
        notes: getNotes,
        photos: getPhotos,
        weightLog: getWeightLog,
        getJournalByName,
        getLevelInfo,
        getTasksForDate,
        getTaskStatus,
        getDateRange,
        addTask,
        updateTask,
        deleteTask,
        addGoal,
        updateGoal,
        deleteGoal,
        addNote,
        updateNote,
        deleteNote,
        addPhoto,
        deletePhoto,
        completeTaskInstance,
        autoMissTasks,
        resetAllData,
        subscribe,
        save,
    };
})();