// Enemies our player must avoid

let Enemy = function (i) {
    // variables applied to each of our instances go here,
    // we"ve provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we"ve provided to easily load images
    this.sprite = "images/enemy-bug.png";

    // horizontal position (X axe)
    this.x = 0;
    this.y = 0;

    // velocity is a multiplier of dt
    // I want enemies to get randomly one of 5 different speeds
    //it will change every time is entering the canvas
    this.velocity = Math.floor(Math.random() * 1000) + 5;;
    this.id = i; // used as an identifier of this object

    // collision variables is used by the checkCollision function
    this.enemyCollision = 0; //number of frames a collision splash have to be draw after it was triggered
    this.stay = 0; //when is greater than 0, this enemy stop moving
};

//------------------------------------------------------------------
Enemy.prototype.update = function (dt = 16) {

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
    if (this.stay > 0)
        this.stay--;
    else
        this.x += this.velocity * 0.316 * dt;

    // check if this enemy is at the end of the track
    // if yes, the set the x position at the start
    if (this.x > 1010) {
        this.restartMovingFromLeft();
    }
};

//--------------------------------------------------------------
Enemy.prototype.render = function () {

    // Draw the enemy on the screen, required method for game
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (this.enemyCollision > 0) {

        ctx.drawImage(Resources.get("images/crash.png"), this.x + 60, this.y, 60, 60);
        this.enemyCollision--; //decrease the number of frames left to be draw
    }
};
//--------------------------------------------------------------
Enemy.prototype.randomRow = function () {
    // there are 3 rows for enemies, randomly choose one
    // a row is 83px height
    // the starting point for Y coordinate is rigth bellow the water
    this.row = Math.floor((Math.random() * 10)) % 3 + 1;
    this.y = 142 + (this.row - 1) * 83;
}
//--------------------------------------------------------------
Enemy.prototype.restartMovingFromLeft = function () {

    this.randomRow();
    // there we've got a row for this enemy
    // next, we have to set its x position
    // an enemy start to move outside the canvas, x coordinate is less than -101 pixels
    // also it needs to avoid having 2 or more enemies overlapped
    // so, we are looking for an empty range of 101 pixel on the track containing <this> y coordinate 

    let width = 102, // width of an enemy + 1
        xPos = -101; // position to be found for <this> enemy
    // xPos it will be 101 pixels left of the most left enemy.x found on this track

    for (let i = 0; i < allEnemies.length; i++) {
        //check if one of these enemies is on the same track
        if (this.id === allEnemies[i].id)
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

//--------------------------------------------------------------
Enemy.prototype.checkCollision = function (enemy) {
    //check if enemy as parameter collided with this
    //if yes, change some stuffs here
    if (this.y === enemy.y || this.stay)
    //if they are not on the the same track 
    //or if this enemy wasn't previously stopped behind the one in front
    {
        if ((this.x + 101) > enemy.x && this.x < (enemy.x + 101)) {
            //if collision exist
            this.velocity > enemy.velocity ? // also draw collision splash in front of the faster enemy
                this.enemyCollision = 5 : enemy.enemyCollision = 5;
            // change velocity of both enemies
            // the one behind slow down
            // the one in front accelerate
            let tV = this.velocity;
            this.velocity = enemy.velocity;
            enemy.velocity = tV;
            // if the enemy in front was stopped
            // stop the enemy behind
            this.stay = enemy.stay;
            return true;
        }
    }
    return false;
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
    this.y = 5 * 83 + 51;
    this.lastDt = 0; // hold the last dt 
    this.collision = false;
    this.row = 5; //

    //--------------------------------------------------------------
    this.update = function (dt) {};

    //--------------------------------------------------------------
    this.render = function () {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    //--------------------------------------------------------------
    this.handleInput = function (key) {
        switch (key) {
            case (37): //left
                {
                    if (this.x > 0) // hold the player inside the canvas
                        this.x -= 101; // jump to the left column
                    break;
                }
            case (38): //up
                {
                    if (this.row > 0) // hold the player under the upper edge of the canvas
                    {
                        this.row--;
                        this.y = this.row * 83 + 51; // jump to the upper row
                    }
                    break;
                }
            case (39): //right
                {
                    if (this.x < 1010) // hold the player inside the canvas
                        this.x += 101; // jump to the right column
                    break;
                }
            case (40): //down
                {
                    if (this.row < 5) // hold the player over the bottom edge of the canvas
                    {
                        this.row++; // jump to the bottom row
                        this.y = this.row * 83 + 51; // jump to the bottom row
                    }
                    break;
                }
            default:
        }
    }
    //--------------------------------------------------------------
    this.checkCollision = function (enemy) {

        if (enemy.row === player.row) //if they are on the same row
        {
            if ((enemy.x + 81) > player.x && enemy.x < (player.x + 121)) {
                this.collision = true;
                enemy.stay = 10;
                return true;
            }
            return false;
        }
    }
};


let allEnemies = [],
    crashes = [],
    player = new Player();


//--------------------------------------------------------------
document.addEventListener( /*"keyup"*/ "keydown", function (e) {
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
    };
*/
    player.handleInput(e.keyCode);
});