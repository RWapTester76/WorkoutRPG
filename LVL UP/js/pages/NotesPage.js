// js/pages/NotesPage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class NotesPage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('noteChanged', () => this.render());
    }

    render() {
        this.clear();
        this.setPageTitle('Заметки');

        const notes = data.notes;

        this.renderHTML(`
            <div class="section-header">
                <h2>Заметки</h2>
                <button class="btn" id="addNoteBtn">+ Новая заметка</button>
            </div>
            ${notes.length === 0 ? `
                <div class="tasks-empty">
                    <div class="empty-icon">📝</div>
                    <p>Заметок пока нет</p>
                    <p style="color:var(--text-secondary)">Создайте первую заметку</p>
                </div>
            ` : `
                ${notes.slice().reverse().map(note => {
                    const task = data.tasks.find(t => t.id === note.taskId);
                    return `
                        <div class="note-item" data-note-id="${note.id}">
                            <div class="note-text">
                                <div style="font-weight:500;">${note.text}</div>
                                <div class="note-date">
                                    ${this.ui.formatDate(note.createdAt, 'datetime')} 
                                    ${task ? '→ ' + task.title : ''}
                                </div>
                            </div>
                            <div class="note-actions">
                                <button class="btn btn-sm btn-secondary edit-note-btn" data-note-id="${note.id}">✏️</button>
                                <button class="btn btn-sm btn-danger delete-note-btn" data-note-id="${note.id}">🗑</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            `}
        `);

        // Кнопка "Новая заметка"
        this.find('#addNoteBtn')?.addEventListener('click', () => {
            this.ui.openNoteModal();
        });

        // Кнопки "Редактировать"
        this.findAll('.edit-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.openNoteModal(btn.dataset.noteId);
            });
        });

        // Кнопки "Удалить"
        this.findAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.deleteNote(btn.dataset.noteId);
            });
        });

        // Клик по заметке для просмотра
        this.findAll('.note-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const noteId = el.dataset.noteId;
                if (noteId) this.ui.openNoteView(noteId);
            });
        });
    }
}

export default NotesPage;