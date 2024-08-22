function createLabelsAndButtons() {
    //Start Scene
    let startImg = new PIXI.Sprite(app.loader.resources["images/clonemenu.png"].texture);
    startImg.width = sceneWidth;
    startImg.height = sceneHeight;
    startScene.addChild(startImg);

    
    let startButton = new PIXI.Sprite(app.loader.resources["images/startUnpressed.png"].texture);
    startButton.x = 182;
    startButton.y = 247;
    startButton.interactive = true;

    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.texture = app.loader.resources["images/startPressed.png"].texture);
    startButton.on('pointerout', e => e.currentTarget.texture = app.loader.resources["images/startUnpressed.png"].texture);
    startScene.addChild(startButton);


    //manabar
    manabarBack = new PIXI.Graphics();
    manabarBack.beginFill(0x979c9d);
    manabarBack.drawRoundedRect(200, 500, 200, 50, 15);

    manabar = new PIXI.Graphics();
    manabar.beginFill(0x90d3e4);
    manabar.drawRoundedRect(200, 500, 200, 50, 15);

    manabarShell = new PIXI.Sprite(app.loader.resources["images/manabar.png"].texture);
    manabarShell.x = 200;
    manabarShell.y = 500;

    gameScene.addChild(manabarBack);
    gameScene.addChild(manabar);
    gameScene.addChild(manabarShell);


    // 3 - set up `victoryScene`
    let victoryImg = new PIXI.Sprite(app.loader.resources["images/victory.png"].texture);
    victoryImg.width = sceneWidth;
    victoryImg.height = sceneHeight;
    victoryScene.addChild(victoryImg);

    
    let restartButton = new PIXI.Sprite(app.loader.resources["images/restartUnpressed.png"].texture);
    restartButton.x = 182;
    restartButton.y = 247;
    restartButton.interactive = true;
    restartButton.buttonMode = true;
    restartButton.on("pointerup", startGame);
    restartButton.on('pointerover', e => e.target.texture = app.loader.resources["images/restartPressed.png"].texture);
    restartButton.on('pointerout', e => e.currentTarget.texture = app.loader.resources["images/restartUnpressed.png"].texture);
    victoryScene.addChild(restartButton);
}

//holds the level data
function createLevels() {
    for(let i = 0; i < 5; i++) {
        setLevel(i);
    }
}

function setLevel(index) {
    switch(index) {
        case 0:
            levelScenes[0] = new Level(250, 500, 75, 75, [new Shrogg(100, 100, 1)], [
                new Wall(0, 0, 600),
                new Wall(0, 550, 600, 50, "images/ceiling.png"),
                new Wall(0, 0, 50, 600, "images/ceiling.png"),
                new Wall(550, 0, 50, 600, "images/ceiling.png"),
                new Wall(200, 400, 200), 
                new Wall(200, 200, 200, 200, "images/ceiling.png")
            ]);
            break;
        case 1:
            levelScenes[1] = new Level(250, 500, 400, 100, [
                new Shrogg(100, 500, 2), 
                new Shrogg(500, 500, 2),
                new Shrogg(75, 75, 0)
            ], [
                new Wall(0, 0, 600),
                new Wall(250, 400, 100), 
                new Wall(0, 550, 600, 50, "images/ceiling.png"),
                new Wall(150, 400, 50, 350, "images/ceiling.png"),
                new Wall(400, 400, 50, 350, "images/ceiling.png"),
                new Wall(0, 0, 50, 600, "images/ceiling.png"),
                new Wall(550, 0, 50, 600, "images/ceiling.png")
            ]);
            break;

        case 2:
            levelScenes[2] = new Level(250, 500, 75, 75, [
                new Shrogg(100, 300, 1), 
                new Shrogg(500, 300, 3)
            ], [
                new Wall(0, 0, 600),
                new Wall(50, 400, 200),
                new Wall(400, 400, 150), 
                new Wall(0, 550, 600, 50, "images/ceiling.png"),
                new Wall(0, 0, 50, 600, "images/ceiling.png"),
                new Wall(550, 0, 50, 600, "images/ceiling.png")
            ]);
            break;

        case 3:
            levelScenes[3] = new Level(250, 500, 275, 75, [
                new Shrogg(100, 100, 0),
                new Shrogg(500, 100, 3)
            ], [
                new Wall(0, 0, 600),
                new Wall(0, 550, 600, 50, "images/ceiling.png"),
                new Wall(0, 0, 50, 600, "images/ceiling.png"),
                new Wall(550, 0, 50, 600, "images/ceiling.png"),
                new Wall(200, 400, 350), 
                new Wall(200, 200, 350, 200, "images/ceiling.png")
            ]);
            break;

        case 4:
            levelScenes[4] = new Level(500, 250, 75, 500, [
                new Shrogg(75, 450, 0),
                new Shrogg(75, 400, 2),
                new Shrogg(75, 50, 0),
                new Shrogg(275, 75, 1)
            ], [
                new Wall(0, 0, 600),
                new Wall(0, 550, 600, 50, "images/ceiling.png"),
                new Wall(0, 0, 50, 600, "images/ceiling.png"),
                new Wall(550, 0, 50, 600, "images/ceiling.png"),
                new Wall(150, 100, 50), 
                new Wall(200, 200, 200),
                new Wall(150, 0, 50, 100, "images/ceiling.png"),
                new Wall(150, 200, 50, 350, "images/ceiling.png")
            ]);
            break;
            
    }

}

function updateMana() {
    manabar.clear();
    manabar.beginFill(0x90d3e4);
    manabar.drawRoundedRect(200, 500, mana * 67, 50, 15);
}