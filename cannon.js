function startGame() {
    myGameArea.start();
    myGamePiece = new component();
    myCannonball = null; // Initialize cannonball as null
}

// Create a canvas element and append it to the document
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    
        window.addEventListener('resize', () => {
            const widthRatio = window.innerWidth / this.canvas.width;
            const heightRatio = window.innerHeight / this.canvas.height;

            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            // Handle the resizing logic
            myGamePiece.handleResize(widthRatio, heightRatio);
        });

        window.addEventListener('keydown', (e) => {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        });

        window.addEventListener('keyup', (e) => {
            myGameArea.keys[e.keyCode] = false;
        });

        this.interval = setInterval(this.update, 20); // Update the game area every 20ms
    },
    update: function() {
        myGameArea.clear();
        myGamePiece.update();
        if (myCannonball) {
            myCannonball.update();
        }
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component() {
    this.x = 0;
    this.y = 0;

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
        if (myGameArea.keys && myGameArea.keys[37]) { 
            this.x -= 5; 
            this.images[2].angle -= 5; // Rotate wheel anti-clockwise
        } // Left arrow key
        if (myGameArea.keys && myGameArea.keys[39]) { 
            this.x += 5; 
            this.images[2].angle += 5; // Rotate wheel clockwise
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
            const turret = this.images[1];
            const cannonballX = turret.x + turret.width / 2;
            const cannonballY = turret.y;
            const angle = turret.angle;
            myCannonball = new cannonball(cannonballX, cannonballY, angle);
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
