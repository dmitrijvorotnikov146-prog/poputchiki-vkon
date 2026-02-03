// Основное приложение
const App = {
    // Конфигурация
    config: {
        appName: 'Попутчики',
        version: '1.0.0'
    },
    
    // Состояние
    state: {
        isVK: false,
        isLoading: true,
        user: null,
        regions: {
            'orenburg': {
                name: 'Оренбургская область',
                directions: [
                    { id: 1, from: 'Оренбург', to: 'Акбулак', price: 200 },
                    { id: 2, from: 'Оренбург', to: 'Орск', price: 500 }
                ]
            }
        },
        rides: []
    },
    
    // Инициализация
    async init() {
        console.log('🚀 Инициализация приложения...');
        
        try {
            // 1. Проверяем среду
            await this.checkEnvironment();
            
            // 2. Инициализируем VK Bridge (если в VK)
            if (this.state.isVK) {
                await this.initVKBridge();
            }
            
            // 3. Загружаем данные
            await this.loadData();
            
            // 4. Рендерим приложение
            this.renderApp();
            
            console.log('✅ Приложение успешно инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения: ' + error.message);
        }
    },
    
    // Проверка среды
    checkEnvironment() {
        return new Promise((resolve) => {
            console.log('🔍 Проверяем среду выполнения...');
            
            // Проверяем, находимся ли мы в VK
            this.state.isVK = (
                window.location.href.includes('vk.com') ||
                window.location.href.includes('vk-apps.com') ||
                window.location.hostname === 'localhost' ||  // Для тестирования
                typeof VK !== 'undefined' ||
                typeof vkBridge !== 'undefined'
            );
            
            console.log('Среда:', this.state.isVK ? 'VK Mini App' : 'Браузер');
            resolve();
        });
    },
    
    // Инициализация VK Bridge
    initVKBridge() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Инициализация VK Bridge...');
            
            // Проверяем, загружен ли VK Bridge
            if (typeof vkBridge === 'undefined') {
                console.log('⚠️ VK Bridge не найден, загружаем...');
                
                // Динамически загружаем VK Bridge
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';
                script.onload = () => {
                    console.log('✅ VK Bridge загружен');
                    this.setupVKBridge();
                    resolve();
                };
                script.onerror = () => {
                    console.log('⚠️ Не удалось загрузить VK Bridge, работаем в автономном режиме');
                    resolve(); // Не прерываем, работаем без VK Bridge
                };
                document.head.appendChild(script);
            } else {
                console.log('✅ VK Bridge уже загружен');
                this.setupVKBridge();
                resolve();
            }
        });
    },
    
    // Настройка VK Bridge
    setupVKBridge() {
        if (typeof vkBridge === 'undefined') return;
        
        try {
            // Инициализируем VK Bridge
            vkBridge.send('VKWebAppInit', {})
                .then(data => {
                    console.log('✅ VK Bridge инициализирован:', data);
                    
                    // Получаем информацию о пользователе
                    return vkBridge.send('VKWebAppGetUserInfo', {});
                })
                .then(user => {
                    console.log('👤 Информация о пользователе:', user);
                    this.state.user = user;
                })
                .catch(error => {
                    console.log('⚠️ Ошибка VK Bridge:', error);
                    // Не прерываем работу приложения
                });
                
            // Подписываемся на события
            vkBridge.subscribe(e => {
                console.log('📨 VK Bridge событие:', e.detail.type);
            });
            
        } catch (error) {
            console.log('⚠️ Не удалось настроить VK Bridge:', error);
        }
    },
    
    // Загрузка данных
    loadData() {
        return new Promise((resolve) => {
            console.log('📦 Загружаем данные...');
            
            // Имитация загрузки данных
            setTimeout(() => {
                // Тестовые данные
                this.state.rides = [
                    { id: 1, from: 'Оренбург', to: 'Акбулак', driver: 'Иван', price: 250, time: '18:00', seats: 3 },
                    { id: 2, from: 'Оренбург', to: 'Орск', driver: 'Анна', price: 500, time: '20:00', seats: 4 }
                ];
                
                console.log('✅ Данные загружены');
                resolve();
            }, 500);
        });
    },
    
    // Рендер приложения
    renderApp() {
        const content = document.getElementById('appContent');
        
        // Очищаем контент
        content.innerHTML = '';
        
        // Добавляем информацию о среде
        let environmentInfo = '';
        if (this.state.isVK) {
            if (this.state.user) {
                environmentInfo = `<div style="background:#e3f2fd;padding:10px;border-radius:10px;margin-bottom:15px;">
                    <i class="fas fa-user"></i> Привет, ${this.state.user.first_name}!
                </div>`;
            } else {
                environmentInfo = `<div style="background:#e3f2fd;padding:10px;border-radius:10px;margin-bottom:15px;">
                    <i class="fas fa-mobile-alt"></i> Режим: VK Mini App
                </div>`;
            }
        } else {
            environmentInfo = `<div style="background:#fff3cd;padding:10px;border-radius:10px;margin-bottom:15px;">
                <i class="fas fa-desktop"></i> Режим: Веб-браузер
            </div>`;
        }
        
        // Рендерим основной интерфейс
        content.innerHTML = `
            ${environmentInfo}
            
            <div style="text-align:center;margin:30px 0;">
                <i class="fas fa-check-circle" style="color:#4CAF50;font-size:48px;"></i>
                <h2>Приложение "Попутчики" запущено!</h2>
                <p style="color:#666;margin-top:10px;">Ищем попутчиков для совместных поездок</p>
            </div>
            
            <div style="display:flex;gap:10px;justify-content:center;margin:20px 0;">
                <button class="btn" onclick="App.switchRole('driver')" style="background:#2196F3;color:white;padding:12px 20px;border:none;border-radius:25px;">
                    <i class="fas fa-car"></i> Я водитель
                </button>
                <button class="btn" onclick="App.switchRole('passenger')" style="background:#4CAF50;color:white;padding:12px 20px;border:none;border-radius:25px;">
                    <i class="fas fa-user"></i> Я пассажир
                </button>
            </div>
            
            <div style="background:white;border-radius:15px;padding:20px;margin-top:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <h3><i class="fas fa-route"></i> Доступные направления:</h3>
                ${this.renderRegions()}
            </div>
            
            <div style="margin-top:30px;padding:20px;background:#f8f9fa;border-radius:15px;">
                <h4>Информация:</h4>
                <p><i class="fas fa-info-circle"></i> Приложение работает в ${this.state.isVK ? 'VK Mini Apps' : 'веб-браузере'}</p>
                <p><i class="fas fa-database"></i> Загружено направлений: ${Object.keys(this.state.regions).length}</p>
                <p><i class="fas fa-car"></i> Доступных поездок: ${this.state.rides.length}</p>
            </div>
        `;
        
        this.state.isLoading = false;
    },
    
    // Рендер регионов
    renderRegions() {
        let html = '';
        
        for (const regionId in this.state.regions) {
            const region = this.state.regions[regionId];
            
            html += `
                <div style="margin-top:15px;padding:15px;border:1px solid #e0e0e0;border-radius:10px;">
                    <h4 style="margin-bottom:10px;">
                        <i class="fas fa-map-marker-alt"></i> ${region.name}
                    </h4>
            `;
            
            region.directions.forEach(dir => {
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f5f5f5;border-radius:8px;margin-bottom:8px;">
                        <div>
                            <strong>${dir.from} → ${dir.to}</strong>
                            <div style="font-size:12px;color:#666;">от ${dir.price} ₽</div>
                        </div>
                        <button onclick="App.openDirection(${dir.id})" style="background:#2196F3;color:white;border:none;padding:8px 15px;border-radius:20px;font-size:14px;">
                            Выбрать
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        return html || '<p>Направлений пока нет</p>';
    },
    
    // Вспомогательные методы
    switchRole(role) {
        alert(`Выбрана роль: ${role === 'driver' ? 'Водитель' : 'Пассажир'}`);
        console.log('Роль изменена на:', role);
    },
    
    openDirection(id) {
        alert(`Открываем направление #${id}`);
        console.log('Открыто направление:', id);
    },
    
    showError(message) {
        const content = document.getElementById('appContent');
        content.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top:10px;padding:10px 20px;background:#2196F3;color:white;border:none;border-radius:10px;">
                    <i class="fas fa-redo"></i> Перезагрузить
                </button>
            </div>
        `;
    }
};

// Запускаем приложение когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM готов');
        App.init();
    });
} else {
    console.log('📄 DOM уже загружен');
    App.init();
}

// Экспортируем App для глобального доступа
window.App = App;
