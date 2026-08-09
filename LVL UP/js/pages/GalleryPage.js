// js/pages/GalleryPage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class GalleryPage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
        this.subscribe('photoChanged', () => this.render());
    }

    render() {
        this.clear();
        this.setPageTitle('Галерея');

        const photos = data.photos;

        this.renderHTML(`
            <div class="section-header">
                <h2>Галерея</h2>
                <button class="btn" id="addPhotoBtn">+ Добавить фото</button>
            </div>
            ${photos.length === 0 ? `
                <div class="tasks-empty">
                    <div class="empty-icon">🖼</div>
                    <p>Фото пока нет</p>
                    <p style="color:var(--text-secondary)">Добавьте первое фото</p>
                </div>
            ` : `
                <div class="photo-grid">
                    ${photos.slice().reverse().map(photo => `
                        <div class="photo-item" data-photo-id="${photo.id}">
                            <img src="${photo.data}" alt="Фото">
                            <div class="photo-meta">
                                ${photo.note ? photo.note : ''} 
                                ${this.ui.formatDate(photo.date, 'short')}
                            </div>
                            <button class="photo-delete" data-photo-id="${photo.id}">✕</button>
                        </div>
                    `).join('')}
                </div>
            `}
        `);

        // Кнопка "Добавить фото"
        this.find('#addPhotoBtn')?.addEventListener('click', () => {
            this.ui.addPhoto();
        });

        // Кнопки "Удалить"
        this.findAll('.photo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.ui.deletePhoto(btn.dataset.photoId);
            });
        });

        // Клик по фото для просмотра
        this.findAll('.photo-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.photo-delete')) return;
                const photoId = el.dataset.photoId;
                if (photoId) this.ui.openPhotoView(photoId);
            });
        });
    }
}

export default GalleryPage;