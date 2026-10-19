 // Практикум 10. Обрано React: компоненти — це звичайні JavaScript-функції, а JSX
 // поєднує розмітку й логіку в одному місці, тому цей підхід мені зрозуміліший за Vue.
 // Підключено через CDN (React 18 + Babel standalone), без збірки й Node.js.

// Підписи типів страв для картки
const TYPE_LABELS = { main: 'Основна страва', salad: 'Салат', soup: 'Суп' };

// Унікальний id для кожного показаного рецепта — потрібен для key у списку
let nextEntryId = 1;

// Створює запис для стану: рецепт + унікальний id
function createEntry(recipe) {
    return { id: nextEntryId++, recipe: recipe };
}

// Картка випадкового рецепта. Отримує рецепт і обробник кнопки «Ще!» через props
// і не звертається до глобальних змінних напряму
function RandomRecipeCard({ recipe, onRegenerate }) {
    // Похідне значення: для своїх рецептів — тип і час, для рецептів з API — категорія й кухня
    const meta = recipe.timeMinutes
        ? `${TYPE_LABELS[recipe.type] || 'Страва'} · ${recipe.timeMinutes} хв`
        : recipe.details;

    return (
        <div className="random-recipe">
            <article
                className={recipe.vegetarian === true ? 'recipe-card vegetarian' : 'recipe-card'}
                data-time={recipe.timeMinutes}
            >
                <img
                    src={recipe.image || 'assets/img/placeholder.svg'}
                    alt={`Зображення страви: ${recipe.name}`}
                    width="140"
                    height="140"
                />
                <h3 className="result-title">{recipe.name}</h3>
                <p className="result-meta">{meta}</p>

                {recipe.instructions && (
                    <details className="result-instructions">
                        <summary>Як приготувати</summary>
                        <p>{recipe.instructions}</p>
                    </details>
                )}
            </article>

            <button type="button" className="btn-more" onClick={onRegenerate}>
                Ще!
            </button>
        </div>
    );
}

// Список попередніх рецептів: рендер циклом через map() з key за унікальним id запису
function RecentRecipes({ entries }) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="recent">
            <p className="recent-title">Попередні рецепти:</p>
            <ul className="recent-list">
                {entries.map(entry => (
                    <li key={entry.id}>{entry.recipe.name}</li>
                ))}
            </ul>
        </div>
    );
}

// Батьківський компонент: зберігає масив рецептів і показані рецепти в реактивному стані
function App() {
    // Масив рецептів з практикуму 6 тепер у стані React, а не у звичайній змінній
    const [items] = React.useState(() => [...recipes]);

    // Показані рецепти, новіші спочатку; перший — поточний
    const [shown, setShown] = React.useState(() => [createEntry(pickRandom(recipes))]);

    // Похідні значення: поточний рецепт і три попередні обчислюються зі стану, а не зберігаються окремо
    const current = shown[0].recipe;
    const recent = shown.slice(1, 4);

    // Обробник події «Ще!»: обирає новий випадковий рецепт (не той самий, що зараз)
    // і оновлює стан новим масивом, без мутації старого
    function regenerate() {
        setShown(prev => {
            let next = pickRandom(items);
            while (items.length > 1 && next.name === prev[0].recipe.name) {
                next = pickRandom(items);
            }
            return [createEntry(next), ...prev];
        });
        document.dispatchEvent(new CustomEvent('recipe-regenerated'));
    }

    // Позначка, що перший рецепт уже запитано: StrictMode у режимі розробки запускає ефект двічі,
    // а ref зберігає значення між цими запусками, тож запит до API буде лише один
    const initialLoadStarted = React.useRef(false);

    // Після монтування: слухаємо рецепти з API і завантажуємо перший рецепт з TheMealDB
    React.useEffect(() => {
        function handleLoaded(event) {
            setShown(prev => [createEntry(event.detail), ...prev]);
        }

        document.addEventListener('recipe-loaded', handleLoaded);

        if (!initialLoadStarted.current) {
            initialLoadStarted.current = true;
            loadData();
        }

        return () => document.removeEventListener('recipe-loaded', handleLoaded);
    }, []);

    return (
        <>
            <RandomRecipeCard recipe={current} onRegenerate={regenerate} />
            <RecentRecipes entries={recent} />
        </>
    );
}

// Монтуємо React-застосунок у контейнер картки результату.
// StrictMode у режимі розробки додатково перевіряє компоненти на типові помилки
ReactDOM.createRoot(document.getElementById('recipe-result')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);