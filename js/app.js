// Enemies our player must avoid
let Enemy = function (i) {
    // variables applied to each of our instances go here,
    // we"ve provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we"ve provided to easily load images
    this.sprite = "images/enemy-bug.png";

    // horizontal position (X axe)
    this.x = 0;
    this.y = 142 + (Math.floor((Math.random() * 10)) % 3) * 83;

    this.setOnTrack = function () {
        // there are 3 tracks for enemies, randomly choose one
        // a track is 83px witdh
        // the starting point for Y coordinate is rigth bellow the water
        this.y = 142 + (Math.floor((Math.random() * 10)) % 3) * 83;

        // there we've got a track for this enemy
        // next, we have to set its x position
        // an enemy start to move outside the canvas, x coordinate is less than -101 pixels
        // also it needs to avoid having 2 or more enemies overlapped
        // so, we are looking for an empty range of 101 pixel on the track containing <this> y coordinate 

        let width = 102, // width of an enemy + 1
            xPos = -101; // position to be found for <this> enemy
        // xPos it will be 101 pixels left of the most left enemy.x found on this track

        for (let i = 0; i < allEnemies.length; i++) {
            //check if one of these enemies is on the same track
            if (this.index === allEnemies[i].index)
                continue; // this enemy is the one we are looking for a new position
            else {
                if (this.y === allEnemies[i].y) { //found an enemy on this track
                    xPos = Math.min(xPos, allEnemies[i].x - width);
                }
            }
        }
        this.x = xPos - 10; // -10 to have a little gap between
    }

    this.index = i;

    // velocity is a multiplier of dt
    // I want enemies to get randomly one of 4 different speeds
    this.velocity = Math.floor(Math.random() * 1000);

    // collision variables is used by the checkCollision function
    this.playerCollision = false;
    this.enemyCollision = 0;
};

// Update the enemy"s position, required method for game
// Parameter: dt, a time delta between ticks
//---------------------------------------------------
Enemy.prototype.update = function (dt) {
    //---------------------------------------------------
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.velocity * dt;

    // check if this enemy is at the end of the track
    // if yes, the set the x position at the start
    if (this.x > 1010) {
        this.setOnTrack();
    }
};
// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (this.enemyCollision > 0) {
        ctx.drawImage(Resources.get("images/crash.png"), this.x + 70, this.y, 60, 60);
        this.enemyCollision--;
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player


let Player = function (char) {

    //TODO: set the character image based on the 'char' 
    this.sprite = "images/char-boy.png";
    //horizontal position (X axe)
    this.x = 5 * 101;
    //vertical position (Y axe)
    this.y = 4 * 92;
    this.collision = false;
    this.handleInput = function () {};
};


Player.prototype.update = function (dt) {};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



let allEnemies = [],
    crashes = [],
    player = new Player("boy");
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don"t need to modify this.
document.addEventListener("keyup", function (e) {
    let allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };
    player.handleInput(allowedKeys[e.keyCode]);
});