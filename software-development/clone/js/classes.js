class Shrogg extends PIXI.Sprite {
    constructor (x = 0, y = 0, direction) {
        super(shroggSheet[direction]);
        this.direction = direction;
        this.width = 50;
        this.height = 50;
        this.targetArea = new PIXI.Graphics();
        this.targetcenterx;
        this.targetcentery;
        this.move(x, y);

        this.targetedTime = 0;
        this.timeDeath = 0;
        this.line = new Line(-1, -1, -1, -1);
        this.alive = true;


        stage.addChild(this.line);
    }

    move(x, y) {
        levelSceneActive.removeChild(this.targetArea);
        this.targetArea.clear();
        this.targetArea.beginFill(0xFFFF00, 0.1);
        this.x = x;
        this.y = y;
        switch(this.direction) {
            case 0: //up
                this.targetcenterx = this.x + this.width/2;
                this.targetcentery = this.y + this.height/2 + 200;
                break;
            case 1: //right
                this.targetcenterx = this.x + this.width/2 + 200;
                this.targetcentery = this.y + this.height/2;
                break;
            case 2: //down
                this.targetcenterx = this.x + this.width/2;
                this.targetcentery = this.y + this.height/2 - 200;
                break;
            case 3: //left
                this.targetcenterx = this.x + this.width/2 - 200;
                this.targetcentery = this.y + this.height/2;
                break;
        }
        this.targetArea.drawCircle(this.targetcenterx, this.targetcentery, 200);
        levelSceneActive.addChild(this.targetArea);
    }

    update(dt = 1/60) {
        if(!this.alive) {
            return;
        }
        //line trace between center of shrogg and center of player. if it reaches the player, draws the line.
        let children = levelSceneActive.children;
        let centerx = this.x + (this.width/2);
        let centery = this.y + (this.height/2);

        this.line.move(centerx, centery, player.x + (player.width/2), player.y + (player.height/2));
        let shroggSeesPlayer = true;
        let playerSeesShrogg = true;

        for(let i = 0; i < children.length; i++) {
            if(children[i] instanceof Wall) {
                let wall = children[i];
                let collisionpoint = objLineCollision(wall, centerx, centery, player.x + (player.width/2), player.y + (player.height/2));
                if(collisionpoint.length > 0 ) { //no LOS
                    shroggSeesPlayer = false;
                    playerSeesShrogg = false;
                }
                else { //they see eachother - if shrogg is facing, increase its count. increase player's regardless.
                    if(distanceSquared(this.targetcenterx, this.targetcentery, player.x + (player.width/2), player.y + (player.height/2)) > 40000) {
                        shroggSeesPlayer = false;
                    }
                }
            }
        }
        if(shroggSeesPlayer) {
            this.targetedTime += dt;
            this.line.changeColor(0xFF0000);
        }
        else if(playerSeesShrogg) {
            this.timeDeath += dt;
            this.targetedTime = 0;
            this.line.changeColor(0x0000FF);
        }
        else { //no visibility
            this.targetedTime = 0;
            this.timeDeath = 0;
            this.line.move(-1, -1, -1, -1);
        }

        if(this.targetedTime > 1) {
            this.targetedTime = 0;
            this.line.move(-1, -1, -1, -1);
            if(player.depth > 0) { //is a clone
                
                this.move(player.x, player.y);
                player.rise();
                
            }
            else {
                setLevel(levelIndex);
                loadLevelByIndex(levelIndex);
            }
        }
        else if(this.timeDeath > 1.5) {
            levelSceneActive.removeChild(this);
            levelSceneActive.removeChild(this.targetArea);
            stage.removeChild(this.line);
            this.alive = false;
        }
    }
}

class Level extends PIXI.Container{
    constructor (xenter, yenter, xexit, yexit, shroggs = [], walls = []) {
        super();
        this.xenter = xenter;
        this.yenter = yenter;
        this.xexit = xexit;
        this.yexit = yexit;
        this.shroggs = shroggs;
        this.walls = walls;
        for(let i = 0; i < walls.length; i++) {
            this.addChild(walls[i]);
        }
        for(let i = 0; i < shroggs.length; i++) {
            this.addChild(shroggs[i]);
        }

        this.addChild(new Portal(xexit, yexit));
    }
}
class Player {
    constructor (depth=0, x=0, y=0) {
    this.depth = depth;
    this.x = x;
    this.y = y;
    this.radius = 25; //uses circle-circle collision for being targeted by Shroggs
    this.width = 50; //AABB for wall collisions
    this.height = 50;

    this.idle = new PIXI.AnimatedSprite(playerIdle);
    this.up = new PIXI.AnimatedSprite(playerUp);
    this.down = new PIXI.AnimatedSprite(playerDown);
    this.left = new PIXI.AnimatedSprite(playerLeft);
    this.right = new PIXI.AnimatedSprite(playerRight);

    this.activeAnim = this.idle;

    this.maxSpeed = 120;
    //this.movementHistory = [];
    this.xVel = 0;
    this.yVel = 0;
    }

    update(dt = 1/60) {
        this.x += this.xVel * this.maxSpeed * dt;
        this.y += this.yVel * this.maxSpeed * dt;

        //wall collision - I wanted to use my line trace functions for this, but I found AABB to be more computationally efficient.
        let children = levelSceneActive.children;

        for(let i = 0; i < children.length; i++) {
            if(children[i] instanceof Wall) {
                let wall = children[i];
                if(this.x < wall.x + wall.width && this.x + this.width > wall.x && //collision on x
                   this.y < wall.y + wall.height && this.y + this.height > wall.y) {//collision on y
                    //collision occurs

                    //get overlapping area
                    let xoverlap = Math.min(wall.width + wall.x - this.x, this.width + this.x - wall.x);
                    let yoverlap = Math.min(wall.height + wall.y - this.y, this.height + this.y - wall.y);

                    if(xoverlap < yoverlap) { //check Y or X?
                        if(this.x > wall.x) { //player is right                        
                            this.x = wall.x + wall.width;
                        }
                        else { //player is left
                            this.x = wall.x - this.width;
                        }
                    }
                    else {
                        if(this.y > wall.y) {
                        
                        this.y = wall.y + wall.height;
                        
                        }
                        else {
                        this.y = wall.y - this.height;
                        }
                    }
                }
            }
        }
        //close to portal
        if(distanceSquared(player.x, player.y, levelSceneActive.xexit, levelSceneActive.yexit) < 625) {
            loadNextLevel();
        }

        //update animation pos
        this.activeAnim.x = this.x;
        this.activeAnim.y = this.y;
    }

    changeMoveDirection(w, a, s, d, dt) {
        //this.movementHistory.push(new MoveChange(w, a, s, d, dt));
        this.xVel = 0;
        this.yVel = 0;
        if(w) {
            this.yVel -= 1;
        }
        if(a) {
            this.xVel -= 1;
        }
        if(s) {
            this.yVel += 1;
        }
        if(d) {
            this.xVel += 1;
        }


        if(this.yVel > 0) {
            this.setAnimation(this.down);
        }
        else if(this.yVel < 0) {
            this.setAnimation(this.up);
        }
        else if(this.xVel > 0) {
            this.setAnimation(this.right);
        }
        else if(this.xVel < 0) {
            this.setAnimation(this.left);
        }
        else {
            this.setAnimation(this.idle);
            return;
        }

        if(this.xVel != 0 && this.yVel != 0) //fix diagonal movement being too fast
        {
            this.xVel *= .707; //sqrt(2)/2
            this.yVel *= .707;
        }
    }

    setAnimation(anim)
    {
        gameScene.removeChild(this.activeAnim);
        anim.x = this.x; 
        anim.y = this.y; 
        anim.width = this.width;
        anim.height = this.height;
        anim.animationSpeed = 1/4;
        anim.loop = true;
        this.activeAnim = anim;
        gameScene.addChild(anim);
        anim.play();
    }

    clone() {
        if(mana > 0 && this.depth == 0) {
            mana--;
            updateMana();
            this.setAnimation(this.idle);
            unpossessedPlayers.push(this);
            player = new Player(this.depth + 1, this.x, this.y);
        }
    }

    rise() {
        gameScene.removeChild(player.activeAnim);
        player = unpossessedPlayers.pop();
    }
}

class Wall extends PIXI.Sprite {
    constructor(x=0, y=0, width=50, height=50, sprite="images/wall.png") {
        super(app.loader.resources[sprite].texture);

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        Object.seal(this);
    }
}

//this is used to store movement changes so that the clone can retrace it's steps.
class MoveChange {
    constructor(w, a, s, d, dt) {
        this.w = w;
        this.a = a;
        this.s = s;
        this.d = d;
        this.dt = dt;
    }
}

class Line extends PIXI.Graphics {
    constructor(x1, y1, x2, y2, color = 0xFFFFFF) {
        super();
        this.color = color;
        this.lineStyle(3, this.color);
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
    }

    move(x1, y1, x2, y2) {
        this.clear();
        this.lineStyle(3, this.color);
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
    }

    changeColor(newColor = 0xFFFFFF) {
        this.lineStyle(3, newColor);
        this.color = newColor;
    }
}

class Portal extends PIXI.Sprite {
    constructor(x, y) {
        super(app.loader.resources["images/portal.png"].texture);
        
        this.x = x;
        this.y = y;
    }
}
    