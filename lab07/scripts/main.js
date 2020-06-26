//sprites
var blue_bird = new Image(100, 100);
blue_bird.src = './blue_bird.png';
var jelly_monster = new Image(100, 100);
jelly_monster.src = './jelly_monster.png';
var flying_ball = new Image(100, 100);
flying_ball.src = './flying_ball.png';
var reload_indicator = new Image(70, 50);
reload_indicator.src = './bulletreload.png';

class Gun {
    constructor() {
        this.posX = 40;
        this.posY = 470;
        this.angle = 0;
    }

    draw() {
        let [x, y] = [this.posX, this.posY];

        ctx.fillStyle = "#212121";
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 60, y + 5);
        ctx.lineTo(x + 60, y - 20);
        ctx.lineTo(x, y - 10);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = "#CA3767";
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, 30, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }

    move() {
        if (rightPressed) {
            player.posX += 10;
        }
        if (leftPressed) {
            player.posX -= 10;
        }
    }

    rotate() {
        ctx.translate(this.posX, this.posY);
        ctx.rotate(this.angle);
        ctx.translate(-this.posX, -this.posY);
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.posX = x;
        this.posY = y;
        this.angle = angle;
        this.speed = 40;

        if (mouseX > this.posX) {
            this.direction = 1;
        }
        else {
            this.direction = -1;
        }

    }

    move() {
        this.posX += (Math.cos(this.angle)) * this.speed;
        this.posY += (Math.sin(this.angle)) * this.speed;

        if (this.direction == 1) {
            this.angle += 2 * Math.PI / 180;
        } else {
            this.angle -= 2 * Math.PI / 180;
        }
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, 15, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
}

class Enemy {
    constructor(x, y, size, speed, pts, sprite) {
        this.posX = x;
        this.posY = y;
        this.size = size;
        this.speed = speed;
        this.points = pts;
        this.sprite = sprite;
    }

    move() {
        this.posX -= this.speed;
        this.posY += Math.floor(Math.random() * 5) - 2;

    }

    draw() {
        ctx.drawImage(this.sprite, this.posX, this.posY, this.size, this.size);
    }

    getPoints() {
        let [x, y, size] = [this.posX, this.posY, this.size];

        return [
            [x, y],
            [x + size, y],
            [x + size, y + size],
            [x, y + size]
        ];

    }
}

var player; 

//canvas
var backbround,
    canvas,
    ctx; 

//systemVariables
var idTimer,
    rTimer,
    mouseX,
    mouseY,
    rightPressed = false,
    leftPressed = false,
    reload = 9,
    enemiesOnLvl = 5,
    isGameDisplay,
    pauseFlag;

//gameParam
var username = '',
    score = 0;
    level = 1;
    health = 100;

//gameObject
var bullets,
    enemies,
    liderboard;



enemy_data = [
    {
        size: 100,
        speed: 10 * level,
        points: 5,
        sprite: blue_bird
    },
    {
        size: 100,
        speed: 5 * level,
        points: 10,
        sprite: jelly_monster
    },
    {
        size: 70,
        speed: 2 * level,
        points: 50,
        sprite: flying_ball
    }
];

function init() {

    if (canvas != undefined) {
        //canvas.remove();
    }

    canvas = document.createElement("canvas");

    if (canvas.getContext){
        ctx = canvas.getContext('2d');
        canvas.width = 1478;
        canvas.height = 600;
        document.body.appendChild(canvas);

        document.addEventListener("mousemove", function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            dx = mouseX - player.posX;
            dy = mouseY - player.posY;
            player.angle = (Math.atan2(dy, dx));

        }, false);

        document.addEventListener("keydown", function(e) {
            if (e.key.toLowerCase() == "d" || e.key.toLowerCase() == "в") {
                rightPressed = true;
            } else if (e.key.toLowerCase() == "a" || e.key.toLowerCase() == "ф") {
                leftPressed = true;
            }
        });

        document.addEventListener("keyup", function(e) {
            if (e.key.toLowerCase() == "d" || e.key.toLowerCase() == "в") {
                rightPressed = false;
            } else if (e.key.toLowerCase() == "a" || e.key.toLowerCase() == "ф") {
                leftPressed = false;
            }
        });

        canvas.addEventListener("click", function(e) {
            if (!pauseFlag) {
                if (reload >= 10) {
                    reload = 0;
                    bullets.push(new Bullet(player.posX, player.posY, player.angle));
                } 
            }
        }, false);

        player = new Gun();

        score = 0;
        level = 1;
        health = 100;
        bullets = [];
        enemies = [];
        liderboard = [];
        isGameDisplay = true;

        loadPicture();
    }
}

function loadPicture() {

    background = new Image();

    background.onload = function() {
        Draw(ctx, canvas.width, canvas.height);        
    };

    background.src = "./img/background.jpg";
}

function Draw(ctx, w, h) {
    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, w, h);

    player.move();
    player.rotate();
    player.draw(ctx);
    ctx.restore();

    if (reload >= 9) {
        ctx.drawImage(reload_indicator, 0, 500, 70, 50);
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw();
        bullets[i].move();
        destroyBullet(i); // TODO: Сделать проверку на уничтожение пульки и не увеличивать i, если пуля взорвалась
    }

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw();
        enemies[i].move();
        if (killEnemy(i)) {
            i--;
            health -= 80;
        }
    }
    drawInterface(ctx);
}

function drawInterface(ctx) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#212121";
    ctx.fillText("Score: " + score, 20,  40);
    ctx.fillText("Health: " + health, 1300, 40);
    ctx.fillText(username, 20, 580);
    ctx.fillText("Level: " + level, 1350, 580);
}

function startGame() {
    if (isGameDisplay) {
        clearInterval(idTimer);
        idTimer = setInterval(main, 50);
    }
    pauseFlag = false;
}

function main() {
    if (health > 0) {

        Draw(ctx, canvas.width, canvas.height);
        reload++;

        while (enemies.length < enemiesOnLvl) {
            getRandomEnemy();
        }
    
        detectCollision(); //TODO: Rename
    
        level = Math.floor(score / 500) + 1;
        enemiesOnLvl = 7 * level;
    } else {
        health = 0;
        Draw(ctx, canvas.width, canvas.height);
        clearInterval(idTimer);
        alert("GAME OVER!!!");
        gameOver();
    }
}

function detectCollision() {
    for (let i = 0; i < bullets.length; i++) {

        let bullet = bullets[i];

        for (let j = 0; j < enemies.length; j++) {

            let enemy = enemies[j];

            if (pointInPoly(enemy, bullet.posX, bullet.posY)) {
                score += enemy.points;
                enemies.splice(j, 1);
            }
        }
    }
}

function destroyBullet(index) {
    if (bullets[index].posX > canvas.width || bullets[index].posY > canvas.height ||
        bullets[index].posX < 0 || bullets[index].posY < 0) {
            bullets.splice(index, 1);
        }
}

function killEnemy(index) {
    if (enemies[index].posY > canvas.height || enemies[index].posX < 0 || enemies[index].posY < 0) {
            enemies.splice(index, 1);
            return true;
    }
    return false;
}

function setName() {
    let name = prompt("Type your name, please: ");

    if (Boolean(name)) {
        username = name;
    }
    else {
        inputName();
    }
}

function getRandomEnemy() {
    let enemy = enemy_data[Math.floor(Math.random() * 3)];

    let x = canvas.width + randomInteger(200, 1000);
    let y = randomInteger(100, 450);

    enemies.push(new Enemy(x, y, enemy.size, enemy.speed, enemy.points, enemy.sprite));
}

function randomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

function pointInPoly(object, pointX, pointY)
{
    let destroy = 0;
    let points = object.getPoints();

	for (let i = 0, j = points.length - 1; i < points.length; j = i++)
	{
        if (((points[i][1] > pointY) != (points[j][1] > pointY)) && 
        (pointX < (points[j][0] - points[i][0]) * (pointY - points[i][1]) / 
        (points[j][1] - points[i][1]) + points[i][0]))
		{
            destroy = !destroy;
		}
 
	}
 
	return destroy;
}

function pause() {
    clearInterval(idTimer);
    pauseFlag = true;
}

function gameOver() {
    localStorage.setItem(username, score);
    canvas.style.display = "none";
    changeDisplay();
}

function new_game() {
    setName();
    init();
    pause();
}

function changeDisplay() {
    if (isGameDisplay) {
        pause();
        canvas.style.display = "none";
        showLiderboard();
        isGameDisplay = false;
    } else {
        deleteLiderboard();
        canvas.style.display = "block";
        isGameDisplay = true;
    }
}

function showLiderboard() {

    for (let i = 0; i < localStorage.length; i++) {
        let obj = {};
        let name = localStorage.key(i);
        obj["name"] = name;
        obj["score"] = localStorage.getItem(localStorage.key(i));
        liderboard.push(obj);
    }

    let sortedPlayer = liderboard.sort(function(a, b) {
        return b.score - a.score;
    });

    let html = "<table cellpadding='3' align='center' border='3'><th>ИМЯ</th><th>ОЧКИ</th>";
    for (let i = 0; i < sortedPlayer.length && i < 15; i++) {
        html += "<tr aling=\"center\">";
        for (let j = 0; j < 1; j++) {
            html += "<td>" + sortedPlayer[i].name + "</td>";
            html += "<td>" + sortedPlayer[i].score + "</td>";
        }
        html += "</tr>";
    }
    html += "</table>";

    document.getElementById("table").innerHTML = html;
}

function restartGame() {
    deleteLiderboard();
    canvas.remove();
    init();
    pause();
}

function deleteLiderboard() {
    if (!isGameDisplay) {
        document.getElementById('table').firstChild.remove();
    }
}

function changePlayer() {
    canvas.remove();
    deleteLiderboard();
    new_game();
}