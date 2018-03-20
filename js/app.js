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

    // velocity is a multiplier of dt
    // I want enemies to get randomly one of 5 different speeds
    //it will change every time is entering the canvas
    this.velocity = Math.floor(Math.random() * 1000) + 5;;

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

        // 3.36pixels/frame is the mean animation speed of an enemy
        // but we will add some random variations for every enemy
        this.velocity = 0.5 + Math.random();

    }

    this.index = i;

    // collision variables is used by the checkCollision function
    this.playerCollision = false;
    this.enemyCollision = 0;
};

//------------------------------------------------------------------
Enemy.prototype.update = function (dt) {
    //------------------------------------------------------------------
    // Update the enemy"s position, required method for game
    // Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // --------
    // I think the proper mean-speed of an enemy would be 303px/sec (or 3 columns/sec.)
    // or 5.05px/dt or 0.316px/milisec.
    // knowing this fraction, whenever the denominator <dt> is changing, we have to change the numerator
    // in order to preserve the same value = speed of animation. On this purpose, we'll use the rule of three:
    // 0.316=x/dt --> x=0.316*dt; if dt is increasing (slow processor speed for whatever reason) then also x increase 
    // then x also increase, x being the number of pixels an enemy is moving in a single frame animation

    this.x += this.velocity * 0.316 * dt;

    // check if this enemy is at the end of the track
    // if yes, the set the x position at the start
    if (this.x > 1010) {
        this.setOnTrack();
    }
};

//--------------------------------------------------------------
Enemy.prototype.render = function () {
    //--------------------------------------------------------------
    // Draw the enemy on the screen, required method for game
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
    this.lastDt = 0; // hold the last dt 

    this.collision = false;

    this.handleInput = function (key) {

        switch (key) {
            case (37):
                {
                    if (this.x > 0) // hold the player inside the canvas
                        player.x -= 101;// jump to the left column
                    break;
                }
            case (38):
                {
                    if (this.y > 0) // hold the player inside the canvas
                        player.y -= 83;// jump to the upper row
                    break;
                }
            case (39):
                {
                    if (this.x < 1010) // hold the player inside the canvas
                        player.x += 101;// jump to the right column
                    break;
                }
            case (40):
                {
                    if (this.y < 606) // hold the player inside the canvas
                        player.y += 83;// jump to the bottom row
                    break;
                }
            default:
                ;
        }
    }
};


//--------------------------------------------------------------
Player.prototype.update = function (dt) {
    //--------------------------------------------------------------
};

//--------------------------------------------------------------
Player.prototype.render = function () {
    //--------------------------------------------------------------

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

let allEnemies = [],
    crashes = [],
    player = new Player();


//--------------------------------------------------------------
document.addEventListener(/*"keyup"*/ "keydown", function (e) {
    //----------------------------------------------------------
    // keydown works better than keyup
    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don"t need to modify this.
    /*
    let allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };*/

    player.handleInput(e.keyCode);
});

//--------------------------------------------------------------
Player.prototype.handleInput = function (key) {
    //--------------------------------------------------------------

    console.log(key);
}