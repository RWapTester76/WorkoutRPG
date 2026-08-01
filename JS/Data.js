const Data = {
    _data: null,
    _listeners: [],

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
    },

    save() {
        localStorage.setItem('skillquest_data', JSON.stringify(this._data));
        this._notifyListeners();
    },

    subscribe(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    },

    _notifyListeners() {
        this._listeners.forEach(cb => cb(this._data));
    },

    getDefaultData() {
        return {
            profile: {
                name: 'Герой',
                age: 25,
                weight: 70,
                height: 175,
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
        };
    },

    get profile() { return this._data.profile; },
    get journals() { return this._data.journals; },
    get tasks() { return this._data.tasks; },
    get goals() { return this._data.goals; },
    get weightLog() { return this._data.weightLog; },

    getJournalByName(name) {
        return this._data.journals.find(j => j.name === name);
    },

    addTask(task) {
        const newTask = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            ...task,
            completedDates: [],
            missedDates: [],
            createdAt: new Date().toISOString(),
        };
        this._data.tasks.push(newTask);
        this.save();
        return newTask;
    },

    updateTask(id, updates) {
        const index = this._data.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this._data.tasks[index] = { ...this._data.tasks[index], ...updates };
            this.save();
            return this._data.tasks[index];
        }
        return null;
    },

    deleteTask(id) {
        this._data.tasks = this._data.tasks.filter(t => t.id !== id);
        this.save();
    },

    getTasksForDate(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return this._data.tasks.filter(task => {
            const start = task.startDate || task.date;
            const end = task.endDate || task.date;
            const days = task.daysOfWeek || [];
            const d = new Date(dateStr);
            const dayOfWeek = d.getDay();
            if (days.length === 0) {
                return dateStr >= start && dateStr <= end;
            }
            return days.includes(dayOfWeek) && dateStr >= start && dateStr <= end;
        });
    },

    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.getTasksForDate(today);
    },

    getTaskStatus(task, dateStr) {
        if (task.completedDates.includes(dateStr)) return 'done';
        if (task.missedDates.includes(dateStr)) return 'missed';
        const taskDate = new Date(dateStr);
        const now = new Date();
        if (taskDate < now && !this.isSameDay(taskDate, now)) return 'missed';
        return 'pending';
    },

    isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    },

    recalcLevel() {
        const exp = this._data.profile.totalExp;
        let level = 1;
        let needed = 100;
        while (exp >= needed) {
            level++;
            needed = level * 100;
        }
        this._data.profile.level = level;
        this.save();
        return { level, exp, needed };
    },

    addExp(amount) {
        this._data.profile.totalExp += amount;
        this.recalcLevel();
        this.save();
    },

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
    },

    completeTaskInstance(taskId, dateStr) {
        const task = this._data.tasks.find(t => t.id === taskId);
        if (!task) return false;
        if (task.completedDates.includes(dateStr)) return false;

        const now = new Date();
        const taskDate = new Date(dateStr);
        const isLate = taskDate < now && !this.isSameDay(taskDate, now);

        const expJournal = task.duration * 0.01;
        const expTotal = task.duration * 0.005;
        const multiplier = isLate ? 0.5 : 1;

        const journal = this.getJournalByName(task.journal);
        if (journal) journal.exp += expJournal * multiplier;
        this._data.profile.totalExp += expTotal * multiplier;

        task.completedDates.push(dateStr);
        this.recalcLevel();
        this.updateStreak();
        this.save();
        return true;
    },

    autoMissTasks() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
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
    },

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
};

Data.load();
window.Data = Data;