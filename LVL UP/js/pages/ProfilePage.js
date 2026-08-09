// js/pages/ProfilePage.js
import BasePage from './BasePage.js';
import data from '../core/Data.js';
import eventBus from '../core/EventBus.js';

class ProfilePage extends BasePage {
    constructor() {
        super();
        this.subscribe('dataChanged', () => this.render());
    }

    render() {
        this.clear();
        this.setPageTitle('Профиль');

        const profile = data.profile;
        const { level, exp, needed } = data.recalcLevel();
        const progress = Math.min((exp / needed) * 100, 100);

        const journals = data.journals || [];
        const stats = journals.map(j => {
            const tasks = data.tasks.filter(t => t.journal === j.name);
            const total = tasks.length;
            const done = tasks.reduce((acc, t) => acc + t.completedDates.length, 0);
            const missed = tasks.reduce((acc, t) => acc + t.missedDates.length, 0);
            return { ...j, total, done, missed };
        }).sort((a, b) => b.total - a.total);

        const weightLog = (data.weightLog || [])
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));

        this.renderHTML(`
            <div class="card" style="text-align:center;">
                <div class="avatar avatar-xl" style="margin:0 auto;width:88px;height:88px;font-size:36px;position:relative;">
                    ${profile.avatar ? 
                        `<img src="${profile.avatar}" alt="avatar">` : 
                        `<span>${profile.name.charAt(0).toUpperCase()}</span>`
                    }
                    <input type="file" id="profileAvatarInput" accept="image/*" 
                           style="position:absolute;inset:0;opacity:0;cursor:pointer;">
                </div>
                <h2 style="font-size:24px;margin-top:12px;">${profile.name}</h2>
                <p style="color:var(--text-secondary);">Уровень ${level} · ${Math.floor(exp)} / ${needed} XP</p>
                <div style="margin-top:12px;">
                    <div class="progress" style="height:8px; background:var(--card-border);">
                        <div class="progress-bar" style="width:${progress}%;"></div>
                    </div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-top:4px;">
                        ${Math.round(progress)}% до следующего уровня
                    </div>
                </div>
                <div style="display:flex;justify-content:center;gap:24px;margin-top:16px;flex-wrap:wrap;">
                    <div>
                        <span style="font-size:20px;font-weight:700;">${profile.streak || 0}</span>
                        <br><span style="font-size:13px;color:var(--text-secondary);">🔥 Дней</span>
                    </div>
                    <div>
                        <span style="font-size:20px;font-weight:700;">${profile.age}</span>
                        <br><span style="font-size:13px;color:var(--text-secondary);">Возраст</span>
                    </div>
                    <div>
                        <span style="font-size:20px;font-weight:700;">${profile.weight} кг</span>
                        <br><span style="font-size:13px;color:var(--text-secondary);">Вес</span>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:16px;">
                <h3 style="font-size:18px;font-weight:600;margin-bottom:12px;">📝 Редактировать профиль</h3>
                <div class="form-group">
                    <label class="input-label">Имя</label>
                    <input type="text" class="input" id="pName" value="${profile.name}">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label class="input-label">Рост (см)</label>
                        <input type="number" class="input" id="pHeight" value="${profile.height}" step="0.1">
                    </div>
                    <div>
                        <label class="input-label">Вес (кг)</label>
                        <input type="number" class="input" id="pWeight" value="${profile.weight}" step="0.1">
                    </div>
                    <div>
                        <label class="input-label">Возраст</label>
                        <input type="number" class="input" id="pAge" value="${profile.age}">
                    </div>
                    <div>
                        <label class="input-label">Шея (см)</label>
                        <input type="number" class="input" id="pNeck" value="${profile.neck || 0}" step="0.5">
                    </div>
                    <div>
                        <label class="input-label">Грудь (см)</label>
                        <input type="number" class="input" id="pChest" value="${profile.chest}" step="0.5">
                    </div>
                    <div>
                        <label class="input-label">Талия (см)</label>
                        <input type="number" class="input" id="pWaist" value="${profile.waist}" step="0.5">
                    </div>
                    <div>
                        <label class="input-label">Бёдра (см)</label>
                        <input type="number" class="input" id="pHips" value="${profile.hips}" step="0.5">
                    </div>
                    <div>
                        <label class="input-label">Бицепс (см)</label>
                        <input type="number" class="input" id="pBiceps" value="${profile.biceps}" step="0.5">
                    </div>
                </div>
                <button class="btn" id="saveProfileBtn" style="width:100%;margin-top:16px;">💾 Сохранить профиль</button>
            </div>

            <div class="card" style="margin-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-size:18px;font-weight:600;">⚖️ Журнал веса</h3>
                    <button class="btn btn-sm" id="addWeightBtn">+ Добавить</button>
                </div>
                <div style="max-height:200px;overflow-y:auto;">
                    ${weightLog.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:var(--text-secondary);">Нет записей</div>
                    ` : weightLog.slice(0, 7).map(w => `
                        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--card-border);">
                            <span>${this.ui.formatDate(w.date, 'short')}</span>
                            <span><strong>${w.value} кг</strong></span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" style="margin-top:16px;">
                <h3 style="font-size:18px;font-weight:600;margin-bottom:12px;">📊 Статистика по журналам</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    ${stats.map(s => `
                        <div style="background:var(--card-border);padding:8px;border-radius:var(--radius-sm);">
                            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:500;">
                                <span>${s.icon} ${s.name.charAt(0).toUpperCase() + s.name.slice(1)}</span>
                                <span>${s.total} задач</span>
                            </div>
                            <div style="display:flex;gap:8px;font-size:12px;color:var(--text-secondary);margin-top:4px;">
                                <span>✅ ${s.done}</span>
                                <span>❌ ${s.missed}</span>
                                <span>${s.total > 0 ? Math.round((s.done / s.total) * 100) : 0}%</span>
                            </div>
                            <div class="progress" style="height:4px;margin-top:4px;">
                                <div class="progress-bar" style="width:${s.total > 0 ? (s.done / s.total) * 100 : 0}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);

        // Аватар
        this.find('#profileAvatarInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                data.profile.avatar = ev.target.result;
                data.save();
                this.ui.updateHeaderAvatar();
                this.render();
                this.ui.toast('✅ Аватар обновлён', 'success');
            };
            reader.readAsDataURL(file);
        });

        // Сохранение профиля
        this.find('#saveProfileBtn')?.addEventListener('click', () => {
            const name = this.find('#pName').value.trim() || 'Герой';
            const age = parseInt(this.find('#pAge').value) || 0;
            const weight = parseFloat(this.find('#pWeight').value) || 0;
            const height = parseFloat(this.find('#pHeight').value) || 0;
            const neck = parseFloat(this.find('#pNeck').value) || 0;
            const chest = parseFloat(this.find('#pChest').value) || 0;
            const waist = parseFloat(this.find('#pWaist').value) || 0;
            const hips = parseFloat(this.find('#pHips').value) || 0;
            const biceps = parseFloat(this.find('#pBiceps').value) || 0;

            const profile = data.profile;
            profile.name = name;
            profile.age = age;
            profile.weight = weight;
            profile.height = height;
            profile.neck = neck;
            profile.chest = chest;
            profile.waist = waist;
            profile.hips = hips;
            profile.biceps = biceps;

            data.save();
            this.ui.updateHeaderAvatar();
            this.ui.toast('✅ Профиль сохранён!', 'success');
            this.render();
        });

        // Добавление веса
        this.find('#addWeightBtn')?.addEventListener('click', () => {
            const date = prompt('Введите дату (ГГГГ-ММ-ДД):', 
                new Date().toISOString().split('T')[0]);
            if (!date) return;

            const value = prompt('Введите вес (кг):', '70');
            if (!value) return;

            const weightVal = parseFloat(value);
            if (isNaN(weightVal) || weightVal <= 0) {
                this.ui.toast('⚠️ Введите корректный вес', 'error');
                return;
            }

            if (!data.weightLog) data.weightLog = [];
            data.weightLog.push({ date, value: weightVal });
            data.save();
            this.render();
            this.ui.toast('✅ Запись добавлена', 'success');
        });
    }
}

export default ProfilePage;