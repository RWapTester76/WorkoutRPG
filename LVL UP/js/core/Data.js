// js/core/Data.js
import eventBus from './EventBus.js';

class DataManager {
    constructor() {
        this._data = null;
        this.load();
    }

    load() {
        const raw = localStorage.getItem('skillquest_data');
        if (raw) {
            try {
                this._data = JSON.parse(raw);
            } catch (e) {
                this._data = this.getDefaultData();
            }
        } else {
            this._data = this.getDefaultData();
        }
        return this._data;
    }

    save() {
        localStorage.setItem('skillquest_data', JSON.stringify(this._data));
        eventBus.publish('dataChanged', this._data);
    }

    getDefaultData() {
        return {
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
                { name: 'другое', exp: 0, icon: '📌' }
            ],
            tasks: [],
            goals: [],
            weightLog: [],
            notes: [],
            photos: []
        };
    }

    // Геттеры
    get profile() { return this._data.profile; }
    get journals() { return this._data.journals; }
    get tasks() { return this._data.tasks; }
    get goals() { return this._data.goals; }
    get notes() { return this._data.notes; }
    get photos() { return this._data.photos; }

    getJournalByName(name) {
        return this._data.journals.find(j => j.name === name);
    }

    // ===== CRUD операции для задач =====
    addTask(task) {
        const newTask = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            ...task,
            completedDates: [],
            missedDates: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this._data.tasks.push(newTask);
        this.save();
        return newTask;
    }

    updateTask(id, updates) {
        const idx = this._data.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            this._data.tasks[idx] = {
                ...this._data.tasks[idx],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this._data.tasks[idx];
        }
        return null;
    }

    deleteTask(id) {
        this._data.tasks = this._data.tasks.filter(t => t.id !== id);
        this.save();
    }

    // ===== CRUD операции для целей =====
    addGoal(goal) {
        const newGoal = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            ...goal,
            achieved: false,
            createdAt: new Date().toISOString()
        };
        this._data.goals.push(newGoal);
        this.save();
        return newGoal;
    }

    updateGoal(id, updates) {
        const idx = this._data.goals.findIndex(g => g.id === id);
        if (idx !== -1) {
            this._data.goals[idx] = { ...this._data.goals[idx], ...updates };
            this.save();
            return this._data.goals[idx];
        }
        return null;
    }

    deleteGoal(id) {
        this._data.goals = this._data.goals.filter(g => g.id !== id);
        this.save();
    }

    // ===== CRUD операции для заметок =====
    addNote(note) {
        const newNote = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            text: note.text,
            taskId: note.taskId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this._data.notes.push(newNote);
        this.save();
        return newNote;
    }

    updateNote(id, updates) {
        const idx = this._data.notes.findIndex(n => n.id === id);
        if (idx !== -1) {
            this._data.notes[idx] = {
                ...this._data.notes[idx],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this._data.notes[idx];
        }
        return null;
    }

    deleteNote(id) {
        this._data.notes = this._data.notes.filter(n => n.id !== id);
        this.save();
    }

    // ===== CRUD операции для фото =====
    addPhoto(photoData) {
        const newPhoto = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            data: photoData.data,
            note: photoData.note || '',
            date: photoData.date || new Date().toISOString()
        };
        this._data.photos.push(newPhoto);
        this.save();
        return newPhoto;
    }

    deletePhoto(id) {
        this._data.photos = this._data.photos.filter(p => p.id !== id);
        this.save();
    }

    // ===== Вспомогательные методы =====
    getTasksForDate(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this._data.tasks.filter(task => {
            const start = task.startDate || task.date;
            const end = task.endDate || task.date;
            const days = task.daysOfWeek || [];
            const d = new Date(dateStr);
            const dayOfWeek = d.getDay();
            if (days.length === 0) return dateStr >= start && dateStr <= end;
            return days.includes(dayOfWeek) && dateStr >= start && dateStr <= end;
        });
    }

    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.getTasksForDate(today);
    }

    getTaskStatus(task, dateStr) {
        if (task.completedDates.includes(dateStr)) return 'done';
        if (task.missedDates.includes(dateStr)) return 'missed';
        const taskDate = new Date(dateStr);
        const now = new Date();
        if (taskDate < now && !this.isSameDay(taskDate, now)) return 'missed';
        return 'pending';
    }

    isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    recalcLevel() {
        const exp = this._data.profile.totalExp;
        let level = 1,
            needed = 100;
        while (exp >= needed) {
            level++;
            needed = level * 100;
        }
        this._data.profile.level = level;
        return { level, exp, needed };
    }

    addExp(amount) {
        this._data.profile.totalExp += amount;
        this.recalcLevel();
        this.save();
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const last = this._data.profile.lastActive;
        if (last === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (last === yesterdayStr) {
            this._data.profile.streak += 1;
        } else {
            this._data.profile.streak = 1;
        }
        this._data.profile.lastActive = today;
        this.save();
    }

    completeTaskInstance(taskId, dateStr) {
        const task = this._data.tasks.find(t => t.id === taskId);
        if (!task) return false;
        if (task.completedDates.includes(dateStr)) return false;

        const now = new Date();
        const taskDate = new Date(dateStr);
        const isLate = taskDate < now && !this.isSameDay(taskDate, now);
        const multiplier = isLate ? 0.25 : 1;
        const expJournal = task.duration * 0.01;
        const expTotal = task.duration * 0.005;

        const journal = this.getJournalByName(task.journal);
        if (journal) journal.exp += expJournal * multiplier;

        this._data.profile.totalExp += expTotal * multiplier;
        task.completedDates.push(dateStr);

        if (task.missedDates.includes(dateStr)) {
            const idx = task.missedDates.indexOf(dateStr);
            if (idx > -1) task.missedDates.splice(idx, 1);
        }

        this.recalcLevel();
        this.updateStreak();
        this.save();
        this.checkGoalsAchievement();

        return expTotal * multiplier;
    }

    autoMissTasks() {
        const now = new Date();
        this._data.tasks.forEach(task => {
            const start = task.startDate || task.date;
            const end = task.endDate || task.date;
            const days = task.daysOfWeek || [];
            let current = new Date(start);
            const endDate = new Date(end);
            while (current <= endDate) {
                const dateStr = current.toISOString().split('T')[0];
                const d = new Date(dateStr);
                if (d < now && !this.isSameDay(d, now) &&
                    !task.completedDates.includes(dateStr) &&
                    !task.missedDates.includes(dateStr)) {
                    if (days.length === 0 || days.includes(d.getDay())) {
                        task.missedDates.push(dateStr);
                    }
                }
                current.setDate(current.getDate() + 1);
            }
        });
        this.save();
    }

    getDateRange(startDate, endDate) {
        const dates = [];
        let current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    checkGoalsAchievement() {
        this._data.goals.forEach(goal => {
            if (goal.achieved) return;
            const goalTasks = this._data.tasks.filter(t => t.goalId === goal.id);
            if (goalTasks.length === 0) return;

            const allDone = goalTasks.every(task => {
                const dates = this.getDateRange(
                    task.startDate || task.date,
                    task.endDate || task.date
                );
                return dates.every(d =>
                    task.completedDates.includes(d) ||
                    task.missedDates.includes(d)
                );
            });

            if (allDone) {
                goal.achieved = true;
                this._data.profile.totalExp += 0.05;
                this.recalcLevel();
                this.save();
                eventBus.publish('goalAchieved', goal);
            }
        });
    }

    resetAllData() {
        localStorage.removeItem('skillquest_data');
        localStorage.removeItem('skillquest_theme');
        localStorage.removeItem('skillquest_dark');
        localStorage.removeItem('skillquest_calendar_view');
        this._data = this.getDefaultData();
        this.save();
        eventBus.publish('dataReset');
    }
}

// Создаем и экспортируем единственный экземпляр
const data = new DataManager();
export default data;