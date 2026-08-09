// js/core/EventBus.js
class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Возвращаем функцию для отписки
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }

    publish(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// Создаем глобальный экземпляр
const eventBus = new EventBus();
export default eventBus;