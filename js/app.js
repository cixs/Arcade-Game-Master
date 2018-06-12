// Enemies our player must avoid
 'use strict'
//**********************************************************
let Enemy = function (i) {
    //**********************************************************
    // variables applied to each of our instances go here,
    // we"ve provided one for you to get started
    //--------------------------------------------------------------
    this.init = function () {
        // The image/sprite for our enemies, this uses
        // a helper we"ve provided to easily load images
        this.sprite = "images/enemy-bug.png";

        // horizontal position (x axe)
        this.x = 707;
        // vertical position (y axe)
        this.y = 0;
        this.xIncrement = 0;

        // velocity is a multiplier of dt
        //it will change every time is entering the canvas
        this.velocity = 0.6 + Math.random();
        this.velocityKeeper = this.velocity; // need to remember actual velocity before being stopped
        this.id = i; // used as an identifier of this object inside checkCollision function
        // to step over checking collision with itself in the for loop
        this.kindOf = "bug";
        this.stayTime = 0; //when is greater than 0, this enemy stop moving

        // added this chain' variable lately to manage when a collision splash must be painted
        // it was necessary because when a snail enemy is pushing the others, we could say
        // that there is a permanent collision state
        // consequently, the collision splash was permanently painted and that was looking ugly
    }
    //----------------------------------------------------------
    this.setKindOf = function () {
        // once in 24 appearances  is a snail
        let x = Math.floor((Math.random() * 1000)) % 24;
        if ((x === 0 && this.kindOf === "snail") || (x > 0 && this.kindOf === "bug"))
            return; //nothing to change
        else {
            x === 0 ? this.kindOf = "snail" : this.kindOf = "bug";
            if (this.kindOf === "snail") {
                this.sprite = "images/enemy-snail.png";
                this.chain = "pushing";
            } else
                this.sprite = "images/enemy-bug.png";
            this.chain = "free";
        }
    }

    // bellow: three functions used to check collisions
    //--------------------------------------------------------------
    this.right = function () {
        let ret = this.x + 99;
        if (this.kindOf === "snail")
            ret += 45; //the snail is wider
        return ret;
    }

    //--------------------------------------------------------------
    this.nextRight = function () {
        // this is where the right side it will be on the next frame
        // and is used to check if there is an imminent collision
        let ret = this.x + 99 + this.xIncrement;
        if (this.kindOf === "snail")
            ret += 40; //the snail is wider
        return ret;
    }

    //--------------------------------------------------------------
    this.left = function () {
        return this.x + 1;
    }

    //--------------------------------------------------------------
    this.randomRow = function () {
        // there are 3 rows for enemies, randomly choose one
        // a row is 83px height
        // the starting point for Y coordinate is right bellow the water
        this.row = Math.floor((Math.random() * 1000)) % 3 + 1;
        this.y = 84 + (this.row - 1) * 83;
    }

    //--------------------------------------------------------------
    this.restartMovingFromLeft = function () {
        //--------------------------------------------------------------
        this.setKindOf();
        this.randomRow();
        // here we've got a row for this enemy
        // next, we have to set its x position
        // an enemy start to move outside the canvas, x coordinate is less than -101 pixels
        // also it needs to avoid put and start 2 or more enemies in the same place
        // so, we are looking for an empty range of 101 pixel on the track containing this.y coordinate 

        const width = 102; // width of an enemy + 1
        let xPos = -101; // position to be found for <this> enemy
        // xPos it will be at least 101 pixels left of the most left enemy.x found on this track

        for (let i = 0; i < allEnemies.length; i++) {
            if (this.id === allEnemies[i].id)
                continue; // this enemy is the one we are looking for a new position
            //check if one of these enemies is on the same track
            else {
                if (this.y === allEnemies[i].y) { //found an enemy on this track
                    xPos = Math.min(xPos, allEnemies[i].x - width);
                }
            }
        }
        this.x = xPos - 101; // -101 to have a gap between them

        // 3.36pixels/frame is the chosen animation speed of an enemy
        // but we will add some random variations for every enemy
        // for this purpose I use the velocity variable  to  multiply the previous calculated pixels/frame = 0.316*dt
        if (this.kindOf === "bug")
            this.velocity = 0.9 * Math.random() + 0.5;
        // this.velocity gets values from 0.5 to 1.5
        else {
            this.velocity = 2; // snails are moving faster and always the same speed
            if (bSounds) {
                // this sound clip is much longer than others used on this game
                // so I want it to be played distinct for every snail
                // for this purpose, I am using the 'new' operator to create a sound obcject
                const jetSound = new Audio("sounds/jet-engine.ogg")
                jetSound.play();
            }
        }
        this.velocityKeeper = this.velocity;
        this.chain = "free";
    }
    //-----------------------------------------
    this.stop = function (numberOfFrames) {
        this.velocity = 0;
        this.stayTime = numberOfFrames;
    }
};

//------------------------------------------------------------------
Enemy.prototype.update = function (dt = 16 /*default value*/ ) {
    //--------------------------------------------------------------
    // Update the enemy"s position, required method for game
    // Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    //
    // I think the proper speed of an enemy would be 303px/sec (or 3 columns/sec.)
    // or 5.05px/dt or 0.316px/milisec.
    // knowing this fraction, whenever the denominator -dt- is changing, we have to change the numerator
    // in order to preserve the same value (speed) of animation. On this purpose, I'll use the rule of three:
    // 0.316 = px/dt --> px = 0.316*dt; if dt increase (slow speed for whatever reason) then also px increase 
    // px being the number of pixels an enemy is passing in a single frame animation

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
    // if yes, the set the x position out of the canvas, on the left side
    if (this.x > 707) {
        this.restartMovingFromLeft();
    }
};

//--------------------------------------------------------------
Enemy.prototype.render = function () {
    //--------------------------------------------------------------
    // Draw the enemy on the screen, required method for game
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//--------------------------------------------------------------
Enemy.prototype.checkCollision = function (enemy) {
    //--------------------------------------------------------------
    //check if parameter enemy collided with this
    //if yes, change some stuffs here
    if (this.row === enemy.row)
    //if they are on the the same track 
    //and if this enemy wasn't previously stopped behind the one in front
    {
        let a = null, //it will be the enemy coming faster from behind
            b = null; // it will be enemy in front, slower
        if (this.velocity >= enemy.velocity) {
            a = this;
            b = enemy
        } else if (this.velocity < enemy.velocity) {
            a = enemy;
            b = this;
        }

        if ((a.nextRight() - b.left(0)) >= 0 && a.left() < b.right()) {
            //here is a collision
            let stateChanged = true;

            if (b.stayTime > 0) { //the enemy beyond was stoped
                if (a.stayTime > 0) // both enemy are stopped, nothing to change
                    stateChanged = false;
                a.stop(b.stayTime); //stop this too (if it was moving) or keep it stopped if it was stopped
            }

            if (stateChanged) { //if enemies are moving with different speeds
                if (a.chain === "free") {
                    splash.setToBeDraw(a.right() - 15, a.y + 15);
                } // draw collision splash in front of the left one
                if (a.kindOf === "bug") //if the faster enemy is a bug
                {
                    // check if is free or pushed by a snail or other pushed bug
                    if (a.chain === "pushed") {
                        b.velocity = a.velocity; // the right bug take the same speed as the left bug
                        b.chain = "pushed";

                    } else {
                        // change velocity of both enemies
                        // the one behind slow down
                        // the one in front accelerate
                        let v = a.velocity;
                        a.velocity = b.velocity;
                        b.velocity = v;
                        if (a.right() > 0 && b.left() < 707) //play sounds only if they are inside the canvas
                            if (bSounds)
                                Sounds[0].play();
                    }
                } else { // a.kindOf != "bug",  the faster enemy is a snail
                    //does not exchange velocity, but the bug is pushed forward by the snail
                    b.velocity = a.velocity; // the bug take the same speed as the snail
                    b.chain = "pushed";
                    a.chain = "pushing";
                }
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

//**********************************************************
let Player = function (char) {
    //*********************************************************
    this.sprite = "images/char-boy.png";
    //--------------------------------------------------------------
    this.init = function () {
        this.x = 3 * 101;
        this.y = 5 * 83;
        this.row = 5; //
        this.teleFrames = 0;
        this.lives = 5;
        this.points = 0;
    };
    this.setImage = function (image) {
        this.sprite = image;
    }
    //--------------------------------------------------------------
    this.update = function () {
        if (this.teleFrames > 0) // started from 80 inside startTeleporting function,
        { // and trigered after a collision with enemy
            this.teleFrames -= 1;
            // on the first 40 cycles of teleporting, player is in the same location
            // and have it's transparency decreasing until he became completely invisible
            // then the player move to the initial location and on the next 40 cicles 
            // his opacity is increasing from 0 to 100%
            if (this.teleFrames === 40) { // is at the middle of teleporting state?
                this.x = 3 * 101; // player jump to the initial position
                this.row = 5;
                this.y = this.row * 83;
            }
        }
    };

    //--------------------------------------------------------------
    this.render = function () {
        if (this.teleFrames > 0) {
            ctx.globalAlpha = Math.abs(40 - this.teleFrames) / 40;
            //player transparency increase for first 40 teleporting changes, and decrease for next 40
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 10);
            ctx.globalAlpha = 1;
        } else
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 10);
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
                            this.y = this.row * 83; // jump to the upper row
                        }
                        break;
                    }
                case (39): //right
                    {
                        if (this.x < 606) // hold the player inside the canvas
                            this.x += 101; // jump to the right column
                        break;
                    }
                case (40): //down
                    {
                        if (this.row < 5) // hold the player over the bottom edge of the canvas
                        {
                            this.row++; // jump to the bottom row
                            this.y = this.row * 83; // jump to the bottom row
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
    this.top = function () {
        return this.y + 17;
    }
    //--------------------------------------------------------------
    this.bottom = function () {
        return this.y + 84;
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
                if (enemy.stayTime === 0) {
                    enemy.stop(42);
                    this.startTeleporting(80);
                    if (bSounds) {
                        Sounds[4].play();
                        Sounds[2].currentTime = 0;
                        Sounds[2].play();
                    }
                    this.lives -= 1;
                    let sLives = this.lives > 1 ? " lives " : " life ";
                    document.getElementById("lives").innerText = this.lives + sLives + "left";
                    if (this.lives === 0)
                        gameFinished();

                }
            }
        }
    }
};

//**********************************************************
let Items = function () {
    //********************************************************** 
    //---------------------------------------------------------------------
    this.init = function () {
        this.waiting = 0;
        this.onRemoveFrames = 0;
        this.putOnCanvas();
    }
    //---------------------------------------------------------------------
    this.putOnCanvas = function () {
        // this function chose random an image, next
        //the row and column to display on canvas
        // next, the display time;
        // to gain points, the player is urged to collect the item during this time
        this.setImage();
        this.x = ((Math.floor(Math.random() * 1000)) % 7) * 101 + 25; // one of the 7 columns, 101px wide

        // chose arandom row from the 3 stoned rows
        this.y = ((Math.floor(Math.random() * 1000)) % 3 + 1) * 83 + 15;
        //chose display time randomly
        this.displayTime = ((Math.floor(Math.random() * 1000) % 3) + 1) * 150; //frames or (1, 2, 3 or 4) * 10sec.
    };
    //---------------------------------------------------------------------
    this.setImage = function () {
        let img = [
            "images/gem-blue.png",
            "images/gem-green.png",
            "images/gem-orange.png",
            "images/ke-key.png",
            "images/st-star.png",
        ];
        let randomImage = ((Math.floor(Math.random() * 1000)) % 5);
        this.sprite = img[randomImage];
        this.value = (1 + randomImage) * 100;
    };
    //---------------------------------------------------------------------
    this.setWaiting = function () {
        //set this.waiting time randomly from 10 to 40 sec.
        // on this time it will be not displayed on canvas
        this.waiting = ((Math.floor(Math.random() * 1000)) % 4 + 1) * 150; //frames or (1, 2, 3 or 4) * 2.5sec.
    };
    //---------------------------------------------------------------------
    this.left = function () {
        return this.x;
    };
    //---------------------------------------------------------------------
    this.right = function () {
        return this.x + 50; // 50 is the image width of every collectible item
    };

    //---------------------------------------------------------------------
    this.render = function () {
        if (this.displayTime > 0) { // 
            if (this.displayTime < 61) { // last second of displayTime
                ctx.globalAlpha = 1 - ((60 - this.displayTime) / 60); // show fading 
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
                ctx.globalAlpha = 1;
            } else {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
        }
    };

    //---------------------------------------------------------------------
    this.update = function () {
        if (this.waiting > 0) //not showing yet
        {
            this.waiting -= 1;
            if (this.waiting === 0) // waiting time is over, then
                this.putOnCanvas(); // prepare and show on the canvas
        }

        if (this.displayTime > 0) // its'showing
        {
            this.displayTime -= 1; // decrease the counter of showing time       
            if (this.displayTime === 0) // here display time is over
                this.setWaiting(); // set another period to wait until display
        }
    };

    //---------------------------------------------------------------------
    this.removeFromCanvas = function () {
        // called when the player collect this item
        // set displayTime to 0, meaning the player image will mo longer be drawed on canvas
        // also set a new waiting time until it will be drawn again
        this.displayTime = 0;
        this.setWaiting();

    };
    //--------------------------------------------------------------
    this.checkCollision = function () {
        // unlike the collision with an enemy, which can occurs with enemies coming only from left side
        // collision with an item may happen on every of the four sides of the player
        // so we have to check if the item center point is inside the player area

        if (this.displayTime > 0) //check collision only if this gem is visible
        {
            let centerX = this.x + 25,
                centerY = this.y + 25; // 25 is both the item  width and heigth

            if (centerX > player.left() && centerX < player.right() && centerY > player.top() && centerY < player.bottom()) {
                player.points += this.value;
                this.removeFromCanvas();
                this.updateScore()
                if (bSounds)
                    Sounds[1].play();
            }
        };
    };
    //---------------------------------------------------------------------
    this.updateScore = function () {
        //called after the player collect this item points in the score panel
        let listItem, charItem;
        switch (this.value) {
            case (100):
                {
                    listItem = document.getElementById("gem-blue");
                    break;
                }
            case (200):
                {
                    listItem = document.getElementById("gem-green");
                    break;
                }
            case (300):
                {
                    listItem = document.getElementById("gem-orange");
                    break;
                }
            case (400):
                {
                    listItem = document.getElementById("key");
                    break;
                }
            case (500):
                {
                    listItem = document.getElementById("star");
                    break;
                }
            default:
                listItem = null;
        }

        if (listItem) {
            charItem = listItem.innerText;
            let pos = charItem.indexOf("x");
            let previousGems = charItem.substring(0, pos);
            let newString = (parseInt(previousGems, 10) + 1).toString() + charItem.substring(pos, charItem.length);
            listItem.innerText = newString;
        }
        listItem = document.getElementById("points");
        if (listItem)
            listItem.innerText = player.points.toString() + " points";
    };
}
//**********************************************************
let Splash = function () {
    // this object function is to draw a crash splah in front of a bug, when is colliding with another one
    // initially, it was designed to be executed inside the enemy render function
    // but because Enemy.render is called inside a for loop, it happened that the splash image rendered
    // by an enemy was overlapped if there was another enemy to be drawn in the loop
    // so it's better to have this splash function outside and call it at the end of the for loop
    // I should create a splash object for every enemy
    // but it takes only 5 frames to be shown and I assume there won't be 2 splashes to be drawn at the same moment
    // this choice is for performance reasons

    this.init = function () {
        this.x = 1000;
        this.y = 1000;
        this.sprite = "images/crash.png";
        this.frameCounter = 0;
    }
    this.render = function () {
        if (this.frameCounter > 0) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            this.frameCounter -= 1;
        }
    }
    this.setToBeDraw = function (pX, pY) {
        this.frameCounter = 5;
        this.x = pX;
        this.y = pY;
    }
}
//********************************************************** 
//********************global variables*******************************************

let allEnemies = [],
    player = new Player(),
    item = new Items(),
splash = new Splash();

const numberOfEnemies = 8;

for (let i = 0; i < numberOfEnemies; i++) {
    // I use a different x position for every enemy to prevent
    // them starting to move overlapped
    let enemy = new Enemy(i);
    allEnemies.push(enemy);
}
//create sounds objects to be played after events
const soundFileNames = ["sounds/bug-crash.ogg",
    "sounds/collect.ogg",
    "sounds/teleport.ogg",
    "sounds/win.ogg",
    "sounds/ouch.ogg"
];
const Sounds = [];

soundFileNames.forEach(function (file) {
    Sounds.push(new Audio(file));
});

let bSounds = true;

//******************************************************************************* 


//----------------------------------------------------------------
function gameFinished() {
    //--------------------------------------------------------------
    if (bSounds)
        Sounds[3].play();

    //sweetalert2: code from https://sweetalert2.github.io/       
    swal({
        type: "success",
        title: "Good job!",
        text: "Wanna play again?",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes, hurry up!",
        confirmButtonColor: "green",
        cancelButtonColor: "red",
    }).then((result) => {
        if (result.value) {
            swal(
                "Good choice!",
                "Let's proceed then.",
                "success"
            )
            initGame();
        } else {
            swal(
                "Wise!",
                "Now back to work",
                "success"
            )
        }
    })
}
//--------------------------------------------------------------
function initGame() {
    //--------------------------------------------------------------
    //called by reset function of engine when the game is starting
    //or the player chose to play another game
    resetHTML();
    allEnemies.forEach(function (enemy) {
        enemy.init();
    });
    player.init();
    item.init();
    splash.init();
}
//--------------------------------------------------------------
function resetHTML() {
    //--------------------------------------------------------------
    // this function reset the inner text of the score panel list items to the initial values
    // when the player chose to play another game
    let itemValues = document.getElementsByClassName("item-value");
    // skip first 2 list items (player name and sounds setting, they will be unchanged)
    itemValues[2].innerText = "5 lives";
    let i;
    for (i = 3; i < (itemValues.length) - 1; i++)
        itemValues[i].innerText = "0x" + ((i - 2) * 100).toString();

    itemValues[i].innerText = "0 points";
}

//**************************************event listeners************************** 


//--------------------------------------------------------------
document.addEventListener( /*"keyup"*/ "keydown", function (e) {
    //----------------------------------------------------------
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
    // I think keydown works better than keyup
    player.handleInput(e.keyCode);
});

//--------------------------------------------------------------
document.getElementById("player").addEventListener("click", function (e) {
    //--------------------------------------------------------------
    //sweetalert2: code from https://sweetalert2.github.io/

    swal({
        title: "Choose your player character",
        input: "select",
        inputOptions: {
            "BOY": "Boy",
            "CAT": "Cat Girl",
            "HORN": "Horn Girl",
            "PINK": "Pink Girl",
            "PRINCESS": "Princess"
        },
        showCancelButton: true,
        confirmButtonText: "Next",
    }).then((result) => {
        if (result.value) {
            let strPath = "";
            if (result.value === "BOY")
                strPath = "images/char-boy.png";
            else if (result.value === "CAT")
                strPath = "images/char-cat-girl.png";
            else if (result.value === "HORN")
                strPath = "images/char-horn-girl.png";
            else if (result.value === "PINK")
                strPath = "images/char-pink-girl.png";
            else if (result.value === "PRINCESS")
                strPath = "images/char-princess-girl.png";
            this.innerHTML =
                "<img src=" + strPath + " alt='Player image'> <span class='item-value'>player</span>";
            player.setImage(strPath);

            swal({
                title: "Choose your player name",
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Ok",
            }).then((result) => {
                if (result.value) { //the player name was chosen
                    this.childNodes[2].innerText = result.value;
                    swal({
                        type: "success",
                        title: "Cute!",
                    })
                }
            })
        }
    })
});

//--------------------------------------------------------------
document.getElementById("sounds").addEventListener("click", function (e) {
    //--------------------------------------------------------------
    bSounds = !bSounds; // switch play sounds and change consequently the sound icon

    let strState;
    bSounds ? strState = "on" : strState = "off";
    document.getElementById("sounds").innerHTML =
        "<img src='images/sounds-" + strState + ".png' alt='Sounds" + strState + " icon'><span class='item-value'>sounds " + strState + "</span>";

});