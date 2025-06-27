let recentPositions = [];
let circles = [];
let score = 0;
let circleInterval = null;
let gameStarted = false;

const gamespace = document.getElementById("gamespace");
const scoreDisplay = document.getElementById("score");
const quitButton = document.getElementById("quit");
const startBox = document.getElementById("start-box");
const finalScoreBox = document.getElementById("final-score-box");
const finalScoreValue = document.getElementById("final-score-value");
const playAgainButton = document.getElementById("play-again");
const finalQuitButton = document.getElementById("final-quit");
const startButton = document.getElementById("startBtn");

function isFarFromRecent(x, y, minDistance) {
    return recentPositions.every(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) >= minDistance;
    });
}

function storePosition(x, y) {
    recentPositions.push({ x, y });
    if (recentPositions.length > 5) {
        recentPositions.shift();
    }
}

function getSafePosition(minDistance = 50, maxAttempts = 100) {
    const width = gamespace.clientWidth;
    const height = gamespace.clientHeight;
    let attempt = 0;
    while (attempt < maxAttempts) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        if (isFarFromRecent(x, y, minDistance)) {
            storePosition(x, y);
            return { x, y };
        }
        attempt++;
    }
    // fallback center if no safe spot found
    return { x: width / 2, y: height / 2 };
}

let missedCount = 0;

const missedDisplay = document.getElementById("missed");

function incrementMissed() {
    missedCount++;
    missedDisplay.textContent = `Missed: ${missedCount}`;
}

function createDotEffect(x, y, color) {
    const dotCount = 10;
    const dotSize = 3;
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement("div");
        dot.style.position = "absolute";
        dot.style.width = `${dotSize}px`;
        dot.style.height = `${dotSize}px`;
        dot.style.borderRadius = "50%";
        dot.style.backgroundColor = color;   // use passed color here
        dot.style.zIndex = 2001;
        dot.style.pointerEvents = "none";

        const offsetX = (Math.random() - 0.5) * (40 - dotSize);
        const offsetY = (Math.random() - 0.5) * (40 - dotSize);
        dot.style.left = `${x + offsetX}px`;
        dot.style.top = `${y + offsetY}px`;

        gamespace.appendChild(dot);
        dots.push(dot);
    }

    // Remove dots after 250ms
    setTimeout(() => {
        dots.forEach(dot => {
            if (dot.parentElement) dot.parentElement.removeChild(dot);
        });
    }, 100);
}

function randomColor() {
    // random bright color
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function createCircle() {
    const { x, y } = getSafePosition();

    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.style.backgroundColor = randomColor();

    // start small and centered
    const size = 10;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${x - size / 2}px`;
    circle.style.top = `${y - size / 2}px`;

    gamespace.appendChild(circle);

    const circleData = {
        element: circle,
        x,
        y,
        size,
        growing: true
    };

    circle.addEventListener("click", () => {
        if (!circleData.growing) return;
        circleData.growing = false;
        incrementScore(Math.floor(circleData.size / 10));
        removeCircle(circleData, true);
    });

    circles.push(circleData);
}

function removeCircle(circleData, clicked = false) {
    const color = circleData.element.style.backgroundColor;
    createDotEffect(circleData.x, circleData.y, color);
    if (circleData.element.parentElement) {
        circleData.element.parentElement.removeChild(circleData.element);
    }
    circles = circles.filter(c => c !== circleData);
    if (!clicked) incrementMissed();
}

function incrementScore(amount) {
    score += amount;
    scoreDisplay.textContent = `Score: ${score}`;
}

function adjustInterval() {
    if (score < 50) return 1000;
    if (score < 100) return 900;
    if (score < 150) return 800;
    if (score < 200) return 700;
    if (score < 250) return 600;
    if (score < 300) return 500;
    if (score < 400) return 450;
    if (score < 500) return 400;
    if (score < 600) return 350;
    if (score < 700) return 300;
    if (score < 800) return 250;
    if (score < 900) return 200;
    if (score < 1000) return 150;
    if (score < 1100) return 100;
    if (score < 1200) return 75;
    if (score < 1300) return 50;
    if (score < 1400) return 25;
    return 25;
}

function growCircles() {
    for (const c of circles) {
        if (!c.growing) continue;
        let newSize = c.size + 1;

        // max diameter 300
        // if (newSize > 300) {
        //     // disappear silently
        //     removeCircle(c);
        //     continue;
        // }

        // Check if circle edge touches viewport edges or border of gamespace (5px border)
        const radius = newSize / 2;
        if (
            c.x - radius <= 5 ||
            c.y - radius <= 5 ||
            c.x + radius >= gamespace.clientWidth - 5 ||
            c.y + radius >= gamespace.clientHeight - 5
        ) {
            removeCircle(c);
            continue;
        }

        // Check if circle edge touches another circle
        let touching = false;
        for (const other of circles) {
            if (other === c) continue;
            const dx = c.x - other.x;
            const dy = c.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const otherRadius = other.size / 2;
            if (distance <= radius + otherRadius) {
                touching = true;
                break;
            }
        }
        if (touching) {
            removeCircle(c);
            continue;
        }

        c.size = newSize;
        c.element.style.width = `${newSize}px`;
        c.element.style.height = `${newSize}px`;
        c.element.style.left = `${c.x - radius}px`;
        c.element.style.top = `${c.y - radius}px`;
    }
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = `Score: 0`;
    recentPositions = [];
    circles.forEach(c => {
        if (c.element.parentElement) c.element.parentElement.removeChild(c.element);
    });
    circles = [];
    gameStarted = true;
    document.getElementById("ui-bar").classList.add("active");

    if (circleInterval) clearInterval(circleInterval);

    circleInterval = setInterval(() => {
        if (score < 500) {
            if (circles.length === 0) createCircle();
        } else {
            createCircle();
        }
        clearInterval(circleInterval);
        circleInterval = setInterval(() => {
            if (score < 500) {
                if (circles.length === 0) createCircle();
            } else {
                createCircle();
            }
        }, adjustInterval());
    }, adjustInterval());

    // Animation loop for growth
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameStarted) return;
    growCircles();
    requestAnimationFrame(gameLoop);
}

function quitGame() {
    gameStarted = false;
    clearInterval(circleInterval);
    circles.forEach(c => {
        if (c.element.parentElement) c.element.parentElement.removeChild(c.element);
    });
    circles = [];

    // cover background with random circles
    // for (let i = 0; i < 100; i++) {
    //     const bgCircle = document.createElement("div");
    //     bgCircle.classList.add("bg-circle");
    //     const size = 50 + Math.random() * 100;
    //     bgCircle.style.width = `${size}px`;
    //     bgCircle.style.height = `${size}px`;
    //     bgCircle.style.backgroundColor = randomColor();
    //     bgCircle.style.left = `${Math.random() * (gamespace.clientWidth - size)}px`;
    //     bgCircle.style.top = `${Math.random() * (gamespace.clientHeight - size)}px`;
    //     gamespace.appendChild(bgCircle);
    // }

    finalScoreValue.textContent = score;
    finalScoreBox.style.display = "block";
    startBox.style.display = "none";
    document.getElementById("ui-bar").classList.remove("active");
}

startButton.addEventListener("click", () => {
    startBox.style.display = "none";
    finalScoreBox.style.display = "none";
    startGame();
});

quitButton.addEventListener("click", () => {
    quitGame();
});

playAgainButton.addEventListener("click", () => {
    finalScoreBox.style.display = "none";
    startBox.style.display = "none";
    startGame();
});

finalQuitButton.addEventListener("click", () => {
    window.close();
});