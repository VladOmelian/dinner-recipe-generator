// Збереження улюблених рецептів між перезавантаженнями сторінки.
// Модель запису: { id, name, imageUrl }

// Ключ, під яким улюблені рецепти зберігаються в localStorage
const LS_KEY = 'favorites';

// Зберігає масив улюблених у localStorage: об'єкти перетворюються на рядок JSON
function saveToLocalStorage(items) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Не вдалося зберегти дані в localStorage:', error);
    }
}

// Читає улюблені з localStorage; пошкоджений JSON не ламає застосунок — повертається порожній масив
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}