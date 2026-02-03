// Основное приложение
const App = {
    // Конфигурация
    config: {
        regions: {
            'orenburg': {
                name: 'Оренбургская область',
                description: 'Центральная часть России',
                directions: [
                    { id: 1, from: 'Оренбург', to: 'Акбулак', distance: '45 км', time: '1 ч', price: 200 },
                    { id: 2, from: 'Оренбург', to: 'Орск', distance: '327 км', time: '4 ч', price: 500 },
                    { id: 3, from: 'Оренбург', to: 'Новотроицк', distance: '290 км', time: '3.5 ч', price: 450 },
                    { id: 4, from: 'Оренбург', to: 'Бузулук', distance: '246 км', time: '3 ч', price: 400 },
                    { id: 5, from: 'Акбулак', to: 'Оренбург', distance: '45 км', time: '1 ч', price: 200 }
                ]
            },
            'bashkortostan': {
                name: 'Республика Башкортостан',
                description: 'Уральский регион',
                directions: [
                    { id: 6, from: 'Уфа', to: 'Стерлитамак', distance: '140 км', time: '2 ч', price: 300 },
                    { id: 7, from: 'Уфа', to: 'Салават', distance: '160 км', time: '2.5 ч', price: 350 },
                    { id: 8, from: 'Уфа', to: 'Октябрьский', distance: '190 км', time: '3 ч', price: 400 }
                ]
            }
        }
    },

    // Состояние приложения
    state: {
        currentRegion: null,
        currentRole: 'driver',
        currentUser: null,
        selectedDirection: null,
        selectedRide: null,
        currentSort: 'date',
        isAdminMode: true,
        deletePending: { type: null, id: null },
        showExpiredRides: false,
        cleanupInterval: null,
        rides: [],
        passengerRequests: []
    },

    // Инициализация
    init() {
        this.setupUser();
        this.loadInitialData();
        this.setupUI();
        this.setupEventListeners();
        this.startAutoCleanup();
        
        console.log('App инициализирован');
    },

    // Настройка пользователя
    setupUser() {
        this.state.currentUser = {
            name: 'Администратор',
            photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            phone: '+7 999 123-45-67',
            isAdmin: true
        };
        
        this.updateUserInfo();
        this.toggleAdminMode(true);
    },

    // Загрузка начальных данных
    loadInitialData() {
        const sampleRides = [
            { id: 1, directionId: 1, driver: { name: 'Самат Супаков', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }, time: '22:00', price: '250', seats: 3, booked: 1, date: 'Сегодня', phone: '+7 938 455-86-95', comment: 'Еду через центр города' },
            { id: 2, directionId: 1, driver: { name: 'Алёна Кожевникова', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop' }, time: '22:00', price: '250', seats: 4, booked: 2, date: 'Сегодня', phone: '+7 912 345-67-89', comment: 'Можно с детьми' },
            { id: 3, directionId: 1, driver: { name: 'Evgen Evgen', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }, time: '22:30', price: '200', seats: 4, booked: 0, date: 'Завтра', phone: '+7 987 654-32-10', comment: 'Комфортный автомобиль' },
            { id: 4, directionId: 6, driver: { name: 'Ильдар Гафиуллин', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }, time: '19:00', price: '300', seats: 3, booked: 1, date: '18 ноября', phone: '+7 927 123-45-67', comment: 'Быстрая поездка' }
        ];

        const sampleRequests = [
            { id: 1, directionId: 1, passenger: { name: 'Мария Иванова', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop' }, date: 'Сегодня', time: '22:00', seats: 2, maxPrice: 250, phone: '+7 912 345-67-89', comment: 'Еду с чемоданом' },
            { id: 2, directionId: 1, passenger: { name: 'Алексей Петров', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }, date: 'Завтра', time: '08:00', seats: 1, maxPrice: 200, phone: '+7 987 654-32-10', comment: 'Нужно до работы' },
            { id: 3, directionId: 6, passenger: { name: 'Ольга Смирнова', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }, date: 'Завтра', time: '19:00', seats: 3, maxPrice: 320, phone: '+7 999 888-77-66', comment: 'С детьми' }
        ];

        // Добавляем timestamp к данным
        this.state.rides = sampleRides.map(ride => ({
            ...ride,
            timestamp: this.getTimestamp(ride.date, ride.time)
        }));

        this.state.passengerRequests = sampleRequests.map(req => ({
            ...req,
            timestamp: this.getTimestamp(req.date, req.time)
        }));
    },

    // Настройка UI
    setupUI() {
        this.renderRegionTabs();
        
        const firstRegion = Object.keys(this.config.regions)[0];
        if (firstRegion) {
            this.switchRegion(firstRegion);
        } else {
            this.showEmptyState();
        }
        
        this.updateMinDate();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('rideDate').value = today;
        this.updateMinTime();
    },

    // Настройка обработчиков событий
    setupEventListeners() {
        document.getElementById('rideDate').addEventListener('change', () => {
            this.updateMinTime();
            this.validateDateTime();
        });
        
        document.getElementById('rideTime').addEventListener('change', () => this.validateDateTime());
        
        // Закрытие модальных окон
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Предотвращение прокрутки страницы
        document.addEventListener('touchmove', (event) => {
            if (document.body.classList.contains('modal-open')) {
                const modalContent = event.target.closest('.modal-content');
                if (!modalContent) {
                    event.preventDefault();
                }
            }
        }, { passive: false });
    },

    // Вспомогательные методы
    getDirectionById(id) {
        for (const region of Object.values(this.config.regions)) {
            const direction = region.directions.find(d => d.id === id);
            if (direction) return direction;
        }
        return null;
    },

    getRidesByDirection(directionId) {
        return this.state.rides.filter(r => r.directionId === directionId);
    },

    getPassengerRequestsByDirection(directionId) {
        return this.state.passengerRequests.filter(r => r.directionId === directionId);
    },

    getPassengerRequestsCount(directionId) {
        return this.getPassengerRequestsByDirection(directionId)
            .filter(req => !this.isRequestExpired(req)).length;
    },

    getSeatsWord(seats) {
        if (seats === 1) return 'место';
        if (seats >= 2 && seats <= 4) return 'места';
        return 'мест';
    },

    getTimestamp(dateText, time, actualDate = null) {
        let date;
        
        if (actualDate) {
            date = new Date(actualDate);
        } else if (dateText === 'Сегодня') {
            date = new Date();
        } else if (dateText === 'Завтра') {
            date = new Date();
            date.setDate(date.getDate() + 1);
        } else {
            const [day, month] = dateText.split(' ');
            const months = {
                'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
                'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
                'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
            };
            
            const year = new Date().getFullYear();
            date = new Date(year, months[month], parseInt(day));
        }
        
        if (time) {
            const [hours, minutes] = time.split(':').map(Number);
            date.setHours(hours, minutes, 0, 0);
        }
        
        return date.getTime();
    },

    isRideExpired(ride) {
        if (!ride.timestamp) {
            ride.timestamp = this.getTimestamp(ride.date, ride.time);
        }
        return ride.timestamp < Date.now();
    },

    isRequestExpired(request) {
        if (!request.timestamp) {
            request.timestamp = this.getTimestamp(request.date, request.time);
        }
        return request.timestamp < Date.now();
    },

    getTimeStatus(dateText, time) {
        const timestamp = this.getTimestamp(dateText, time);
        const now = Date.now();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (timestamp < now) return 'expired';
        if (dateText === 'Сегодня') return 'today';
        return 'upcoming';
    },

    // Основные методы UI
    updateUserInfo() {
        const avatar = document.getElementById('userAvatar');
        if (this.state.currentUser.photo) {
            avatar.innerHTML = `<img src="${this.state.currentUser.photo}" alt="${this.state.currentUser.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
    },

    toggleAdminMode(initial = false) {
        if (this.state.currentUser.isAdmin) {
            this.state.isAdminMode = !this.state.isAdminMode;
            const icon = document.getElementById('adminIcon');
            const avatar = document.getElementById('userAvatar');
            
            if (this.state.isAdminMode) {
                icon.className = 'fas fa-user-shield';
                avatar.style.background = 'rgba(231, 76, 60, 0.2)';
                avatar.style.borderColor = 'rgba(231, 76, 60, 0.5)';
                this.showNotification('Режим администратора включен', 'success');
            } else {
                icon.className = 'fas fa-user';
                avatar.style.background = 'rgba(255,255,255,0.2)';
                avatar.style.borderColor = 'rgba(255,255,255,0.3)';
            }
            
            if (!initial) {
                this.renderRegionTabs();
                if (this.state.currentRegion) {
                    this.renderRegionContent();
                }
            }
        }
    },

    renderRegionTabs() {
        const container = document.getElementById('regionTabs');
        let html = '';
        
        Object.keys(this.config.regions).forEach(regionId => {
            const region = this.config.regions[regionId];
            const isActive = regionId === this.state.currentRegion;
            const isAdmin = this.state.isAdminMode;
            
            html += `
                <div class="region-tab ${isActive ? 'active' : ''} ${isAdmin ? 'admin' : ''}" 
                     onclick="App.switchRegion('${regionId}')">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${region.name}</span>
                    ${isAdmin ? `
                        <div class="delete-btn" onclick="event.stopPropagation(); App.openDeleteRegionModal('${regionId}')">
                            <i class="fas fa-times"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    switchRegion(regionId) {
        this.state.currentRegion = regionId;
        this.renderRegionTabs();
        this.renderRegionContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderRegionContent() {
        const content = document.getElementById('appContent');
        const region = this.config.regions[this.state.currentRegion];
        
        if (!region || !region.directions || region.directions.length === 0) {
            content.innerHTML = this.renderEmptyState('Направлений пока нет', 'Создайте первое направление в этом регионе', 'route');
            return;
        }
        
        if (this.state.currentRole === 'passenger') {
            content.innerHTML = this.renderPassengerView(region);
        } else {
            content.innerHTML = this.renderDriverView(region);
        }
    },

    renderDriverView(region) {
        return region.directions.map(dir => {
            const rides = this.getRidesByDirection(dir.id);
            const activeRides = rides.filter(ride => !this.isRideExpired(ride));
            const ridesCount = activeRides.length;
            const passengerRequestsCount = this.getPassengerRequestsCount(dir.id);
            const isAdmin = this.state.isAdminMode;
            
            return `
                <div class="direction-card slide-up" onclick="App.openDirection(${dir.id})">
                    <div class="direction-header">
                        <div class="direction-title">
                            <i class="fas fa-route"></i>
                            <span>${dir.from} → ${dir.to}</span>
                        </div>
                        <div class="direction-price">от ${dir.price}₽</div>
                    </div>
                    <div class="direction-info">
                        <span><i class="fas fa-road"></i> ${dir.distance}</span>
                        <span><i class="fas fa-clock"></i> ${dir.time}</span>
                        <span><i class="fas fa-gas-pump"></i> ~${Math.round(dir.price / 100 * 3)}₽</span>
                    </div>
                    <div class="direction-stats">
                        <div class="stat-badge">
                            <i class="fas fa-car"></i> ${ridesCount} поездок
                            <i class="fas fa-user" style="margin-left:10px;"></i> ${passengerRequestsCount} ищут
                        </div>
                        <div style="color:var(--primary);font-weight:600;display:flex;align-items:center;gap:6px;">
                            <span>Посмотреть</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                    ${isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn btn-danger" onclick="event.stopPropagation(); App.openDeleteDirectionModal(${dir.id})" style="flex:0.5;">
                                <i class="fas fa-trash-alt"></i>
                                <span>Удалить</span>
                            </button>
                        </div>
                    ` : ''}
                    <button class="create-ride-btn" onclick="event.stopPropagation(); App.openCreateRideForSpecificDirection(${dir.id})">
                        <i class="fas fa-plus"></i>
                        <span>Создать поездку</span>
                    </button>
                </div>
            `;
        }).join('');
    },

    renderPassengerView(region) {
        const requests = this.getActivePassengerRequestsForRegion(region.name);
        
        if (requests.length === 0) {
            return this.renderEmptyState('Заявок пока нет', 'Создайте первую заявку на поиск попутчиков', 'users');
        }
        
        let html = '<div class="sort-filter">';
        html += '<button class="sort-btn active" onclick="App.sortPassengerRequests(\'date\')"><i class="fas fa-calendar-alt"></i><span>По дате</span></button>';
        html += '<button class="sort-btn" onclick="App.sortPassengerRequests(\'price\')"><i class="fas fa-money-bill-wave"></i><span>По цене</span></button>';
        html += '</div>';
        
        html += requests.map(req => {
            const direction = this.getDirectionById(req.directionId);
            const isAdmin = this.state.isAdminMode;
            const timeStatus = this.getTimeStatus(req.date, req.time);
            
            return `
                <div class="ride-card passenger-card slide-up">
                    <div class="ride-header">
                        <div class="passenger-info">
                            <div class="passenger-avatar">
                                <img src="${req.passenger.photo}" alt="${req.passenger.name}" onerror="this.src='https://via.placeholder.com/100'">
                            </div>
                            <div class="driver-details">
                                <h4>${req.passenger.name}</h4>
                                <div style="color:var(--text-light);font-size:13px;">Ищет поездку</div>
                            </div>
                        </div>
                        <div class="ride-price passenger-price">
                            до ${req.maxPrice}₽
                            <small>${req.seats} ${this.getSeatsWord(req.seats)}</small>
                        </div>
                    </div>
                    
                    <div class="ride-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar-alt"></i> ${req.date}, ${req.time}
                            <span class="time-indicator ${timeStatus}">
                                ${timeStatus === 'expired' ? '<i class="fas fa-clock"></i> Истекло' : 
                                  timeStatus === 'today' ? '<i class="fas fa-exclamation-circle"></i> Сегодня' : 
                                  '<i class="fas fa-check-circle"></i> Активно'}
                            </span>
                        </div>
                        <div class="detail-item"><i class="fas fa-route"></i> ${direction.from} → ${direction.to}</div>
                    </div>
                    
                    ${req.comment ? `<div style="background:rgba(75, 179, 75, 0.1);padding:12px 16px;border-radius:15px;margin-bottom:15px;font-size:14px;color:var(--text);border-left:3px solid var(--secondary);">${req.comment}</div>` : ''}
                    
                    ${isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn btn-danger" onclick="App.deletePassengerRequest(${req.id})" style="flex:0.5;">
                                <i class="fas fa-trash-alt"></i>
                                <span>Удалить</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    <div class="ride-actions">
                        <button class="btn btn-secondary" onclick="App.showPhone('${req.passenger.name}', '${req.phone}')">
                            <i class="fas fa-phone-alt"></i>
                            <span>Позвонить</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        return html;
    },

    renderEmptyState(title, description, icon = 'map-marked-alt') {
        return `
            <div class="empty-state fade-in">
                <i class="fas fa-${icon}"></i>
                <h3>${title}</h3>
                <p>${description}</p>
                ${icon === 'globe-europe' ? `
                    <button class="btn btn-primary" onclick="App.openCreateRegionModal()" style="margin-top:25px;">
                        <i class="fas fa-plus"></i>
                        <span>Добавить регион</span>
                    </button>
                ` : ''}
            </div>
        `;
    },

    switchRole(role) {
        this.state.currentRole = role;
        
        // Обновляем кнопки
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Обновляем плавающую кнопку
        const fab = document.getElementById('fabButton');
        const icon = fab.querySelector('i');
        if (role === 'driver') {
            icon.className = 'fas fa-car';
            fab.title = 'Создать поездку';
        } else {
            icon.className = 'fas fa-user-plus';
            fab.title = 'Найти поездку';
        }
        
        // Обновляем контент
        if (this.state.currentRegion) {
            this.renderRegionContent();
        }
    },

    openDirection(directionId) {
        this.state.selectedDirection = this.getDirectionById(directionId);
        if (!this.state.selectedDirection) return;
        
        // Открываем модальное окно с поездками
        this.showModal('direction', {
            title: `${this.state.selectedDirection.from} → ${this.state.selectedDirection.to}`,
            directionId: directionId
        });
    },

    // Модальные окна
    showModal(type, data = {}) {
        this.closeModal();
        
        let modalContent = '';
        
        switch(type) {
            case 'direction':
                modalContent = this.renderDirectionModal(data);
                break;
            case 'createRegion':
                modalContent = this.renderCreateRegionModal();
                break;
            case 'createDirection':
                modalContent = this.renderCreateDirectionModal();
                break;
            case 'createRide':
                modalContent = this.renderCreateRideModal();
                break;
            case 'confirmDelete':
                modalContent = this.renderConfirmDeleteModal(data);
                break;
            case 'booking':
                modalContent = this.renderBookingModal(data);
                break;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = modalContent;
        modal.id = `${type}Modal`;
        
        document.getElementById('modals').appendChild(modal);
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    },

    renderDirectionModal(data) {
        const direction = this.getDirectionById(data.directionId);
        if (!direction) return '';
        
        let rides = this.getRidesByDirection(data.directionId);
        const passengerRequests = this.getPassengerRequestsByDirection(data.directionId);
        
        if (!this.state.showExpiredRides) {
            rides = rides.filter(ride => !this.isRideExpired(ride));
        }
        
        let ridesHtml = '';
        
        if (rides.length === 0) {
            ridesHtml = this.renderEmptyState('Поездок пока нет', 'Будьте первым, кто создаст поездку!', 'car');
        } else {
            const sortedRides = this.sortRidesList(rides, this.state.currentSort);
            ridesHtml = sortedRides.map(ride => this.renderRideCard(ride, direction)).join('');
        }
        
        // Заявки пассажиров
        const activeRequests = passengerRequests.filter(req => !this.isRequestExpired(req));
        if (activeRequests.length > 0) {
            ridesHtml += `<h3 style="margin:25px 0 15px;color:var(--text-light);font-size:18px;font-weight:600;"><i class="fas fa-search"></i> Ищут попутчиков:</h3>`;
            ridesHtml += activeRequests.map(req => this.renderPassengerRequestCard(req)).join('');
        }
        
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-route"></i> ${data.title}</h2>
                    <button class="close-btn" onclick="App.closeModal()">×</button>
                </div>
                
                <div class="sort-filter" id="sortFilter">
                    <button class="sort-btn active" onclick="App.sortRides('date')">
                        <i class="fas fa-calendar-alt"></i>
                        <span>По дате</span>
                    </button>
                    <button class="sort-btn" onclick="App.sortRides('price')">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>По цене</span>
                    </button>
                    <button class="sort-btn" onclick="App.sortRides('seats')">
                        <i class="fas fa-users"></i>
                        <span>По местам</span>
                    </button>
                    <button class="sort-btn" onclick="App.toggleExpiredRides()" id="toggleExpiredBtn">
                        <i class="fas fa-eye-slash"></i>
                        <span>Скрыть истекшие</span>
                    </button>
                </div>
                
                <div id="ridesList">${ridesHtml}</div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="App.openCreateRideForDirection()">
                        <i class="fas fa-plus"></i>
                        <span>Создать поездку</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderRideCard(ride, direction) {
        const availableSeats = ride.seats - ride.booked;
        const isAdmin = this.state.isAdminMode;
        const isExpired = this.isRideExpired(ride);
        const timeStatus = this.getTimeStatus(ride.date, ride.time);
        
        return `
            <div class="ride-card slide-up ${isExpired ? 'expired' : ''}">
                ${isExpired ? '' : `
                    <div class="time-indicator ${timeStatus}" style="position:absolute;top:10px;right:10px;">
                        ${timeStatus === 'today' ? '<i class="fas fa-exclamation-circle"></i> Сегодня' : 
                          '<i class="fas fa-check-circle"></i> Активно'}
                    </div>
                `}
                <div class="ride-header">
                    <div class="driver-info">
                        <div class="driver-avatar">
                            <img src="${ride.driver.photo}" alt="${ride.driver.name}" onerror="this.src='https://via.placeholder.com/100'">
                        </div>
                        <div class="driver-details">
                            <h4>${ride.driver.name}</h4>
                            <div class="driver-rating">
                                <i class="fas fa-star"></i> 4.8
                            </div>
                        </div>
                    </div>
                    <div class="ride-price">
                        ${ride.price}₽
                        <small>${ride.seats} мест</small>
                    </div>
                </div>
                
                <div class="ride-details">
                    <div class="detail-item"><i class="fas fa-calendar-alt"></i> ${ride.date}, ${ride.time}</div>
                    <div class="detail-item"><i class="fas fa-route"></i> ${direction.from} → ${direction.to}</div>
                </div>
                
                <div class="seats-info">
                    <div>
                        <span class="seats-count">${availableSeats}</span> мест свободно
                    </div>
                    <div style="color:var(--text-light);font-size:13px;">
                        ${ride.booked} забронировано
                    </div>
                </div>
                
                ${ride.comment ? `<div style="background:rgba(7, 119, 255, 0.1);padding:12px 16px;border-radius:15px;margin-bottom:15px;font-size:14px;color:var(--text);border-left:3px solid var(--primary);">${ride.comment}</div>` : ''}
                
                ${isAdmin ? `
                    <div class="admin-actions">
                        <button class="btn btn-danger" onclick="App.deleteRide(${ride.id})" style="flex:0.5;">
                            <i class="fas fa-trash-alt"></i>
                            <span>Удалить</span>
                        </button>
                    </div>
                ` : ''}
                
                <div class="ride-actions">
                    <button class="btn btn-secondary" onclick="App.showPhone('${ride.driver.name}', '${ride.phone}')">
                        <i class="fas fa-phone-alt"></i>
                        <span>Позвонить</span>
                    </button>
                    <button class="btn btn-warning" onclick="App.openBookingModal(${ride.id})" ${availableSeats === 0 || isExpired ? 'disabled' : ''}>
                        <i class="fas fa-chair"></i>
                        <span>Забронировать</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderPassengerRequestCard(req) {
        const timeStatus = this.getTimeStatus(req.date, req.time);
        
        return `
            <div class="ride-card passenger-card slide-up">
                <div class="ride-header">
                    <div class="passenger-info">
                        <div class="passenger-avatar">
                            <img src="${req.passenger.photo}" alt="${req.passenger.name}" onerror="this.src='https://via.placeholder.com/100'">
                        </div>
                        <div class="driver-details">
                            <h4>${req.passenger.name}</h4>
                            <div style="color:var(--text-light);font-size:13px;">Ищет поездку</div>
                        </div>
                    </div>
                    <div class="ride-price passenger-price">
                        до ${req.maxPrice}₽
                        <small>${req.seats} ${this.getSeatsWord(req.seats)}</small>
                    </div>
                </div>
                
                <div class="ride-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i> ${req.date}, ${req.time}
                        <span class="time-indicator ${timeStatus}">
                            ${timeStatus === 'expired' ? '<i class="fas fa-clock"></i> Истекло' : 
                              timeStatus === 'today' ? '<i class="fas fa-exclamation-circle"></i> Сегодня' : 
                              '<i class="fas fa-check-circle"></i> Активно'}
                        </span>
                    </div>
                </div>
                
                ${req.comment ? `<div style="background:rgba(75, 179, 75, 0.1);padding:12px 16px;border-radius:15px;margin-bottom:15px;font-size:14px;color:var(--text);border-left:3px solid var(--secondary);">${req.comment}</div>` : ''}
                
                <div class="ride-actions">
                    <button class="btn btn-secondary" onclick="App.showPhone('${req.passenger.name}', '${req.phone}')">
                        <i class="fas fa-phone-alt"></i>
                        <span>Позвонить</span>
                    </button>
                </div>
            </div>
        `;
    },

    // Остальные методы (сокращены для краткости, добавьте их аналогично)
    openCreateRegionModal() {
        this.showModal('createRegion');
    },

    createRegion() {
        const name = document.getElementById('regionName')?.value.trim();
        if (!name) {
            this.showNotification('Введите название региона', 'warning');
            return;
        }
        
        const regionId = this.generateRegionId(name);
        if (this.config.regions[regionId]) {
            this.showNotification('Такой регион уже существует', 'warning');
            return;
        }
        
        this.config.regions[regionId] = {
            name: name,
            description: document.getElementById('regionDescription')?.value.trim() || 'Новый регион',
            directions: []
        };
        
        this.closeModal();
        this.showNotification(`Регион "${name}" создан!`, 'success');
        this.renderRegionTabs();
        this.switchRegion(regionId);
    },

    generateRegionId(name) {
        return name.toLowerCase()
            .replace(/[^a-zа-яё0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
        document.body.classList.remove('modal-open');
        this.state.deletePending = { type: null, id: null };
    },

    showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'fas fa-info-circle';
        const colors = {
            'success': 'var(--success)',
            'warning': 'var(--warning)',
            'danger': 'var(--danger)',
            'info': 'var(--primary)'
        };
        
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'warning') icon = 'fas fa-exclamation-triangle';
        if (type === 'danger') icon = 'fas fa-times-circle';
        
        notification.innerHTML = `<i class="${icon}"></i><div>${message}</div>`;
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    },

    showPhone(name, phone) {
        this.showNotification(`Телефон ${name}: <strong>${phone}</strong>`, 'info');
    },

    // Дополнительные методы (добавьте по аналогии)
    openDeleteRegionModal(regionId) {
        this.state.deletePending = { type: 'region', id: regionId };
        const region = this.config.regions[regionId];
        
        this.showModal('confirmDelete', {
            text: `Вы действительно хотите удалить регион <strong>"${region.name}"</strong>?<br><br>
                  <span style="color:var(--danger);">
                      <i class="fas fa-exclamation-triangle"></i>
                      Будут также удалены все направления и поездки в этом регионе!
                  </span>`
        });
    },

    openDeleteDirectionModal(directionId) {
        this.state.deletePending = { type: 'direction', id: directionId };
        const direction = this.getDirectionById(directionId);
        
        this.showModal('confirmDelete', {
            text: `Вы действительно хотите удалить направление <strong>"${direction.from} → ${direction.to}"</strong>?<br><br>
                  <span style="color:var(--danger);">
                      <i class="fas fa-exclamation-triangle"></i>
                      Будут также удалены все поездки по этому направлению!
                  </span>`
        });
    },

    confirmDelete() {
        const { type, id } = this.state.deletePending;
        if (!type || !id) return;
        
        if (type === 'region') {
            delete this.config.regions[id];
            // Удаляем связанные поездки
            const region = this.config.regions[id];
            if (region) {
                const directionIds = region.directions.map(d => d.id);
                this.state.rides = this.state.rides.filter(ride => !directionIds.includes(ride.directionId));
                this.state.passengerRequests = this.state.passengerRequests.filter(req => !directionIds.includes(req.directionId));
            }
            
            this.showNotification('Регион удален', 'success');
            
            if (this.state.currentRegion === id) {
                const remainingRegions = Object.keys(this.config.regions);
                if (remainingRegions.length > 0) {
                    this.switchRegion(remainingRegions[0]);
                } else {
                    this.state.currentRegion = null;
                    this.renderRegionTabs();
                    this.showEmptyState();
                }
            } else {
                this.renderRegionTabs();
            }
            
        } else if (type === 'direction') {
            // Удаляем направление из регионов
            for (const regionId in this.config.regions) {
                const region = this.config.regions[regionId];
                const directionIndex = region.directions.findIndex(d => d.id === id);
                if (directionIndex !== -1) {
                    region.directions.splice(directionIndex, 1);
                    break;
                }
            }
            
            // Удаляем связанные поездки и заявки
            this.state.rides = this.state.rides.filter(ride => ride.directionId !== id);
            this.state.passengerRequests = this.state.passengerRequests.filter(req => req.directionId !== id);
            
            this.showNotification('Направление удалено', 'success');
            
            if (this.state.selectedDirection && this.state.selectedDirection.id === id) {
                this.state.selectedDirection = null;
            }
            
            if (this.state.currentRegion) {
                this.renderRegionContent();
                this.renderRegionTabs();
            }
        }
        
        this.closeModal();
    },

    deleteRide(rideId) {
        this.state.rides = this.state.rides.filter(ride => ride.id !== rideId);
        this.showNotification('Поездка удалена', 'success');
        
        if (this.state.selectedDirection) {
            this.openDirection(this.state.selectedDirection.id);
        }
    },

    deletePassengerRequest(requestId) {
        this.state.passengerRequests = this.state.passengerRequests.filter(req => req.id !== requestId);
        this.showNotification('Заявка удалена', 'success');
        
        if (this.state.selectedDirection) {
            this.openDirection(this.state.selectedDirection.id);
        } else {
            this.renderRegionContent();
        }
    },

    getActivePassengerRequestsForRegion(regionName) {
        const requests = [];
        Object.values(this.config.regions).forEach(region => {
            if (region.name === regionName) {
                region.directions.forEach(dir => {
                    const dirRequests = this.getPassengerRequestsByDirection(dir.id);
                    requests.push(...dirRequests.filter(req => !this.isRequestExpired(req)));
                });
            }
        });
        return requests;
    },

    updateMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('rideDate');
        if (dateInput) {
            dateInput.min = today;
        }
    },

    updateMinTime() {
        const dateInput = document.getElementById('rideDate');
        const timeInput = document.getElementById('rideTime');
        if (!dateInput || !timeInput) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        if (dateInput.value === today) {
            const now = new Date();
            const minTime = new Date(now.getTime() + 30 * 60000);
            const minTimeStr = `${String(minTime.getHours()).padStart(2, '0')}:${String(minTime.getMinutes()).padStart(2, '0')}`;
            timeInput.min = minTimeStr;
            
            if (timeInput.value && timeInput.value < minTimeStr) {
                timeInput.value = minTimeStr;
            }
        } else {
            timeInput.min = '00:00';
        }
    },

    validateDateTime() {
        const dateInput = document.getElementById('rideDate');
        const timeInput = document.getElementById('rideTime');
        const errorDiv = document.getElementById('timeValidation');
        const errorText = document.getElementById('timeErrorText');
        
        if (!dateInput || !timeInput || !errorDiv || !errorText) return true;
        
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errorText.textContent = 'Нельзя создать поездку в прошлом';
            errorDiv.classList.remove('hidden');
            dateInput.classList.add('error');
            return false;
        }
        
        if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const selectedTime = timeInput.value;
            if (selectedTime) {
                const [hours, minutes] = selectedTime.split(':').map(Number);
                const selectedDateTime = new Date();
                selectedDateTime.setHours(hours, minutes, 0, 0);
                
                const minTime = new Date(now.getTime() + 30 * 60000);
                
                if (selectedDateTime < minTime) {
                    const minTimeStr = `${String(minTime.getHours()).padStart(2, '0')}:${String(minTime.getMinutes()).padStart(2, '0')}`;
                    errorText.textContent = `Выберите время не ранее ${minTimeStr} (через 30 минут от текущего времени)`;
                    errorDiv.classList.remove('hidden');
                    timeInput.classList.add('error');
                    return false;
                }
            }
        }
        
        errorDiv.classList.add('hidden');
        dateInput.classList.remove('error');
        timeInput.classList.remove('error');
        return true;
    },

    startAutoCleanup() {
        this.cleanupExpiredItems();
        this.state.cleanupInterval = setInterval(() => {
            this.cleanupExpiredItems();
        }, 5 * 60 * 1000);
    },

    cleanupExpiredItems() {
        const now = Date.now();
        let cleaned = false;
        
        const initialRideCount = this.state.rides.length;
        this.state.rides = this.state.rides.filter(ride => {
            if (!ride.timestamp) {
                ride.timestamp = this.getTimestamp(ride.date, ride.time);
            }
            return ride.timestamp >= now;
        });
        
        if (this.state.rides.length < initialRideCount) {
            cleaned = true;
        }
        
        const initialRequestCount = this.state.passengerRequests.length;
        this.state.passengerRequests = this.state.passengerRequests.filter(request => {
            if (!request.timestamp) {
                request.timestamp = this.getTimestamp(request.date, request.time);
            }
            return request.timestamp >= now;
        });
        
        if (this.state.passengerRequests.length < initialRequestCount) {
            cleaned = true;
        }
        
        if (cleaned) {
            if (this.state.currentRegion) {
                this.renderRegionContent();
            }
            if (this.state.selectedDirection) {
                this.openDirection(this.state.selectedDirection.id);
            }
        }
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    // Обработчик кнопки "Назад"
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = () => {
            App.closeModal();
        };
    }
});