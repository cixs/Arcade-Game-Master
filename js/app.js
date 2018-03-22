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
    this.xIncrement = 0;

    // velocity is a multiplier of dt
    // I want enemies to get randomly one of 5 different speeds
    //it will change every time is entering the canvas
    this.velocity = Math.floor(Math.random() * 1000) + 5;
    this.velocityKeeper = this.velocity; // need to remember actual velocity before being stopped
    this.id = i; // used as an identifier of this object

    // collision variables is used by the checkCollision function
    this.drawCollision = 0; //number of frames a collision splash have to be draw after it was triggered
    this.stayTime = 0; //when is greater than 0, this enemy stop moving

    //--------------------------------------------------------------
    this.right = function () {

        return this.x + 99;
    }
    //--------------------------------------------------------------
    this.nextRight = function () {
        return this.x + 99 + this.xIncrement;
    }
    //--------------------------------------------------------------
    this.left = function () {
        return this.x + 1;
    }
    //--------------------------------------------------------------
    this.randomRow = function () {
        // there are 3 rows for enemies, randomly choose one
        // a row is 83px height
        // the starting point for Y coordinate is rigth bellow the water
        this.row = Math.floor((Math.random() * 10)) % 3 + 1;
        this.y = 142 + (this.row - 1) * 83;
    }
    //--------------------------------------------------------------
    this.restartMovingFromLeft = function () {

        this.randomRow();
        // there we've got a row for this enemy
        // next, we have to set its x position
        // an enemy start to move outside the canvas, x coordinate is less than -101 pixels
        // also it needs to avoid having 2 or more enemies overlapped
        // so, we are looking for an empty range of 101 pixel on the track containing <this> y coordinate 

        const width = 102; // width of an enemy + 1
        let xPos = -101; // position to be found for <this> enemy
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
        this.velocityKeeper = this.velocity;
    }
    //-----------------------------------------
    this.stop = function (numberOfFrames) {
        this.velocity = 0;
        this.stayTime = numberOfFrames;
    }
};

//------------------------------------------------------------------
Enemy.prototype.update = function (dt = 16 /*default value*/ ) {

    // Update the enemy"s position, required method for game
    // Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // --------
    // I think the proper speed of an enemy would be 303px/sec (or 3 columns/sec.)
    // or 5.05px/dt or 0.316px/milisec.
    // knowing this fraction, whenever the denominator -dt- is changing, we have to change the numerator
    // in order to preserve the same value (speed) of animation. On this purpose, we'll use the rule of three:
    // 0.316 = px/dt --> px = 0.316*dt; if dt increase (slow speed for whatever reason) then also px increase 
    // px being the number of pixels an enemy is moving in a single frame animation

    if (this.stayTime > 0) {
        this.stayTime--;
        if (this.stayTime === 0) {
            this.velocity = this.velocityKeeper;
        }
    } else {
        this.x += this.xIncrement; //increase the x based on the previous dt
        this.xIncrement = Math.floor(this.velocity * 0.316 * dt);
    }
    // check if this enemy is at the end of the track
    // if yes, the set the x position at the start
    if (this.x > 909) {
        this.restartMovingFromLeft();
    }
};

//--------------------------------------------------------------
Enemy.prototype.render = function () {

    // Draw the enemy on the screen, required method for game
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (this.drawCollision > 0) {

        ctx.drawImage(Resources.get("images/crash.png"), this.x + 70, this.y, 60, 60);
        this.drawCollision--; //decrease the number of frames left to be draw for collision splash
    }
};

//--------------------------------------------------------------
Enemy.prototype.checkCollision = function (enemy) {
    //check if enemy as parameter collided with this
    //if yes, change some stuffs here
    if (this.row === enemy.row)
    //if they are on the the same track 
    //and if this enemy wasn't previously stopped behind the one in front
    {
        //see which one is moving left
        let left = null,
            right = null;
        if (this.velocity > enemy.velocity) {
            left = this;
            right = enemy
        } else if (this.velocity > enemy.velocity) {
            left = enemy;
            right = this;
        } else //both velocity are 0
        {
            if (this.left < enemy.left()) {
                left = this;
                right = enemy;
            } else {
                right = this;
                left = enemy;
            }
        }
        //          return;

        if ((left.nextRight() - right.left(0)) >= 0 && left.left() < right.right()) {
            //here is a collision
            let stateChanged = true;

            if (right.stayTime > 0) { //the enemy beyond was stoped
                if (left.stayTime > 0) // both enemy are stopped, nothing to change
                    stateChanged = false;
                left.stop(22); //stop this too (if it was moving) or keep it stopped if it was stopped
            }

            if (stateChanged) {
                left.drawCollision = 5;
                // change velocity of both enemies
                // the one behind slow down
                // the one in front accelerate
                let tV = left.velocity;
                left.velocity = right.velocity;
                right.velocity = tV;
                Sounds[1].play();
            }
        }
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
    this.x = 4 * 101;
    //vertical position (Y axe)
    this.y = 5 * 83 + 51;
    this.row = 5; //
    this.teleFrames = 0; //when is greater than zero, teleporting animation is on for next 'teleFrames' frames
    //--------------------------------------------------------------
    this.update = function () {
        if (this.teleFrames > 0) // started from 20, inside startTeleporting function,
        {
            this.teleFrames--; // and trigered after a collision with enemy

            if (this.teleFrames === 40) { // at the middle of teleporting state
                this.x = 4 * 101; // is where the player jump to the initial position
                this.row = 5;
                this.y = this.row * 83 + 51;
            }
        }
    };

    //--------------------------------------------------------------
    this.render = function () {
        if (this.teleFrames > 0) {
            ctx.globalAlpha = Math.abs(40 - this.teleFrames) / 10;
            //player transparency increase for first 20 teleporting changes, and decrease for next 20
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            ctx.globalAlpha = 1;
        } else
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    //--------------------------------------------------------------
    this.handleInput = function (key) {
        if (this.teleFrames === 0) //lose input when is in teleporting state
        {
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
    }
    //--------------------------------------------------------------
    this.left = function () {
        return this.x + 17;
    }
    //--------------------------------------------------------------
    this.right = function () {
        return this.x + 84;
    }
    //--------------------------------------------------------------
    this.startTeleporting = function (frames) {
        this.teleFrames = frames;
        //first half of 'frames' to get transparent on the same place
        // next half of 'frames' to appear on the starting position

    }
    //--------------------------------------------------------------
    this.checkCollision = function (enemy) {

        if (enemy.row === this.row) //if they are on the same row
        {
            if ((enemy.nextRight() - this.left()) >= 0 && enemy.left() < this.left()) {
                this.collision = true;
                if (enemy.stayTime === 0) {
                    Sounds[2].play();
                    enemy.stop(42);
                    this.startTeleporting(80);
                    Sounds[3].currentTime = 0;
                    Sounds[3].play();
                }
            }
        }
    }
};


let allEnemies = [],
    player = new Player();

const numberOfEnemies = 6;
for (let i = 0; i < numberOfEnemies; i++) {
    // I use a different x position for every enemy to prevent
    // them starting to move overlapped
    let enemy = new Enemy(i);
    enemy.randomRow();
    allEnemies.push(enemy);
}
//create sounds objects to be played after some events
const soundFileNames = ["sounds/ay-caramba.wav",
        "sounds/bug-crash.ogg",
        "sounds/kiss.ogg",
        "sounds/magic.ogg",
        "sounds/swipe.ogg",
        "sounds/telekinesis.ogg",
    ],

    Sounds = [];

soundFileNames.forEach(function (file) {
    Sounds.push(new Audio(file));
});
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