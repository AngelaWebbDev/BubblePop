let circleInterval = null;
let circles = [];
let gameStarted = false;
let missedCount = 0;
let recentPositions = [];
let score = 0;

const finalQuitButton = document.getElementById("final-quit");
const finalScoreBox = document.getElementById("final-score-box");
const finalScoreValue = document.getElementById("final-score-value");
const gamespace = document.getElementById("gamespace");
const missedDisplay = document.getElementById("missed");
const playAgainButton = document.getElementById("play-again");
const stopGameBtn = document.getElementById("stopGame");
const scoreDisplay = document.getElementById("score");
const startBox = document.getElementById("start-box");
const startButton = document.getElementById("startBtn");

// check if new spawn point is near recent spawn points
function isFarFromRecent(x, y, minDistance) {
    return recentPositions.every(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) >= minDistance;
    });
}

// manage array of spawn positions for spawn spacing control
function storePosition(x, y) {
    recentPositions.push({ x, y });
    if (recentPositions.length > 5) {
        recentPositions.shift();
    }
}

// prevent spawning near other circles on screen (previous 5 spawns)
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
    return { x: width / 2, y: height / 2 }; // default spawn spot if no safe spot found
}

// count the number of circles that disappear without user click
function incrementMissed() {
    missedCount++;
    missedDisplay.textContent = `Missed: ${missedCount}`;
}

// pop effect with small dots 
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

// choose random color for circles & dots
function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// spawn a new circle
function createCircle() {
    //find a safe spawn point
    const { x, y } = getSafePosition();
    //create circle element
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.style.backgroundColor = randomColor();
    // spawn circle at small size
    const size = 10;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${x - size / 2}px`;
    circle.style.top = `${y - size / 2}px`;
    //set circle
    gamespace.appendChild(circle);
    //
    const circleData = {
        element: circle,
        x,
        y,
        size,
        growing: true
    };
    //when user clicks, increase score, remove circle, 'pop' effect
    circle.addEventListener("click", () => {
        if (!circleData.growing) return;
        circleData.growing = false;
        incrementScore(Math.floor(circleData.size / 10));
        removeCircle(circleData, true);
    });
    circles.push(circleData);
}

// delete circle when clicked or touched
function removeCircle(circleData, clicked = false) {
    const color = circleData.element.style.backgroundColor;
    createDotEffect(circleData.x, circleData.y, color);
    if (circleData.element.parentElement) {
        circleData.element.parentElement.removeChild(circleData.element);
    }
    circles = circles.filter(c => c !== circleData);
    if (!clicked) incrementMissed();
}

// track user score
function incrementScore(amount) {
    score += amount;
    scoreDisplay.textContent = `Score: ${score}`;
}

// circles appear faster as score increases
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

// circles increase in size
function growCircles() {
    const bounds = gamespace.getBoundingClientRect();

    for (const c of circles) {
        if (!c.growing) continue;
        let newSize = c.size + 1;

        // check if circle edge touches border of gamespace, remove if true
        if (
            c.x - radius <= bounds.left ||
            c.y - radius <= bounds.top ||
            c.x + radius >= bounds.right ||
            c.y + radius >= bounds.bottom
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

        //set new circle size
        c.size = newSize;
        c.element.style.width = `${newSize}px`;
        c.element.style.height = `${newSize}px`;
        c.element.style.left = `${c.x - radius}px`;
        c.element.style.top = `${c.y - radius}px`;
    }
}

// start game procedures
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

//circle growing animation
function gameLoop() {
    if (!gameStarted) return;
    growCircles();
    requestAnimationFrame(gameLoop);
}

// clean up when 'stop game' button is clicked
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

// start game when startBtn is clicked
startButton.addEventListener("click", () => {
    startBox.style.display = "none";
    finalScoreBox.style.display = "none";
    startGame();
});

// end game when 'stopGameBtn' is clicked, but leave app open
stopGameBtn.addEventListener("click", () => {
    quitGame();
});

// restart game when 'play again' is clicked
playAgainButton.addEventListener("click", () => {
    finalScoreBox.style.display = "none";
    startBox.style.display = "none";
    startGame();
});

// quit app
finalQuitButton.addEventListener("click", () => {
    window.close();
});