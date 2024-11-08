function startGame() {
    score = 0;
    livesLeft = 5; // Initialize lives left
    gameOver = false; // Initialize game over flag

    hitHandled = false; // Flag to prevent multiple hit handling
    missHandled = false; // Flag to prevent multiple miss handling


    explosionSound = new Audio('explosion.m4a'); // Preload the explosion sound
    explosionSound.load(); // Ensure the audio file is loaded
    
    shotSound = new Audio('shot.m4a'); // Preload the shot sound
    shotSound.load(); // Ensure the audio file is loaded

    function checkCollision() {
        if (myCannonball && myFuGoBalloon) {
            const balloonWidth = 120;
            const balloonHeight = balloonWidth * (myFuGoBalloon.image.height / myFuGoBalloon.image.width);
            const cannonballWidth = 40;
            const cannonballHeight = cannonballWidth * (myCannonball.image.height / myCannonball.image.width);

            if (
                myCannonball.x < myFuGoBalloon.x + balloonWidth &&
                myCannonball.x + cannonballWidth > myFuGoBalloon.x &&
                myCannonball.y < myFuGoBalloon.y + balloonHeight &&
                myCannonball.y + cannonballHeight > myFuGoBalloon.y
            ) {
                if (!hitHandled) {
                    handleHit();
                    hitHandled = true; // Set the flag to true to prevent multiple handling
                }
            } else {
                hitHandled = false; // Reset the flag if no hit
            }
        }
        // Check if the balloon reaches the bottom of the screen
        if (myFuGoBalloon && myFuGoBalloon.y + 250 >= myGameArea.canvas.height) {
            if (!missHandled) {
                handleMiss();
                missHandled = true; // Set the flag to true to prevent multiple handling
            }
        } else {
            missHandled = false; // Reset the flag if no miss
        }
    }

    function handleHit() {
        explosionSound.currentTime = 0; // Play the sound on top of the existing sound to allow for multiple sounds to play simultaneously
        explosionSound.play();
        const explosionImage = new Image();
        explosionImage.src = 'img/explosion.gif';
        explosionImage.onload = () => {
            const ctx = myGameArea.context;
            const aspectRatio = explosionImage.height / explosionImage.width;
            const width = 400;
            const height = width * aspectRatio;
            ctx.drawImage(explosionImage, myFuGoBalloon.x - 100, myFuGoBalloon.y, width, height);

            // Create a new balloon and reset the cannonball
            myFuGoBalloon = createFuGoBalloon();
            myCannonball = null;
            score += 1;
            updateStatusDisplay();
        };
    }

    function handleMiss() {
        explosionSound.currentTime = 0;
        explosionSound.play();
        const explosionImage = new Image();
        explosionImage.src = 'img/explosion.gif';
        explosionImage.onload = () => {
            const ctx = myGameArea.context;
            const aspectRatio = explosionImage.height / explosionImage.width;
            const width = 400;
            const height = width * aspectRatio;
            ctx.drawImage(explosionImage, myFuGoBalloon.x - 100, myFuGoBalloon.y, width, height);
    
            // Create a new balloon and reset the cannonball
            myFuGoBalloon = createFuGoBalloon();
            myCannonball = null;
            livesLeft -= 1;
            updateStatusDisplay();
            if (livesLeft <= 0) {
                gameOver = true; // Set the game over flag
                updateStatusDisplay(); // Update the status display to show "Game Over"
            }
        };
    }

    myGameArea.update = function() {
        if (!gameOver) {
            myGameArea.clear();
            myGamePiece.update();
            if (myCannonball) {
                myCannonball.update();
            }
            if (myFuGoBalloon) {
                myFuGoBalloon.update();
            }
            checkCollision();
        }
    };

    myGameArea.start();
    myGamePiece = new component(); // Initialize the game piece (sprite)
    myCannonball = null; // Initialize cannonball as null
    createSpeedSlider(); // Create the speed slider
    createStatusDisplay(); // Create the status display
    myFuGoBalloon = createFuGoBalloon();  // Initialize the Fu-Go balloon
}

// Create a Fu-Go balloon component
function createFuGoBalloon() {
    const balloon = {
        // 420 is subtracted from the canvas width to ensure that the generated x coordinate does not place
        // the object too close to the right edge of the canvas. This might be to prevent the object from 
        // being partially off-screen or to maintain a certain margin.
        // 300 is added to ensure that the object is not placed too close to the left edge of the canvas.
        x: Math.random() * (myGameArea.canvas.width - 420) + 300,
        y: 0,
        speed: 2,
        image: new Image(),

        // Update the balloon position and handle out of bounds
        update: function() {
            this.y += this.speed;
            // Create a new balloon if it goes out of bounds
            if (this.y > myGameArea.canvas.height) {
                this.y = 0;
                this.x = Math.random() * (myGameArea.canvas.width - 420) + 300;
            }
            this.redraw();
        },
        redraw: function() {
            const ctx = myGameArea.context;
            const aspectRatio = this.image.height / this.image.width;
            const width = 120; // Set the width of the balloon
            const height = width * aspectRatio;
            ctx.drawImage(this.image, this.x, this.y, width, height);
        }
    };
    balloon.image.src = 'img/FuGo.png';
    return balloon;
}

// Create a canvas element and append it to the document
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(this.update.bind(this), 20); // Update the game area every 20ms
    
        // Handle window resizing
        window.addEventListener('resize', () => {
            const widthRatio = window.innerWidth / this.canvas.width;
            const heightRatio = window.innerHeight / this.canvas.height;

            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Handle the resizing logic
            myGamePiece.handleResize(widthRatio, heightRatio);
        });

        // Handle key presses
        window.addEventListener('keydown', (e) => {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        });

        window.addEventListener('keyup', (e) => {
            myGameArea.keys[e.keyCode] = false;
        });

        myFuGoBalloon = createFuGoBalloon(); // Initialize the Fu-Go balloon
        this.interval = setInterval(() => this.update(), 20); // Update the game area every 20ms
    },
    update: function() {
        myGameArea.clear();
        myGamePiece.update();
        if (myCannonball) {
            myCannonball.update();
        }
        if (myFuGoBalloon) {
            myFuGoBalloon.update();
        }
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component() {
    this.x = 0;
    this.y = 0;
    this.speed = 2; // Default speed

    // Set initial position (bottom-left)
    this.updatePosition = function() {
        this.x = 0; // Set to left edge of the screen
        this.y = myGameArea.canvas.height - 150; // Set to bottom of the canvas, assuming sprite height is 100
    };

    this.updatePosition(); // Initialize the position

    // Array for sprite images (layers)
    this.images = [
        { src: 'img/Carriage.png', width: 200, x: this.x, y: this.y, image: new Image() },
        { src: 'img/Turret.png', width: 250, x: this.x, y: this.y - 40, image: new Image(), angle: 0 },
        { src: 'img/Wheel.png', width: 120, x: this.x + 80, y: this.y - 40, image: new Image(), angle: 0 }
    ];

    // Load images and draw them once loaded
    this.images.forEach((layer) => {
        layer.image.src = layer.src;
        layer.image.onload = () => {
            this.redraw();
        };
    });

    // Handle resize and adjust the sprite position
    this.handleResize = (widthRatio, heightRatio) => {
        // Calculate new x and y positions based on ratios
        this.x *= widthRatio;
        this.y *= heightRatio;

        // Update positions of each image layer (Carriage, Turret, Wheel)
        this.images[0].x = this.x;                   // Carriage
        this.images[0].y = myGameArea.canvas.height - 150; // Adjust to remain at bottom
        this.images[1].x = this.x;                   // Turret
        this.images[1].y = this.images[0].y - 40;    // Position relative to Carriage
        this.images[2].x = this.x + 80;              // Wheel
        this.images[2].y = this.images[0].y - 40;    // Position relative to Carriage

        this.redraw(); // Redraw the sprite with the updated position
    };

    // Update the turret angle and sprite position based on key presses
    this.update = () => {
        const moveSpeed = this.speed * 2; // Multiply the speed by 2 pixels

        if (myGameArea.keys && myGameArea.keys[37]) { 
            this.x -= moveSpeed; 
            this.images[2].angle -= moveSpeed; // Rotate wheel anti-clockwise
        } // Left arrow key
        if (myGameArea.keys && myGameArea.keys[39]) { 
            this.x += moveSpeed; 
            this.images[2].angle += moveSpeed; // Rotate wheel clockwise
        } // Right arrow key
        if (myGameArea.keys && myGameArea.keys[38]) { this.images[1].angle -= 1; } // Up arrow key
        if (myGameArea.keys && myGameArea.keys[40]) { this.images[1].angle += 1; } // Down arrow key
        if (myGameArea.keys && myGameArea.keys[32]) { this.fireCannonball(); } // Space key to fire

        // Ensure the sprite stays within the canvas bounds
        if (this.x < 0) { this.x = 0; }
        if (this.x > myGameArea.canvas.width - this.images[1].width - 30) { 
            this.x = myGameArea.canvas.width - this.images[1].width - 30; 
        } // Adjusted to stop a bit away from the right border

        // Restrict the turret angle
        if (this.images[1].angle < -20) { this.images[1].angle = -20; }
        if (this.images[1].angle > 35) { this.images[1].angle = 35; }

        // Update positions of each image layer (Carriage, Turret, Wheel)
        this.images[0].x = this.x;                   // Carriage
        this.images[1].x = this.x;                   // Turret
        this.images[2].x = this.x + 80;              // Wheel

        this.redraw();
    };

    // Fire a cannonball
    this.fireCannonball = () => {
        if (!myCannonball) {
            const turret = this.images[1]; // The turret image layer
            const turretTipOffsetX = (turret.width / 2) * Math.cos(turret.angle * Math.PI / 180); 
            const turretTipOffsetY = (turret.width / 2) * Math.sin(turret.angle * Math.PI / 180);

            // Calculate the position of the cannonball at the tip of the turret
            const cannonballX = turret.x + turret.width / 2 + turretTipOffsetX;
            const cannonballY = turret.y + turretTipOffsetY;

            const angle = turret.angle; // Use the current turret angle
            myCannonball = new cannonball(cannonballX, cannonballY, angle);
            shotSound.play(); // Play the shot sound
        }
    };


    // Redraw the sprite on the canvas
    this.redraw = () => {
        const ctx = myGameArea.context;
        ctx.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height); // Clear the canvas

        // Draw the cannonball first if it exists
        if (myCannonball) {
            myCannonball.redraw();
        }

        // Redraw each layer of the sprite
        this.images.forEach((layer) => {
            const aspectRatio = layer.image.height / layer.image.width;
            const height = layer.width * aspectRatio;
            if (layer.src === 'img/Turret.png') {
                ctx.save();
                ctx.translate(layer.x + layer.width / 2, layer.y + height / 2);
                ctx.rotate(layer.angle * Math.PI / 180);
                ctx.drawImage(layer.image, -layer.width / 2, -height / 2, layer.width, height);
                ctx.restore();
            } else if (layer.src === 'img/Wheel.png') {
                ctx.save();
                ctx.translate(layer.x + layer.width / 2, layer.y + height / 2);
                ctx.rotate(layer.angle * Math.PI / 180);
                ctx.drawImage(layer.image, -layer.width / 2, -height / 2, layer.width, height);
                ctx.restore();
            } else {
                ctx.drawImage(layer.image, layer.x, layer.y, layer.width, height);
            }
        });
    };
}

// Cannonball component
function cannonball(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 10;
    this.image = new Image();
    this.image.src = 'img/cannonball.png';

    this.update = () => {
        this.x += this.speed * Math.cos(this.angle * Math.PI / 180);
        this.y += this.speed * Math.sin(this.angle * Math.PI / 180);

        // Remove the cannonball if it goes out of bounds
        if (this.x > myGameArea.canvas.width || this.y > myGameArea.canvas.height || this.x < 0 || this.y < 0) {
            myCannonball = null;
            shotSound.pause(); // Stop the shot sound
            shotSound.currentTime = 0; // Reset the sound to the beginning
        }

        this.redraw();
    };

    this.redraw = () => {
        const ctx = myGameArea.context;
        const aspectRatio = this.image.height / this.image.width;
        const width = 40;
        const height = width * aspectRatio;
        ctx.drawImage(this.image, this.x, this.y, width, height);
    };
}

// Create the speed slider
function createSpeedSlider() {
    const sliderContainer = document.createElement('div');
    sliderContainer.style.position = 'absolute';
    sliderContainer.style.top = '10px';
    sliderContainer.style.left = '10px';
    sliderContainer.style.zIndex = '1000';
    sliderContainer.style.backgroundColor = 'white';
    sliderContainer.style.padding = '10px';
    sliderContainer.style.border = '1px solid black';

    const sliderLabel = document.createElement('label');
    sliderLabel.innerText = 'Cannon Moving Speed: ';
    sliderContainer.appendChild(sliderLabel);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = '2';
    sliderContainer.appendChild(slider);

    document.body.appendChild(sliderContainer);

    slider.addEventListener('input', (e) => {
        myGamePiece.speed = parseInt(e.target.value);
    });
}

// Update the score and lives display
function updateStatusDisplay() {
    document.getElementById('score').textContent = 'Score: ' + score;
    if (gameOver) {
        document.getElementById('lives').textContent = 'Game Over';
    } else {
        document.getElementById('lives').textContent = 'Lives Left: ' + livesLeft;
    }
}

startGame(); // Start the game