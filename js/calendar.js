/**
 * ============================================================
 * CALENDAR — ЛОГИКА КАЛЕНДАРЯ
 * ============================================================
 */
import { CONFIG } from './config.js';
import { Data } from './data.js';
import { Utils } from './utils.js';

export const Calendar = (() => {
    let _view = 'month';
    let _baseDate = new Date();
    let _selectedDate = new Date();
    let _activeFilters = [];

    const WEEK_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    const init = () => {
        const savedView = localStorage.getItem(CONFIG.STORAGE.CALENDAR_VIEW_KEY);
        if (savedView && ['day', 'week', 'month', 'year'].includes(savedView)) {
            _view = savedView;
        }
        _activeFilters = Data.journals().map(j => j.name);
    };

    const getView = () => _view;
    const getBaseDate = () => new Date(_baseDate);
    const getSelectedDate = () => new Date(_selectedDate);
    const getActiveFilters = () => [..._activeFilters];

    const setView = (view) => {
        if (['day', 'week', 'month', 'year'].includes(view)) {
            _view = view;
            localStorage.setItem(CONFIG.STORAGE.CALENDAR_VIEW_KEY, view);
        }
    };

    const setBaseDate = (date) => { _baseDate = new Date(date); };
    const setSelectedDate = (date) => { _selectedDate = new Date(date); };

    const navigate = (direction) => {
        const d = new Date(_baseDate);
        switch (_view) {
            case 'day':
                d.setDate(d.getDate() + direction);
                break;
            case 'week':
                d.setDate(d.getDate() + direction * 7);
                break;
            case 'month':
                d.setMonth(d.getMonth() + direction);
                break;
            case 'year':
                d.setFullYear(d.getFullYear() + direction);
                break;
        }
        _baseDate = d;
        return d;
    };

    const toggleFilter = (journalName) => {
        const idx = _activeFilters.indexOf(journalName);
        if (idx > -1) {
            _activeFilters.splice(idx, 1);
        } else {
            _activeFilters.push(journalName);
        }
        if (_activeFilters.length === 0) {
            _activeFilters = Data.journals().map(j => j.name);
        }
        return [..._activeFilters];
    };

    const getWeekDays = () => [...WEEK_DAYS];

    const getMonthData = (year, month) => {
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
                isToday: false,
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const isToday = date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();
            week.push({ day: d, month, year, isOtherMonth: false, isToday });
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
                    isToday: false,
                });
                nextMonthDay++;
            }
            weeks.push(week);
        }

        return weeks;
    };

    const getWeekData = (baseDate) => {
        const start = new Date(baseDate);
        start.setDate(start.getDate() - start.getDay());
        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            week.push(d);
        }
        return week;
    };

    const getYearData = (year) => {
        const months = [];
        for (let m = 0; m < 12; m++) {
            const date = new Date(year, m, 1);
            months.push({
                month: m,
                year,
                name: date.toLocaleString('ru-RU', { month: 'short' }),
            });
        }
        return months;
    };

    const getTitle = () => {
        const d = _baseDate;
        switch (_view) {
            case 'day':
                return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            case 'week': {
                const start = new Date(d);
                start.setDate(start.getDate() - start.getDay());
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                if (start.getMonth() === end.getMonth()) {
                    return start.getDate() + ' – ' + end.getDate() + ' ' +
                        start.toLocaleString('ru-RU', { month: 'long' }) + ' ' + start.getFullYear();
                }
                return start.getDate() + ' ' + start.toLocaleString('ru-RU', { month: 'short' }) +
                    ' – ' + end.getDate() + ' ' + end.toLocaleString('ru-RU', { month: 'short' }) +
                    ' ' + start.getFullYear();
            }
            case 'month':
                return d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
            case 'year':
                return d.getFullYear().toString();
            default:
                return '';
        }
    };

    init();

    return {
        getView,
        getBaseDate,
        getSelectedDate,
        getActiveFilters,
        setView,
        setBaseDate,
        setSelectedDate,
        navigate,
        toggleFilter,
        getWeekDays,
        getMonthData,
        getWeekData,
        getYearData,
        getTitle,
    };
})();