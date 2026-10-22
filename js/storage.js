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


// Схема бази: база DinnerRecipesDB версії 1, сховище favorites, ключ — поле id запису
const DB_NAME = 'DinnerRecipesDB';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

// Ключ прапорця в localStorage: міграцію вже виконано, повторювати не треба
const MIGRATION_FLAG = 'favoritesMigrated';

// Відкриває базу. onupgradeneeded спрацьовує лише при першому відкритті чи зміні версії —
// саме тут створюється сховище favorites з keyPath "id"
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Записує рецепт у транзакції readwrite: put створює новий запис або оновлює наявний з тим самим id
async function putItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = () => reject(tx.error);
    });
}

// Створення (Create): додає новий улюблений рецепт
function addItem(item) {
    return putItem(item);
}

// Оновлення (Update): перезаписує рецепт з тим самим id, дубліката не виникає
function updateItem(item) {
    return putItem(item);
}

// Читання (Read): повертає всі улюблені рецепти в транзакції readonly
async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

// Читання одного запису (Read): повертає улюблений рецепт за id або undefined, якщо його немає
async function getItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

// Видалення (Delete): прибирає улюблений рецепт за id у транзакції readwrite
async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = () => reject(tx.error);
    });
}

// Одноразова міграція: якщо сховище порожнє, а в localStorage є улюблені з етапу 1,
// переносить їх в IndexedDB і ставить прапорець, щоб не повторювати при наступних запусках
async function migrateFromLocalStorage() {
    if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
        return;
    }

    const existing = await getAllItems();
    const saved = loadFromLocalStorage();

    if (existing.length === 0 && saved.length > 0) {
        for (const item of saved) {
            await addItem(item);
        }
        console.log(`Перенесено улюблених рецептів з localStorage в IndexedDB: ${saved.length}`);
    }

    localStorage.setItem(MIGRATION_FLAG, 'true');
}