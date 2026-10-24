// Локальний сервер застосунку «Генератор рецептів на вечерю».
// Обрано Express: він простіше за чистий модуль http роздає статичні файли
// й розбирає параметри шляху (:id). Запуск: npm start, адреса http://localhost:3000

const path = require('path');
const express = require('express');

// Локальний набір рецептів у тій самій формі, що й відповідь TheMealDB
const recipes = require('./data/recipes.json');

const app = express();
const PORT = 3000;

// Корінь клієнтської частини (index.html, css, js, assets) — на рівень вище за теку server
const CLIENT_DIR = path.join(__dirname, '..');


// GET /api/recipes/random — випадковий рецепт з локального набору (заміна TheMealDB random.php).
// Маршрут оголошено перед /:id, інакше слово «random» сприймалося б як id
app.get('/api/recipes/random', (req, res) => {
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    res.json({ meals: [recipe] });
});

// GET /api/recipes/:id — конкретний рецепт за id або 404 з JSON-повідомленням
app.get('/api/recipes/:id', (req, res) => {
    const recipe = recipes.find(item => item.idMeal === req.params.id);

    if (!recipe) {
        return res.status(404).json({ error: `Рецепт з id ${req.params.id} не знайдено` });
    }

    res.json({ meals: [recipe] });
});

// Будь-який інший шлях /api/... — 404 з JSON, а не HTML-сторінка чи порожня відповідь
app.use('/api', (req, res) => {
    res.status(404).json({ error: `Ендпоінт ${req.method} ${req.originalUrl} не існує` });
});


// Роздаємо лише теки клієнтської частини, щоб код сервера й node_modules не були доступні з браузера
app.use('/css', express.static(path.join(CLIENT_DIR, 'css')));
app.use('/js', express.static(path.join(CLIENT_DIR, 'js')));
app.use('/assets', express.static(path.join(CLIENT_DIR, 'assets')));

// Головна сторінка SPA (маршрути після # обробляє клієнтський роутер з практикуму 13)
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});