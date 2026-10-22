// Canvas-анімація «перемішування» під час генерації нового рецепта.
// Обрано Canvas, а не CSS: барабан малюється з даних застосунку — кількість сегментів
// і підписи на них беруться з масиву recipes, тож готовим DOM-елементом його не зробити.

// Накладка з барабаном, сам canvas і блок картки результату
const shuffleBox = document.querySelector('#shuffle');
const shuffleCanvas = document.querySelector('#shuffle-canvas');
const shuffleCtx = shuffleCanvas.getContext('2d');
const resultBox = document.querySelector('#result');

// Параметри анімації
const MIN_SPIN_MS = 700;   // мінімальна тривалість обертання, щоб анімацію було видно навіть при швидкій відповіді
const SPIN_SPEED = 0.25;   // швидкість обертання, радіан за кадр
const SLOWDOWN = 0.9;      // коефіцієнт сповільнення після того, як рецепт готовий
const STOP_SPEED = 0.01;   // швидкість, нижче якої барабан вважається зупиненим

// Поточний стан анімації
const spinner = {
    angle: 0,
    speed: 0,
    frameId: null,
    startedAt: 0,
    stopRequested: false
};

// Читає колір із CSS-змінних палітри, щоб барабан мав ті самі кольори, що й сторінка
function cssColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Кольори сегментів і тексту на них (пари з достатнім контрастом)
const SEGMENT_COLORS = [
    { fill: cssColor('--color-accent'), text: cssColor('--color-on-accent') },
    { fill: cssColor('--color-secondary'), text: cssColor('--color-on-secondary') },
    { fill: cssColor('--color-surface-muted'), text: cssColor('--color-text') }
];

// Розмір canvas задано в розмітці (180×180); для чітких ліній на екранах високої щільності
// внутрішня роздільна здатність збільшується в devicePixelRatio разів
function setupCanvas() {
    const size = shuffleCanvas.width;
    const ratio = window.devicePixelRatio || 1;

    shuffleCanvas.style.width = `${size}px`;
    shuffleCanvas.style.height = `${size}px`;
    shuffleCanvas.width = size * ratio;
    shuffleCanvas.height = size * ratio;
    shuffleCtx.scale(ratio, ratio);

    return size;
}

const CANVAS_SIZE = setupCanvas();

// Малює один кадр: барабан із сегментами за масивом рецептів, тарілку в центрі й стрілку-вказівник
function drawWheel(angle) {
    const items = recipes;                    
    const center = CANVAS_SIZE / 2;
    const radius = center - 10;
    const segment = (Math.PI * 2) / items.length;

    // Очищаємо попередній кадр, інакше сегменти накладатимуться
    shuffleCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Обертаємо систему координат навколо центру; save/restore не дають повороту «протекти» в наступний кадр
    shuffleCtx.save();
    shuffleCtx.translate(center, center);
    shuffleCtx.rotate(angle);

    items.forEach((recipe, index) => {
        // Кольори чергуються; останній сегмент не повторює колір першого, бо вони сусідні
        let colorIndex = index % SEGMENT_COLORS.length;
        if (index === items.length - 1 && colorIndex === 0) {
            colorIndex = 1;
        }
        const colors = SEGMENT_COLORS[colorIndex];

        // Сегмент-сектор
        shuffleCtx.beginPath();
        shuffleCtx.moveTo(0, 0);
        shuffleCtx.arc(0, 0, radius, index * segment, (index + 1) * segment);
        shuffleCtx.closePath();
        shuffleCtx.fillStyle = colors.fill;
        shuffleCtx.fill();

        // Підпис сегмента — перше слово назви рецепта, уздовж радіуса
        shuffleCtx.save();
        shuffleCtx.rotate(index * segment + segment / 2);
        shuffleCtx.fillStyle = colors.text;
        shuffleCtx.font = 'bold 10px Nunito, Arial, sans-serif';
        shuffleCtx.textAlign = 'right';
        shuffleCtx.textBaseline = 'middle';
        shuffleCtx.fillText(recipe.name.split(' ')[0], radius - 6, 0);
        shuffleCtx.restore();
    });

    shuffleCtx.restore();

    // Тарілка в центрі барабана
    shuffleCtx.beginPath();
    shuffleCtx.arc(center, center, 18, 0, Math.PI * 2);
    shuffleCtx.fillStyle = cssColor('--color-surface');
    shuffleCtx.fill();
    shuffleCtx.lineWidth = 3;
    shuffleCtx.strokeStyle = cssColor('--color-border');
    shuffleCtx.stroke();

    // Стрілка-вказівник угорі (не обертається разом із барабаном)
    shuffleCtx.beginPath();
    shuffleCtx.moveTo(center - 9, 0);
    shuffleCtx.lineTo(center + 9, 0);
    shuffleCtx.lineTo(center, 18);
    shuffleCtx.closePath();
    shuffleCtx.fillStyle = cssColor('--color-text');
    shuffleCtx.fill();
}

// Цикл анімації: оновлює кут, перемальовує кадр і планує наступний через requestAnimationFrame.
// Після запиту на зупинку барабан плавно сповільнюється і зупиняється
function animate(timestamp) {
    if (spinner.startedAt === 0) {
        spinner.startedAt = timestamp;
    }

    const elapsed = timestamp - spinner.startedAt;
    if (spinner.stopRequested && elapsed >= MIN_SPIN_MS) {
        spinner.speed *= SLOWDOWN;
    }

    spinner.angle += spinner.speed;
    drawWheel(spinner.angle);

    if (spinner.speed < STOP_SPEED) {
        finishShuffle();
        return;
    }

    spinner.frameId = requestAnimationFrame(animate);
}

// Запускає перемішування: показує барабан поверх картки й починає цикл анімації
function startShuffle() {
    // Користувачам, які вимкнули анімації в системі, барабан не показуємо
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    spinner.speed = SPIN_SPEED;
    spinner.stopRequested = false;
    spinner.startedAt = 0;

    if (spinner.frameId !== null) {
        return;                                  // барабан уже крутиться — лише повертаємо швидкість
    }

    shuffleBox.hidden = false;
    resultBox.classList.add('is-shuffling');
    spinner.frameId = requestAnimationFrame(animate);
}

// Рецепт готовий: просимо барабан зупинитися (він сповільниться і зупиниться сам)
function stopShuffle() {
    spinner.stopRequested = true;
}

// Повна зупинка: скасовує запланований кадр і ховає барабан
function finishShuffle() {
    if (spinner.frameId !== null) {
        cancelAnimationFrame(spinner.frameId);
    }
    spinner.frameId = null;
    shuffleBox.hidden = true;
    resultBox.classList.remove('is-shuffling');
}

// Кнопка «Ще!» у React-компоненті: рецепт обирається миттєво, тому барабан
// робить коротке перемішування і одразу отримує запит на зупинку
document.addEventListener('recipe-regenerated', () => {
    startShuffle();
    stopShuffle();
});

// Якщо користувач перейшов на іншу вкладку, анімацію зупиняємо повністю
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        finishShuffle();
    }
});