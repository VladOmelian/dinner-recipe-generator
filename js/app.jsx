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

// Картка випадкового рецепта. Отримує рецепт, обробник кнопки «Ще!», ознаку «в улюблених»
// і обробник кнопки «В улюблені» через props і не звертається до глобальних змінних напряму
function RandomRecipeCard({ recipe, onRegenerate, isFavorite, onAddFavorite }) {
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

            <div className="card-actions">
                <button type="button" className="btn-more" onClick={onRegenerate}>
                    Ще!
                </button>
                <button
                    type="button"
                    className="btn-favorite"
                    onClick={() => onAddFavorite(recipe)}
                    disabled={isFavorite}
                >
                    {isFavorite ? '★ В улюблених' : '☆ В улюблені'}
                </button>
            </div>
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

// Список улюблених рецептів: рендер через map() з key за id рецепта.
// Якщо сховище недоступне, показує зрозуміле повідомлення замість списку
function FavoritesList({ favorites, error, onRemove }) {
    if (error) {
        return <p className="storage-error" role="alert">{error}</p>;
    }

    if (favorites.length === 0) {
        return <p className="favorites-empty">Тут з'являться рецепти, які ви додасте в улюблені.</p>;
    }

    return (
        <ul className="favorites-list">
            {favorites.map(favorite => (
                <li key={favorite.id}>
                    <img src={favorite.imageUrl} alt={`Зображення страви: ${favorite.name}`} width="56" height="56" />
                    <p className="favorite-name">{favorite.name}</p>
                    <button type="button" className="btn-remove" onClick={() => onRemove(favorite.id)}>
                        Видалити
                    </button>
                </li>
            ))}
        </ul>
    );
}

// Створює запис улюбленого рецепта за моделлю даних: id, name, imageUrl
function toFavorite(recipe) {
    return {
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.image || 'assets/img/placeholder.svg'
    };
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

    // Улюблені рецепти зберігаються в localStorage
    const [favorites, setFavorites] = React.useState(() => loadFromLocalStorage());
    const storageError = '';

    // Додає рецепт в улюблені й одразу зберігає оновлений масив
    function addFavorite(recipe) {
        if (favorites.some(favorite => favorite.id === recipe.id)) {
            return;
        }
        const next = [...favorites, toFavorite(recipe)];
        setFavorites(next);
        saveToLocalStorage(next);
    }

    // Видаляє рецепт з улюблених і зберігає оновлений масив
    function removeFavorite(id) {
        const next = favorites.filter(favorite => favorite.id !== id);
        setFavorites(next);
        saveToLocalStorage(next);
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

    // Похідне значення: чи поточний рецепт уже в улюблених
    const isFavorite = favorites.some(favorite => favorite.id === current.id);

    return (
        <>
            <RandomRecipeCard
                recipe={current}
                onRegenerate={regenerate}
                isFavorite={isFavorite}
                onAddFavorite={addFavorite}
            />
            <RecentRecipes entries={recent} />

            {/* Список улюблених рендериться в окрему секцію сторінки через портал, але має спільний стан з карткою */}
            {ReactDOM.createPortal(
                <FavoritesList favorites={favorites} error={storageError} onRemove={removeFavorite} />,
                document.getElementById('favorites-root')
            )}
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