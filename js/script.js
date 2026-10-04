console.log('script.js підключено');

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

function getRecipeLabel(recipe) {
    let label = recipe.timeMinutes <= QUICK_LIMIT_MINUTES ? 'швидка страва' : 'потребує часу';

    if (recipe.vegetarian === true) {
        label += ', вегетаріанська страва';
    }

    return label;
}

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

function printRecipeOfTheDay(recipe) {
    console.log(`Сьогодні на вечерю: ${recipe.name} (${recipe.timeMinutes} хв)`);

    if (recipe.vegetarian === true) {
        console.log('🌱 Вегетаріанська страва');
    } else {
        console.log('Страва містить м\'ясо або рибу');
    }
}

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

