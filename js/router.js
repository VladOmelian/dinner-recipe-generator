// Практикум 13. Клієнтська маршрутизація SPA без фреймворку.
// Обрано hash-based роутинг: шлях зберігається після # (наприклад #/recipe/53037).
// Браузер не надсилає цю частину адреси на сервер, тому F5 на будь-якій «сторінці»
// працює з Live Server без додаткового налаштування сервера.

// Спільний контейнер усіх «сторінок», самі сторінки всередині нього та пункти меню
const app = document.querySelector('#app');
const pages = app.querySelectorAll('[data-page]');
const navLinks = document.querySelectorAll('.site-header nav a[data-link]');
const recipeDetail = document.querySelector('#recipe-detail');

// Практикум 14: повний рецепт за id тепер віддає локальний сервер (GET /api/recipes/:id)
const LOOKUP_URL = '/api/recipes/';

// Номер поточного переходу: асинхронна view не перемальовує сторінку, якщо користувач уже перейшов далі
let currentRenderId = 0;

// Показує в контейнері #app лише секції потрібної «сторінки», підсвічує пункт меню й змінює заголовок вкладки.
// activeNav — який пункт меню підсвітити (сторінка рецепта належить до розділу «Улюблені»)
function showPage(name, title, activeNav = name) {
    for (const page of pages) {
        page.hidden = page.dataset.page !== name;
    }

    for (const link of navLinks) {
        if (link.dataset.page === activeNav) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    }

    document.title = `${title} — Генератор рецептів на вечерю`;
    window.scrollTo(0, 0);
}

// Створює абзац із повідомленням для сторінки
function createMessage(text) {
    const message = document.createElement('p');
    message.classList.add('page-message');
    message.textContent = text;
    return message;
}

// Створює внутрішнє посилання з клієнтською навігацією
function createLink(href, text) {
    const link = document.createElement('a');
    link.href = href;
    link.dataset.link = '';
    link.classList.add('page-link');
    link.textContent = text;
    return link;
}


// «/» — екран генерації: форма, картка рецепта й кнопка «Згенерувати» (fetch, практикум 9)
function viewHome() {
    showPage('home', 'Генерація рецепта');
}

// «/favorites» — улюблені рецепти зі сховища favorites (практикум 11).
// Список рендерить React-компонент FavoritesList; подія просить його перечитати дані з IndexedDB
function viewFavorites() {
    showPage('favorites', 'Улюблені рецепти');
    document.dispatchEvent(new CustomEvent('favorites-refresh'));
}

// «/history» — історія рецептів, згенерованих за сеанс
function viewHistory() {
    showPage('history', 'Історія');
}

// Повний рецепт для сторінки деталей: свій рецепт береться з масиву recipes (практикум 6),
// рецепт з API — запитом за id (практикум 9); без мережі показуються дані, збережені в IndexedDB
async function getFullRecipe(favorite) {
    const localRecipe = recipes.find(recipe => recipe.id === favorite.id);
    if (localRecipe) {
        return localRecipe;
    }

    try {
        const response = await fetch(LOOKUP_URL + encodeURIComponent(favorite.id));
        if (!response.ok) {
            throw new Error(`Сервер відповів кодом ${response.status}`);
        }
        const data = await response.json();
        if (data.meals && data.meals.length > 0) {
            return mealToRecipe(data.meals[0]);
        }
    } catch (error) {
        console.error('Не вдалося завантажити повний рецепт:', error);
    }

    return {
        id: favorite.id,
        name: favorite.name,
        image: favorite.imageUrl,
        details: 'Збережений рецепт (повний опис зараз недоступний)'
    };
}

// «/recipe/:id» — один збережений рецепт: запис шукається за id у сховищі favorites,
// а картка малюється функцією renderRecipe з практикуму 7
async function viewRecipe(params) {
    const renderId = currentRenderId;
    showPage('recipe', 'Рецепт', 'favorites');

    recipeDetail.replaceChildren();
    recipeDetail.append(createMessage('Завантажуємо рецепт…'));

    try {
        const favorite = await getItem(params.id);
        if (renderId !== currentRenderId) {
            return;
        }

        if (!favorite) {
            recipeDetail.replaceChildren();
            recipeDetail.append(
                createMessage('Цього рецепта немає серед улюблених.'),
                createLink('#/favorites', '← До улюблених')
            );
            return;
        }

        const recipe = await getFullRecipe(favorite);
        if (renderId !== currentRenderId) {
            return;
        }

        document.title = `${recipe.name} — Генератор рецептів на вечерю`;
        recipeDetail.replaceChildren();
        renderRecipe(recipe, recipeDetail);
        recipeDetail.append(createLink('#/favorites', '← До улюблених'));
    } catch (error) {
        console.error('Помилка відкриття рецепта:', error);
        recipeDetail.replaceChildren();
        recipeDetail.append(createMessage('Не вдалося відкрити рецепт: сховище улюблених недоступне.'));
    }
}

// Будь-який шлях без маршруту — сторінка «Не знайдено» з посиланням на головну
function viewNotFound(path) {
    showPage('not-found', 'Сторінку не знайдено');
    document.querySelector('#not-found-path').textContent = path;
}



// Таблиця маршрутів: патерн шляху → view-функція.
// Сегмент з двокрапкою — параметр: :id у /recipe/:id — це ключ запису у сховищі favorites
const routes = [
    { path: '/', view: viewHome },
    { path: '/favorites', view: viewFavorites },
    { path: '/history', view: viewHistory },
    { path: '/recipe/:id', view: viewRecipe }
];

// Порівнює шлях з патернами по сегментах і витягує значення параметрів; null — маршрут не знайдено
function matchRoute(path) {
    const pathParts = path.split('/').filter(Boolean);

    for (const route of routes) {
        const routeParts = route.path.split('/').filter(Boolean);
        if (routeParts.length !== pathParts.length) {
            continue;
        }

        const params = {};
        const isMatch = routeParts.every((part, index) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = decodeURIComponent(pathParts[index]);
                return true;
            }
            return part === pathParts[index];
        });

        if (isMatch) {
            return { view: route.view, params: params };
        }
    }

    return null;
}

// Визначає поточний шлях із хеша, знаходить маршрут і викликає його view
function render() {
    currentRenderId++;
    const path = location.hash.slice(1) || '/';
    const match = matchRoute(path);

    if (match) {
        match.view(match.params);
    } else {
        viewNotFound(path);
    }
}


// Клієнтська навігація: змінюємо лише хеш, далі спрацьовує hashchange і render()
function navigate(path) {
    if (location.hash.slice(1) === path) {
        render();                                 // той самий шлях — просто перемальовуємо
        return;
    }
    location.hash = path;
}

// Перехоплюємо кліки по внутрішніх посиланнях з атрибутом data-link (меню, список улюблених, «назад»)
document.addEventListener('click', event => {
    const link = event.target.closest('a[data-link]');
    if (!link) {
        return;
    }
    event.preventDefault();
    navigate(link.getAttribute('href').slice(1));
});

// Кнопки «назад»/«вперед» браузера змінюють хеш — перемальовуємо сторінку за новим шляхом
window.addEventListener('hashchange', render);

// Перший рендер за адресою, з якою відкрито сторінку
render();