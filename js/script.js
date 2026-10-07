console.log('script.js підключено');

// Прибираємо статичну картку-заглушку
const staticCard = document.querySelector('#recipe-result .recipe-card');
if (staticCard !== null) {
    staticCard.remove();
}

const recipes = [
    { name: 'Курка теріякі з рисом', timeMinutes: 35, vegetarian: false },
    { name: 'Паста карбонара', timeMinutes: 25, vegetarian: false },
    { name: 'Грецький салат', timeMinutes: 15, vegetarian: true },
    { name: 'Крем-суп із гарбуза', timeMinutes: 40, vegetarian: true },
    { name: 'Овочеве рагу', timeMinutes: 45, vegetarian: true },
    { name: 'Лосось у вершковому соусі', timeMinutes: 30, vegetarian: false },
    { name: 'Омлет із сиром і зеленню', timeMinutes: 10, vegetarian: true }
];

const QUICK_LIMIT_MINUTES = 20;

// Контейнер картки результату, підсумковий елемент і кнопка
const recipeContainer = document.querySelector('#recipe-result');
const historyCount = document.querySelector('#history-count');
const generateButton = document.querySelector('.btn-generate');

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
    image.src = 'assets/img/placeholder.svg';
    image.alt = `Зображення страви: ${recipe.name}`;
    image.width = 140;
    image.height = 140;

    const title = document.createElement('h3');
    title.classList.add('result-title');
    title.textContent = recipe.name;

    const time = document.createElement('p');
    time.classList.add('result-meta');
    time.textContent = `Час приготування: ${recipe.timeMinutes} хв`;

    // Атрибут data-time і умовний клас vegetarian
    card.dataset.time = recipe.timeMinutes;
    if (recipe.vegetarian === true) {
        card.classList.add('vegetarian');
    }

    // Додаємо вузли в картку, а картку — в контейнер
    card.append(image, title, time);
    recipeContainer.append(card);
}

// Оновлює текст наявного елемента p#history-count
function updateHistoryCount() {
    historyCount.textContent = `Згенеровано рецептів за сеанс: ${generatedCount}`;
}

// Обирає випадковий рецепт, показує його і збільшує лічильник
function generateRecipe() {
    const recipe = pickRandom(recipes);
    renderRecipe(recipe);
    generatedCount++;
    updateHistoryCount();
}

// Перший рецепт показуємо одразу при завантаженні сторінки
generateRecipe();

// Кожне натискання кнопки перебудовує картку заново
generateButton.addEventListener('click', generateRecipe);