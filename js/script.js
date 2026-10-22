console.log('script.js підключено');

const API_URL = 'https://www.themealdb.com/api/json/v1/1/random.php';

// Прибираємо статичну картку-заглушку
const staticCard = document.querySelector('#recipe-result .recipe-card');
if (staticCard !== null) {
    staticCard.remove();
}

const recipes = [
    { id: 'local-1', name: 'Курка теріякі з рисом', type: 'main', timeMinutes: 35, vegetarian: false },
    { id: 'local-2', name: 'Паста карбонара', type: 'main', timeMinutes: 25, vegetarian: false },
    { id: 'local-3', name: 'Грецький салат', type: 'salad', timeMinutes: 15, vegetarian: true },
    { id: 'local-4', name: 'Крем-суп із гарбуза', type: 'soup', timeMinutes: 40, vegetarian: true },
    { id: 'local-5', name: 'Овочеве рагу', type: 'main', timeMinutes: 45, vegetarian: true },
    { id: 'local-6', name: 'Лосось у вершковому соусі', type: 'main', timeMinutes: 30, vegetarian: false },
    { id: 'local-7', name: 'Омлет із сиром і зеленню', type: 'main', timeMinutes: 10, vegetarian: true }
];

const QUICK_LIMIT_MINUTES = 20;

// Контейнер картки результату і підсумковий елемент
const recipeContainer = document.querySelector('#recipe-result');
const historyCount = document.querySelector('#history-count');

// Кількість рецептів, згенерованих за сеанс
let generatedCount = 0;

// Повертає текстову позначку рецепта: if перевіряє vegetarian === true, потрійний оператор — швидкість приготування
function getRecipeLabel(recipe) {
    let label = recipe.timeMinutes <= QUICK_LIMIT_MINUTES ? 'швидка страва' : 'потребує часу';

    if (recipe.vegetarian === true) {
        label += ', вегетаріанська страва';
    }

    return label;
}

// Перебирає всі рецепти циклом for...of, виводить кожен із позначкою
// і підсумок: кількість рецептів, середній час, кількість вегетаріанських страв
function printRecipesSummary(recipeList) {
    let totalMinutes = 0;
    let vegetarianCount = 0;

    for (const recipe of recipeList) {
        console.log(`• ${recipe.name} — ${recipe.timeMinutes} хв (${getRecipeLabel(recipe)})`);

        totalMinutes += recipe.timeMinutes;

        if (recipe.vegetarian === true) {
            vegetarianCount++;
        }
    }

    const averageMinutes = Math.round(totalMinutes / recipeList.length);

    console.log(`Усього рецептів: ${recipeList.length}`);
    console.log(`Середній час приготування: ${averageMinutes} хв`);
    console.log(`Вегетаріанських страв: ${vegetarianCount} з ${recipeList.length}`);
}

// Обирає випадковий рецепт: Math.random() задає випадковий індекс, а цикл for...of доходить до рецепта з цим індексом
function pickRandomWithLoop(recipeList) {
    const randomIndex = Math.floor(Math.random() * recipeList.length);
    let currentIndex = 0;

    for (const recipe of recipeList) {
        if (currentIndex === randomIndex) {
            return recipe;
        }
        currentIndex++;
    }
}

// Виводить у консоль обраний рецепт; вегетаріанську страву додатково позначає
function printRecipeOfTheDay(recipe) {
    console.log(`Сьогодні на вечерю: ${recipe.name} (${recipe.timeMinutes} хв)`);

    if (recipe.vegetarian === true) {
        console.log('🌱 Вегетаріанська страва');
    } else {
        console.log('Страва містить м\'ясо або рибу');
    }
}

//Повертає випадковий елемент будь-якого масиву
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];


console.log('--- Усі рецепти ---');
printRecipesSummary(recipes);

console.log('--- Випадковий рецепт (for...of + Math.random) ---');
const loopPick = pickRandomWithLoop(recipes);
printRecipeOfTheDay(loopPick);

console.log('--- Ще три спроби через стрілкову функцію pickRandom ---');
for (let attempt = 1; attempt <= 3; attempt++) {
    const randomRecipe = pickRandom(recipes);
    console.log(`Спроба ${attempt}: ${randomRecipe.name} — ${getRecipeLabel(randomRecipe)}`);
}

// Функцію ручного рендеру картки замінено React-компонентом
// RandomRecipeCard (файл js/app.jsx). Код лишено закоментованим для порівняння.
/*
// Попередню картку спочатку видаляє через .remove(), тому на сторінці завжди одна картка
function renderRecipe(recipe) {
    const oldCard = recipeContainer.querySelector('article');
    if (oldCard !== null) {
        oldCard.remove();
    }

    // Створюємо картку і вкладені елементи, заповнюємо їх даними
    const card = document.createElement('article');
    card.classList.add('recipe-card');

    const image = document.createElement('img');
    image.src = recipe.image || 'assets/img/placeholder.svg';
    image.alt = `Зображення страви: ${recipe.name}`;
    image.width = 140;
    image.height = 140;

    const title = document.createElement('h3');
    title.classList.add('result-title');
    title.textContent = recipe.name;

    const time = document.createElement('p');
    time.classList.add('result-meta');
    // У рецептів з API немає часу приготування — замість нього показуємо категорію й кухню
    time.textContent = recipe.timeMinutes ? `Час приготування: ${recipe.timeMinutes} хв` : recipe.details;

    // Атрибут data-time і умовний клас vegetarian
    if (recipe.timeMinutes) {
        card.dataset.time = recipe.timeMinutes;
    }
    if (recipe.vegetarian === true) {
        card.classList.add('vegetarian');
    }

    // Додаємо вузли в картку, а картку — в контейнер
    card.append(image, title, time);

    // Рецепти з API мають інструкцію приготування — показуємо її в розгортуваному блоці
    if (recipe.instructions) {
        const details = document.createElement('details');
        details.classList.add('result-instructions');

        const summary = document.createElement('summary');
        summary.textContent = 'Як приготувати';

        const text = document.createElement('p');
        text.textContent = recipe.instructions;

        details.append(summary, text);
        card.append(details);
    }

    recipeContainer.append(card);
}
*/

// Передає рецепт React-компоненту через власну подію recipe-loaded,
// замість того щоб будувати картку вручну через createElement
function showRecipe(recipe) {
    document.dispatchEvent(new CustomEvent('recipe-loaded', { detail: recipe }));
}

// Оновлює текст наявного елемента p#history-count
function updateHistoryCount() {
    historyCount.textContent = `Згенеровано рецептів за сеанс: ${generatedCount}`;
}

// Обирає випадковий рецепт із переданого пулу, показує його і збільшує лічильник
function generateRecipe(pool) {
    const recipe = pickRandom(pool);
    showRecipe(recipe);
    generatedCount++;
    updateHistoryCount();
}

//  Форма-фільтр, її поля та елементи для повідомлень
const form = document.querySelector('#generate-form');
const typeSelect = document.querySelector('#meal-type');
const timeInput = document.querySelector('#max-time');
const vegetarianCheckbox = document.querySelector('#only-vegetarian');
const resetButton = document.querySelector('.btn-reset');
const poolInfo = document.querySelector('#pool-info');
const formError = document.querySelector('#form-error');

// Повертає найменший час приготування серед рецептів — потрібен для валідації поля часу
function getShortestTime(recipeList) {
    let shortest = recipeList[0].timeMinutes;
    for (const recipe of recipeList) {
        if (recipe.timeMinutes < shortest) {
            shortest = recipe.timeMinutes;
        }
    }
    return shortest;
}

const SHORTEST_TIME = getShortestTime(recipes);

// Зчитує значення полів форми і збирає новий масив рецептів, що підходять під фільтри
function getFilteredRecipes() {
    const type = typeSelect.value;                     // '' або 'any' — без обмеження
    const maxTime = Number(timeInput.value);           // порожнє поле дає 0 — без обмеження
    const onlyVegetarian = vegetarianCheckbox.checked; // true або false

    const pool = [];
    for (const recipe of recipes) {
        const typeFits = type === '' || type === 'any' || recipe.type === type;
        const timeFits = maxTime === 0 || recipe.timeMinutes <= maxTime;
        const vegetarianFits = onlyVegetarian === false || recipe.vegetarian === true;

        if (typeFits && timeFits && vegetarianFits) {
            pool.push(recipe);
        }
    }
    return pool;
}

// Оновлює підказку, скільки рецептів зараз у пулі для випадкового вибору
function updatePoolInfo() {
    const pool = getFilteredRecipes();
    poolInfo.textContent = `Підходить рецептів: ${pool.length} з ${recipes.length}`;
    formError.textContent = '';
}

// Сабміт форми (клік по кнопці «Згенерувати»): без перезавантаження сторінки
// кожен клік надсилає новий запит до API TheMealDB
form.addEventListener('submit', event => {
    event.preventDefault();
    formError.textContent = '';
    loadData();
});

// Кнопка «Скинути фільтри»: очищає форму і повертає повний пул рецептів
resetButton.addEventListener('click', () => {
    form.reset();
    timeInput.setCustomValidity('');
    updatePoolInfo();
});

// Додаткова валідація: час не може бути меншим, ніж готується найшвидший рецепт
timeInput.addEventListener('input', () => {
    const maxTime = Number(timeInput.value);

    if (timeInput.value !== '' && maxTime < SHORTEST_TIME) {
        timeInput.setCustomValidity(`Найшвидший рецепт готується ${SHORTEST_TIME} хв — вкажіть щонайменше ${SHORTEST_TIME}`);
    } else {
        timeInput.setCustomValidity('');
    }

    updatePoolInfo();
});

// Зміна чекбокса «Тільки вегетаріанські» одразу звужує пул рецептів
vegetarianCheckbox.addEventListener('change', updatePoolInfo);

// Зміна типу страви теж змінює пул — оновлюємо підказку
typeSelect.addEventListener('change', updatePoolInfo);

// Початковий стан підказки при завантаженні сторінки
updatePoolInfo();

// ---------- Практикум 9: клієнт для API ----------

// Кнопки й елементи для повідомлення про помилку
const generateButton = document.querySelector('.btn-generate');
const retryButton = document.querySelector('.btn-retry');
const apiError = document.querySelector('#api-error');
const apiErrorText = document.querySelector('#api-error-text');

// Перетворює рецепт TheMealDB на об'єкт тієї ж форми, що й рецепти з масиву recipes
function mealToRecipe(meal) {
    // Деякі поля у відповіді бувають null , тому додаємо лише наявні
    const detailParts = [];
    if (meal.strCategory) {
        detailParts.push(`Категорія: ${meal.strCategory}`);
    }
    const area = meal.strArea || meal.strCountry;
    if (area) {
        detailParts.push(`Кухня: ${area}`);
    }

    return {
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb,
        instructions: meal.strInstructions,
        details: detailParts.join(' · '),
        vegetarian: meal.strCategory === 'Vegetarian' || meal.strCategory === 'Vegan'
    };
}

// Вмикає або вимикає стан завантаження на кнопках
function setLoading(isLoading) {
    generateButton.disabled = isLoading;
    retryButton.disabled = isLoading;
    generateButton.textContent = isLoading ? 'Завантажуємо рецепт…' : 'Згенерувати рецепт';
    recipeContainer.setAttribute('aria-busy', String(isLoading));

    // поки рецепт завантажується, крутиться барабан на Canvas
    if (isLoading) {
        startShuffle();
    } else {
        stopShuffle();
    }
}

// Створює помилку з текстом, зрозумілим користувачу
function createApiError(message) {
    const error = new Error(message);
    error.name = 'ApiError';
    return error;
}

// Показує повідомлення про помилку разом із кнопкою «Оновити»
function showError(message) {
    apiErrorText.textContent = message;
    apiError.hidden = false;
}

// Ховає повідомлення про помилку
function hideError() {
    apiError.hidden = true;
}

// Завантажує випадковий рецепт з TheMealDB (https://www.themealdb.com/api.php)
// і показує його в картці результату
async function loadData() {
    hideError();
    setLoading(true);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw createApiError(`Сервіс рецептів тимчасово недоступний (код ${response.status}). Спробуйте пізніше.`);
        }

        const data = await response.json();
        console.log(data);

        // У відповіді може не бути масиву meals
        if (!data.meals || data.meals.length === 0) {
            throw createApiError('Сервіс не повернув жодного рецепта. Натисніть «Оновити», щоб спробувати ще раз.');
        }

        const recipe = mealToRecipe(data.meals[0]);
        showRecipe(recipe);
        generatedCount++;
        updateHistoryCount();
    } catch (error) {
        if (error.name === 'ApiError') {
            showError(error.message);
        } else if (error.name === 'TypeError') {
            showError(`Не вдалося завантажити рецепт: немає з'єднання з інтернетом. Перевірте мережу й натисніть «Оновити».`);
        } else {
            showError('Не вдалося обробити відповідь сервісу рецептів. Спробуйте ще раз.');
        }
        console.error('Помилка завантаження рецепта:', error);
    } finally {
        setLoading(false);
    }
}

// Кнопка «Оновити» повторює запит після збою без перезавантаження сторінки
retryButton.addEventListener('click', loadData);

// Рецепти, обрані кнопкою «Ще!» у React-компоненті, теж рахуємо в історії
document.addEventListener('recipe-regenerated', () => {
    generatedCount++;
    updateHistoryCount();
});

// Перший рецепт тепер завантажує React-компонент App одразу після монтування (js/app.jsx)