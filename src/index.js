/*
MIT License

Copyright (c) 2019 Ayhan Dorman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const   worldSize = 200,
        tileWidth = 40,
        tileTypes = 29,
        monsterTypes = 4,
        directions = {
            down: 0,
            downLeft: 1,
            left: 2,
            upLeft: 3,
            up: 4,
            upRight: 5,
            right: 6,
            downRight: 7
        },
        assetsPath = "./assets/img/",
        blockingTypes = [1, 6, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28];
var canvas, context, screenWidth, screenHeight, cursorPosition, soldier, target, steps, tileBar, progressing,
    selectedTileType = 1,
    currentButton = 3,
    currentStep = 0, 
    fps = 0, 
    fpsCounter = 0,
    screen = {x1: 0, x2: 0, y1: 0, y2: 0},
    tiles = Array(worldSize),
    images = Array(tileTypes),
    monsters = [],
    monsterSprites = [],
    lastRender = new Date();

class Monster {
    constructor() {
        this.type = 0;
        this.x = 0;
        this.y = 0;
        this.counter = 0;
        this.direction = directions.down;
        this.target = {
            x: 0,
            y: 0
        }
    }

    render = () => {
        if (this.x == this.target.x * tileWidth && this.y == this.target.y * tileWidth) {
            debugger
            let availableDirections = [];
            if (this.x / tileWidth > 0 && !tiles[this.x / tileWidth - 1][this.y / tileWidth].blocking) availableDirections.push(directions.left);
            if (this.x / tileWidth < worldSize && !tiles[this.x / tileWidth + 1][this.y / tileWidth].blocking) availableDirections.push(directions.right);
            if (this.y / tileWidth > 0 && !tiles[this.x / tileWidth][this.y / tileWidth - 1].blocking) availableDirections.push(directions.up);
            if (this.y / tileWidth < worldSize && !tiles[this.x / tileWidth][this.y / tileWidth + 1].blocking) availableDirections.push(directions.down);
            this.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            switch(this.direction) {
                case directions.left: this.target.x--; break;
                case directions.right: this.target.x++; break;
                case directions.up: this.target.y--; break;
                case directions.down: this.target.y++; break;
            }
        } else {
            this.counter = (this.counter + 1) % 30;
            this.x = this.x > this.target.x * tileWidth ? this.x - 1 : this.x + 1;
            this.y = this.y > this.target.y * tileWidth ? this.y - 1 : this.y + 1;
        }
        context.drawImage(monsterSprites[this.type], Math.floor(this.counter / 10) * 48, this.direction * 48, 48, 48, this.x - soldier.x + screenWidth / 2 - 4, this.y - soldier.y + screenHeight / 2 - 15, 48, 48);
    }
}

class Soldier {
    constructor() {        
        this.x = (worldSize * tileWidth) / 2;
        this.y = (worldSize * tileWidth) / 2;
        this.counter = 0;
        this.direction = directions.downRight;
        target = {
          x: parseInt(this.x / tileWidth),
          y: parseInt(this.y / tileWidth)
        };
        steps = [{
          x: target.x,
          y: target.y
        }];
    }
    
    render = () => {
        let whereToGo = steps[currentStep] ? {
            x: steps[currentStep].x * tileWidth,
            y: steps[currentStep].y * tileWidth
        } : {x: this.x, y: this.y}

        if (this.x != whereToGo.x || this.y != whereToGo.y) {
            this.counter = (this.counter + 1) % 36;
            this.x += whereToGo.x == this.x ? 0 : whereToGo.x < this.x ? -2 : 2;
            this.y += whereToGo.y == this.y ? 0 : whereToGo.y < this.y ? -2 : 2;

            switch(true) {
                case (this.x > whereToGo.x && this.y == whereToGo.y): this.direction = directions.left; break;
                case (this.x < whereToGo.x && this.y == whereToGo.y): this.direction = directions.right; break;
                case (this.y > whereToGo.y && this.x == whereToGo.x): this.direction = directions.up; break;
                case (this.y < whereToGo.y && this.x == whereToGo.x): this.direction = directions.down; break;
                case (this.x > whereToGo.x && this.y > whereToGo.y): this.direction = directions.upLeft; break;
                case (this.x < whereToGo.x && this.y < whereToGo.y): this.direction = directions.downRight; break;
                case (this.x > whereToGo.x && this.y < whereToGo.y): this.direction = directions.downLeft; break;
                case (this.x < whereToGo.x && this.y > whereToGo.y): this.direction = directions.upRight; break;
            }
        } else {
            if (currentStep < steps.length) {
                currentStep++;
            }
        }
        // <render shadow>
        context.shadowBlur = 5;
        context.shadowColor = "black";
        context.fillStyle = "rgba(0,0,0,.3)";
        context.beginPath();
        context.ellipse(screenWidth / 2 + 15, screenHeight / 2 + 19, 16, 8, 0, 0, 2 * Math.PI);
        context.fill();
        context.shadowBlur = 0;
        // </render shadow>
        context.drawImage(soldierImage, Math.floor(this.counter / 6) * 69, this.direction * 96, 69, 96, screenWidth / 2 - 20, screenHeight / 2 - 48, 69, 96);
    };
}
			
var soldierImage = new Image();
soldierImage.src = `${assetsPath}soldier.png`;
var targetImage = new Image();
targetImage.src = `${assetsPath}target.png`;

for (let i = 1; i <= monsterTypes; i++) {
    let monsterSprite = new Image();
    monsterSprite.src = `${assetsPath}/monsters/${i}.png`;
    monsterSprites.push(monsterSprite);
}

const setCanvasSize = () => {
    canvas.width = screenWidth = window.innerWidth;
    canvas.height = screenHeight = window.innerHeight;
}

const resetDirections = () => {
    for (let i = 0; i <= worldSize; i++) {
        for (let j = 0; j <= worldSize; j++) {
            tiles[i][j].direction = 0;
        }
    }
}

const markDirections = (x, y) => {
    if (x > 0 && y > 0 && !tiles[x - 1][y - 1].blocking && tiles[x - 1][y - 1].direction == 0) {
        tiles[x - 1][y - 1].direction = 1;
        if (x - 1 == target.x && y - 1 == target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < worldSize, y > 0 && !tiles[x + 1][y - 1].blocking && tiles[x + 1][y - 1].direction == 0) {
        tiles[x + 1][y - 1].direction = 3;
        if (x + 1 == target.x && y - 1 == target.y) {
          return true;
        }
        progressing = true;
    }
    if (x < worldSize && y < worldSize && !tiles[x + 1][y + 1].blocking && tiles[x + 1][y + 1].direction == 0) {
        tiles[x + 1][y + 1].direction = -1;
        if (x + 1 == target.x && y + 1 == target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && y < worldSize && !tiles[x - 1][y + 1].blocking && tiles[x - 1][y + 1].direction == 0) {
        tiles[x - 1][y + 1].direction = -3;
        if (x - 1 == target.x && y + 1 == target.y) {
            return true;
        }
        progressing = true;
    }
    if (x > 0 && !tiles[x - 1][y].blocking && tiles[x - 1][y].direction == 0) {
        tiles[x - 1][y].direction = -4;
        if (x - 1 == target.x && y == target.y) {
            return true;
        }
        progressing = true;
    }
    if (y > 0 && !tiles[x][y - 1].blocking && tiles[x][y - 1].direction == 0) {
        tiles[x][y - 1].direction = 2;
        if (x == target.x && y - 1 == target.y) {
            return true;
        }
        progressing = true;
    }
    if (x < worldSize && !tiles[x + 1][y].blocking && tiles[x + 1][y].direction == 0) {
        tiles[x + 1][y].direction = 4;
        if (x + 1 == target.x && y == target.y) {
            return true;
        }
        progressing = true;
    }
    if (y < worldSize && !tiles[x][y + 1].blocking && tiles[x][y + 1].direction == 0) {
        tiles[x][y + 1].direction = -2;
        if (x == target.x && y + 1 == target.y) {
            return true;
        }
        progressing = true;
    }
    return false;
}

const update = () => {

    // <render tiles>
    screen = {
        x1: (() => {screen.x1 = parseInt((soldier.x - screenWidth / 2) / tileWidth); return screen.x1 > 0 ? screen.x1 : 0})(),
        y1: (() => {screen.y1 = parseInt((soldier.y - screenHeight / 2) / tileWidth); return screen.y1 > 0 ? screen.y1 : 0})(),
        x2: (() => {screen.x2 = parseInt((soldier.x + screenWidth / 2) / tileWidth); return screen.x2 <= worldSize ? screen.x2 : worldSize})(),
        y2: (() => {screen.y2 = parseInt((soldier.y + screenHeight / 2) / tileWidth); return screen.y2 <= worldSize ? screen.y2 : worldSize})()
    };
    context.fillStyle = "#3ABE41";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = screen.x1; x <= screen.x2; x++) {
        for (let y = screen.y1; y <= screen.y2; y++) {
            context.drawImage(images[tiles[x][y].type], x * tileWidth - soldier.x + screenWidth / 2, y * tileWidth - soldier.y + screenHeight / 2, tileWidth, tileWidth);
        }
    }
    // </render tiles>

    // <render target>
    if (currentStep < steps.length) {
        context.drawImage(targetImage, target.x * tileWidth - soldier.x + screenWidth / 2, target.y * tileWidth - 15 - soldier.y + screenHeight / 2, tileWidth, tileWidth);
    }
    // </render target>

    // <new monster spawn>
    if (Math.floor(Math.random() * 10) == 0) {
        let spawnPoint = {
            x: Math.floor(Math.random() * worldSize),
            y: Math.floor(Math.random() * worldSize)
        }
        if (!tiles[spawnPoint.x][spawnPoint.y].blocking) {
            let monster = new Monster();
            monster.x = spawnPoint.x * tileWidth;
            monster.y = spawnPoint.y * tileWidth;
            monster.type = Math.floor(Math.random() * 3);
            monster.target.x = spawnPoint.x;
            monster.target.y = spawnPoint.y;
            monsters.push(monster);
        }
    }
    // </new monster spawn>

    // <render monsters and the player>
    for (let monster of monsters) {
        monster.render();
    }

    soldier.render();
    // </render monsters and the player>

    // <FPS info>
    fpsCounter++;
    let now = new Date();
    if (now - lastRender >= 1000) {
        lastRender = now;
        fps = fpsCounter;
        fpsCounter = 0;    
    }
    context.font = "18px Arial";
    context.fillText("FPS: " + fps, 10, 30);
    // </FPS info>
}

const downloadMap = () => {
    document.querySelector("[download]").setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tiles)));
}

document.oncontextmenu = (e) => e.preventDefault();

window.onresize = () => setCanvasSize();

window.onload = () => {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    setCanvasSize();
    tileBar = document.querySelector(".tile-bar");

    if (map) {
        tiles = map;
    } else {
        for (let i = 0; i <= worldSize; i++) {
            tiles[i] = new Array(worldSize);
            for (let j = 0; j <= worldSize; j++) {
                tiles[i][j] = {
                    type: 0,
                    direction: 0,
                    blocking: false
                };
            }
        }
    }

    for (let i = 0; i < tileTypes; i++) {
        images[i] = new Image();
        images[i].src = `${assetsPath}tiles/${i}.png`;
        images[i].setAttribute('data-tile', i)
        images[i].onclick = (e) => {
            for (let item of document.querySelectorAll('.tile-bar>img')) {
                item.classList.remove('selected');
            }
            selectedTileType = parseInt(e.target.getAttribute('data-tile'));
            e.target.classList.add('selected');
        }
        if (i == 1) {
            images[i].classList.add('selected');
        }
        tileBar.appendChild(images[i]);
    }

    canvas.onmousemove = (e) => {
        cursorPosition = {
            x: parseInt((soldier.x - (screenWidth / 2) + e.clientX) / tileWidth),
            y: parseInt((soldier.y - (screenHeight / 2) + e.clientY) / tileWidth)
        };
        if (currentButton == 2) {
            tiles[cursorPosition.x][cursorPosition.y].type = selectedTileType;            
            tiles[cursorPosition.x][cursorPosition.y].blocking = blockingTypes.includes(selectedTileType);
        }
    }

    canvas.onmousedown = (e) => {
        currentButton = e.button;

        if (currentButton == 0 && tiles[cursorPosition.x][cursorPosition.y].blocking)
        {
           return; 
        }
        if (currentButton == 2) {
            tiles[cursorPosition.x][cursorPosition.y].type = selectedTileType;
        } else if (currentButton == 0) {
            resetDirections();
            target = {
                x: cursorPosition.x,
                y: cursorPosition.y
            }

            // find
            var found = false;
            var initialSearch = false;
            progressing = true;
            
            while (!found && progressing) {
                if (!initialSearch) {
                    found = markDirections(parseInt(soldier.x / tileWidth), parseInt(soldier.y / tileWidth));
                    initialSearch = true;
                    } else {
                    progressing = false;
                    for (let i = 0; i < worldSize; i++) {
                        for (let j = 0; j < worldSize; j++) {
                            if (tiles[i][j].direction != 0) {
                                found = markDirections(i, j);
                                if (found) {
                                    break;
                                }
                            }            
                        }
                        if (found) break;
                    }
                }
            }
            if (found) {
                currentStep = 0;
                let currentLocation = {
                    x: target.x,
                    y: target.y
                }
                let soldierLocation = {
                    x: parseInt(soldier.x / tileWidth),
                    y: parseInt(soldier.y / tileWidth)
                }
                steps = [];            
                while (currentLocation.x != soldierLocation.x || currentLocation.y != soldierLocation.y) {
                    switch (tiles[currentLocation.x][currentLocation.y].direction) {
                        case -4: ++currentLocation.x; break;
                        case  1: ++currentLocation.x; ++currentLocation.y; break;
                        case  2: ++currentLocation.y; break;
                        case  3: --currentLocation.x; ++currentLocation.y; break;
                        case  4: --currentLocation.x; break;
                        case -1: --currentLocation.x; --currentLocation.y; break;
                        case -2: --currentLocation.y; break;
                        case -3: ++currentLocation.x; --currentLocation.y; break;          
                    }
                    steps.push({x: currentLocation.x, y: currentLocation.y});
                }
                steps = steps.reverse();
            }
        }
    }

    canvas.onmouseup = () => currentButton = 3;

    soldier = new Soldier();

    (function mainLoop() {
        window.requestAnimationFrame(mainLoop);
        update();
    })();
}

module.exports = {
    generateMap: function () {
        downloadMap();
    }
};