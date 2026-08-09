// js/core/Calendar.js
import data from './Data.js';

class CalendarManager {
    constructor() {
        this._view = 'month';
        this._baseDate = new Date();
        this._selectedDate = new Date();
        this._activeFilters = [];
        this.isInitialized = false;
    }

    init() {
        this._baseDate = new Date();
        this._selectedDate = new Date();
        const savedView = localStorage.getItem('skillquest_calendar_view');
        if (savedView) this._view = savedView;
        this._activeFilters = data.journals.map(j => j.name);
        this.isInitialized = true;
        return this;
    }

    getView() { return this._view; }
    getBaseDate() { return this._baseDate; }
    getSelectedDate() { return this._selectedDate; }
    getActiveFilters() { return this._activeFilters; }

    setView(view) {
        this._view = view;
        localStorage.setItem('skillquest_calendar_view', view);
    }

    setBaseDate(date) { this._baseDate = new Date(date); }
    setSelectedDate(date) { this._selectedDate = new Date(date); }

    toggleFilter(journal) {
        const idx = this._activeFilters.indexOf(journal);
        if (idx > -1) {
            this._activeFilters.splice(idx, 1);
        } else {
            this._activeFilters.push(journal);
        }
        if (this._activeFilters.length === 0) {
            this._activeFilters = data.journals.map(j => j.name);
        }
        return this._activeFilters;
    }

    setAllFilters() {
        this._activeFilters = data.journals.map(j => j.name);
        return this._activeFilters;
    }

    navigate(direction) {
        const d = new Date(this._baseDate);
        if (this._view === 'day') d.setDate(d.getDate() + direction);
        else if (this._view === 'week') d.setDate(d.getDate() + direction * 7);
        else if (this._view === 'month') d.setMonth(d.getMonth() + direction);
        else if (this._view === 'year') d.setFullYear(d.getFullYear() + direction);
        this._baseDate = d;
        return d;
    }

    getWeekDays() { return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']; }

    getMonthData(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const weeks = [];
        let week = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            week.push({
                day,
                month: month - 1,
                year: month === 0 ? year - 1 : year,
                isOtherMonth: true,
                isToday: false
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isToday = date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();
            week.push({
                day: d,
                month,
                year,
                isOtherMonth: false,
                isToday
            });
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        }

        if (week.length > 0) {
            let nextMonthDay = 1;
            while (week.length < 7) {
                week.push({
                    day: nextMonthDay,
                    month: month + 1,
                    year: month === 11 ? year + 1 : year,
                    isOtherMonth: true,
                    isToday: false
                });
                nextMonthDay++;
            }
            weeks.push(week);
        }

        return weeks;
    }

    getWeekData(baseDate) {
        const start = new Date(baseDate);
        start.setDate(start.getDate() - start.getDay());
        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            week.push(d);
        }
        return week;
    }

    getYearData(year) {
        const months = [];
        for (let m = 0; m < 12; m++) {
            const date = new Date(year, m, 1);
            months.push({
                month: m,
                year,
                name: date.toLocaleString('ru-RU', { month: 'short' })
            });
        }
        return months;
    }

    getTitle() {
        const d = this._baseDate;
        if (this._view === 'day') {
            return d.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        if (this._view === 'week') {
            const start = new Date(d);
            start.setDate(start.getDate() - start.getDay());
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            if (start.getMonth() === end.getMonth()) {
                return start.getDate() + ' – ' + end.getDate() + ' ' +
                    start.toLocaleString('ru-RU', { month: 'long' }) +
                    ' ' + start.getFullYear();
            }
            return start.getDate() + ' ' +
                start.toLocaleString('ru-RU', { month: 'short' }) +
                ' – ' + end.getDate() + ' ' +
                end.toLocaleString('ru-RU', { month: 'short' }) +
                ' ' + start.getFullYear();
        }
        if (this._view === 'month') {
            return d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
        }
        return d.getFullYear().toString();
    }
}

// Экспортируем синглтон
const calendar = new CalendarManager();
export default calendar;