"use strict";
function onLoad() {
    let gameDiv = document.querySelector("#game");
    console.log(gameDiv);
    gameDiv.appendChild(app.view);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    

    
    // pre-load the images
    app.loader.
        add([
            "images/wizard.png",
            "images/shrogg.png",
            "images/wall.png",
            "images/ceiling.png",
            "images/portal.png",
            "images/clonemenu.png",
            "images/manabar.png",
            "images/startPressed.png",
            "images/startUnpressed.png",
            "images/restartUnpressed.png",
            "images/restartPressed.png",
            "images/victory.png"
        ]);
    app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
    app.loader.onComplete.add(setup);
    app.loader.load();
}

const app = new PIXI.Application({
    width: 600,
    height: 600,
    backgroundColor: 0x133d0b,
});
// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	

// aliases
let stage;

// game variables
let startScene;
let gameScene;
let levelScenes = [];//,shootSound,hitSound,fireballSound;
let levelSceneActive = new PIXI.Container();
levelSceneActive.visible = false;

let manabar;
let manabarShell;
let levelLabel;
let victoryScene;

let shroggs = [];
let clones = [];
let player;
let unpossessedPlayers = [];

let w;
let a; 
let s;
let d;
let timeSinceChange;

let playerIdle = [];

let playerUp = [];
let playerDown = [];
let playerLeft = [];
let playerRight = [];

let shroggSheet = [];

let mana = 3;
let levelIndex;
let paused = true;

function setup() {
	stage = app.stage;
	// #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #2 - Populate levels
    
    // #3 - Create the 'victory' scene and make it invisible
    victoryScene = new PIXI.Container();
    victoryScene.visible = false;
    stage.addChild(victoryScene);
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
	
    playerIdle = loadAnim("images/wizard.png", 128, 128, 8, 0);
    playerUp = loadAnim("images/wizard.png", 128, 128, 8, 1);
    playerDown = loadAnim("images/wizard.png", 128, 128, 8, 2);
    playerLeft = loadAnim("images/wizard.png", 128, 128, 8, 3);
    playerRight = loadAnim("images/wizard.png", 128, 128, 8, 4);

    shroggSheet = loadAnim("images/shrogg.png", 128, 128, 4, 0);

	// #5 - Create player
	player = new Player();

    app.ticker.add(gameLoop);
}

function startGame() {

    startScene.visible = false;
    victoryScene.visible = false;
    gameScene.visible = true;
    levelIndex = 0;
    mana = 3;
    createLevels();
    loadLevelByIndex(0);
}


function gameLoop(){
	if (paused) return;
	
	// #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) {
        dt=1/12;
    }
    timeSinceChange += dt;
	
	// #2 - Move Player
    player.update(dt);
	
    // #3 - update enemies
    for(let i = 0; i < levelSceneActive.shroggs.length; i++) {
        levelSceneActive.shroggs[i].update(dt);
        
    }

}

function loadNextLevel(){
    loadLevelByIndex(levelIndex + 1);
}

function loadLevelByIndex(index) {
    mana = 3;
    updateMana();

    //hide lines 
    if(levelSceneActive instanceof Level) {
        console.log("isLevel");
        for(let i = 0; i < levelSceneActive.shroggs.length; i++) {
            levelSceneActive.shroggs[i].line.move(-1, -1, -1, -1);
            
        }
    }

    gameScene.removeChild(levelSceneActive);
    levelIndex = index;

    if(levelScenes.length <= levelIndex) {
        end();
        return;
    }
    levelSceneActive = levelScenes[levelIndex];
    gameScene.addChild(levelSceneActive);

    for(let i = 0; i < levelSceneActive.shroggs.length; i++) {
        levelSceneActive.shroggs[i].move(levelSceneActive.shroggs[i].x, levelSceneActive.shroggs[i].y);
    }

    while(player.depth > 0 ) player.rise(); //erase clones
    player.x = levelSceneActive.xenter;
    player.y = levelSceneActive.yenter;
    player.changeMoveDirection();
    paused = false;
}

function end() {
    paused = true;

    gameScene.visible = false;
    victoryScene.visible = true;
}

function loadAnim (source="images/explosions.png", w=64, h=64, frames=8, animIndex=0) {
    let spriteSheet = PIXI.BaseTexture.from(source);
    
    let width = w;
    let height = h;
    let numFrames = frames;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, animIndex * height, width, height));
        textures.push(frame);
    }
    return textures;
}

function onKeyDown(key) {
    switch(key.key) {
        case "w":
            w = true;
            break;
        case "a":
            a = true;
            break;
        case "s":
            s = true;
            break;
        case "d":
            d = true;
            break;
        case " ":
        case "e":
            player.clone();
            break;
        
    }
    player.changeMoveDirection(w, a, s, d, timeSinceChange);
    timeSinceChange = 0;
}

function onKeyUp(key) {
    switch(key.key) {
        case "w":
            w = false;
            break;
        case "a":
            a = false;
            break;
        case "s":
            s = false;
            break;
        case "d":
            d = false;
            break;
    }
    player.changeMoveDirection(w, a, s, d, timeSinceChange);
    timeSinceChange = 0;
}