// js/pages/BasePage.js
import eventBus from '../core/EventBus.js';
import ui from '../ui/UI.js';

class BasePage {
    constructor() {
        this.container = document.getElementById('mainContent');
        this.eventBus = eventBus;
        this.ui = ui;
        this._subscriptions = [];
    }

    // Метод для рендеринга страницы (должен быть переопределен)
    render() {
        throw new Error('Метод render() должен быть переопределен');
    }

    // Подписка на события
    subscribe(event, callback) {
        const unsubscribe = this.eventBus.subscribe(event, callback);
        this._subscriptions.push(unsubscribe);
        return unsubscribe;
    }

    // Отписка от всех событий
    destroy() {
        this._subscriptions.forEach(unsubscribe => unsubscribe());
        this._subscriptions = [];
    }

    // Обновление заголовка страницы
    setPageTitle(title) {
        const titleEl = document.querySelector('.header-title');
        if (titleEl) titleEl.textContent = title;
    }

    // Обновление приветствия
    updateGreeting() {
        const greetingEl = document.getElementById('greetingText');
        if (greetingEl) greetingEl.textContent = this.ui.getGreeting();
    }

    // Обновление аватара
    updateAvatar() {
        this.ui.updateHeaderAvatar();
    }

    // Показать тост
    toast(message, type = 'info', duration = 3000) {
        this.ui.toast(message, type, duration);
    }

    // Очистка контейнера
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // Вставка HTML в контейнер
    renderHTML(html) {
        if (this.container) {
            this.container.innerHTML = html;
        }
        return this.container;
    }

    // Поиск элемента в контейнере
    find(selector) {
        return this.container ? this.container.querySelector(selector) : null;
    }

    // Поиск всех элементов в контейнере
    findAll(selector) {
        return this.container ? this.container.querySelectorAll(selector) : [];
    }
}

export default BasePage;