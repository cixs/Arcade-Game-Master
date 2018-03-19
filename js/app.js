// Enemies our player must avoid
let Enemy = function() {
    // variables applied to each of our instances go here,
    // we"ve provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we"ve provided to easily load images
    this.sprite = "images/enemy-bug.png";

    //horizontal position (X axe)
    this.x = 1;
    this.y;

    this.setNewTrack = function() {
        //there are 3 tracks for enemies, choose randomly one
        //a track is 83px witdh
        //the starting point for Y coordinate is rigth bellow the water row
        this.y = 142 + (Math.floor((Math.random() * 10)) % 3)*83
        }
    //velocity is a multiplier of dt
    //I want enemies to get randomly one of 4 different speeds
    this.velocity = Math.random()*500 +100;
    
};

// Update the enemy"s position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.velocity*dt;
    if(this.x > 1010){
        this.x = -101;
        this.setNewTrack();
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

let allEnemies = [],
    player = {
        sprite: "images/char-boy.png.png",
        //horizontal position (X axe)
        pX: 2*101,
        //vertical position (Y axe)
        pY: 5*83,
        update: function(dt){},
        render: function(){
            ctx.drawImage(Resources.get(this.sprite), this.pX, this.pY);
        },
        handleInput: function(){}
    };

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don"t need to modify this.
document.addEventListener("keyup", function(e) {
    let allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
