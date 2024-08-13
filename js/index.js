import * as PIXI from "./pixi.mjs";

const SCREEN_WIDTH = 384;
const SCREEN_HEIGHT = 512;
const PIXEL_SIZE = 16;
const TOP_PADDING = 3 * PIXEL_SIZE;
const COLOR = 0x000000;
const COLOR_ENEMY = 0xff0033;
const COLOR_HERO = 0x009900;
const BG_COLOR = 0x869174;

const app = new PIXI.Application({
    backgroundColor: BG_COLOR,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
});

const scoreText = new PIXI.Text("Score: 0", { fill: COLOR, fontSize: 16 });
const restartText = new PIXI.Text("Restart", { fill: COLOR, fontSize: 16 });

const hero = drawPixel(SCREEN_WIDTH / 2, SCREEN_HEIGHT - PIXEL_SIZE, COLOR_HERO);

let bullets = [];
let enemies = [];
let counter = 0;
let score = 0;

document.body.appendChild(app.view);
document.addEventListener("keydown", onKeyDown);
app.ticker.add(update);
app.stage.addChild(scoreText);
app.stage.addChild(restartText);

restartText.x = SCREEN_WIDTH - restartText.width - 10;
restartText.y = 0;
restartText.interactive = true;
restartText.buttonMode = true;

restartText.on('pointerdown', restartGame);

function onKeyDown(key) {
    switch (key.key) {
        case "ArrowRight": {
            if (hero.x < SCREEN_WIDTH - PIXEL_SIZE) {
                hero.x += PIXEL_SIZE;
            }
            break;
        }

        case "ArrowLeft": {
            if (hero.x > 0) {
                hero.x -= PIXEL_SIZE;
            }
            break;
        }

        case "ArrowDown": {
            if (hero.y < SCREEN_HEIGHT - PIXEL_SIZE) {
                hero.y += PIXEL_SIZE;
            }
            break;
        }

        case "ArrowUp": {
            if (hero.y > 0) {
                hero.y -= PIXEL_SIZE;
            }
            break;
        }

        case " ": {
            let bullet = drawPixel(hero.x, hero.y);
            bullet.isDead = false;
            bullets.push(bullet);
            break;
        }
    }
}

function update() {
    if (isFail()) {
        stopGame();
        return;
    }
    if (enemiesCanMove()) {
        moveEnemies();
        addEnemies();
    }

    moveBullets();
    clear();
}

function enemiesCanMove() {
    counter++;
    if (counter < 100) {
        return false;
    }
    counter = 0;
    return true;
}

function moveEnemies() {
    enemies.forEach(e => e.y += PIXEL_SIZE);
}

function addEnemies() {
    for (let i = 0; i < SCREEN_WIDTH / PIXEL_SIZE; i++) {
        if (Math.random() <= 0.4) {
            let enemy = drawPixel(PIXEL_SIZE * i, TOP_PADDING, COLOR_ENEMY);
            enemies.push(enemy);
        }
    }
}

function moveBullets() {
    bullets.forEach((bullet) => {
        moveBullet(bullet);
        checkColision(bullet);
    });
}

function checkColision(bullet) {
    enemies.forEach(enemy => {
        if (enemy.x === bullet.x && enemy.y === bullet.y) {
            bullet.isDead = true;
            enemy.isDead = true;
            score++;
            scoreText.text = "Score: " + score;
        }
    });
}

function isFail() {
    return enemies.find(e => e.y === hero.y) !== undefined;
}

function stopGame() {
    document.removeEventListener("keydown", onKeyDown);
    app.ticker.remove(update, this);

    scoreText.text = "Score: " + score + " Game Over";
}

function restartGame() {
    score = 0;
    scoreText.text = "Score: " + score;

    bullets.forEach(b => b.destroy());
    enemies.forEach(e => e.destroy());

    bullets = [];
    enemies = [];
    counter = 0;

    hero.x = SCREEN_WIDTH / 2;
    hero.y = SCREEN_HEIGHT - PIXEL_SIZE;
    
    document.addEventListener("keydown", onKeyDown);
    app.ticker.add(update);
}

function moveBullet(bullet) {
    bullet.y -= PIXEL_SIZE;
    if (bullet.y < TOP_PADDING) {
        bullet.isDead = true;
    }
}

function clear() {
    app.stage.children.filter((child) => child.isDead).forEach((child) => child.destroy());

    bullets = bullets.filter((bullet) => !bullet.isDead);

    enemies = enemies.filter(e => !e.isDead);
}

function drawPixel(x, y, color = COLOR) {
    const view = new PIXI.Graphics();

    view.lineStyle(2, COLOR);
    view.beginFill(BG_COLOR);
    view.drawRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
    view.beginFill(color);
    view.drawRect(4, 4, PIXEL_SIZE - 8, PIXEL_SIZE - 8);
    view.x = x;
    view.y = y;

    view.isDead = false;

    app.stage.addChild(view);

    return view;
}
