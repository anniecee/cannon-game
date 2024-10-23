function startGame() {
    myGameArea.start();
    myGamePiece = new component();
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
            myGameArea.canvas.width = window.innerWidth;
            myGameArea.canvas.height = window.innerHeight;

            // Handle the resizing logic
            myGamePiece.handleResize();
        });
    }
}

function component() {
    this.originalWidth = window.innerWidth;
    this.originalHeight = window.innerHeight;

    // Set initial position (bottom-left)
    this.updatePosition = function() {
        this.x = 0; // Set to left edge of the screen
        this.y = myGameArea.canvas.height - 12  0; // Set to bottom of the canvas, assuming sprite height is 100
    };

    this.updatePosition(); // Initialize the position

    this.initialX = this.x;
    this.initialY = this.y;

    // Array for sprite images (layers)
    this.images = [
        { src: 'img/Carriage.png', width: 200, x: this.x, y: this.y, image: new Image() },
        { src: 'img/Turret.png', width: 250, x: this.x, y: this.y - 40, image: new Image() },
        { src: 'img/Wheel.png', width: 120, x: this.x + 80, y: this.y - 40, image: new Image() }
    ];

    // Load images and draw them once loaded
    this.images.forEach((layer) => {
        layer.image.src = layer.src;
        layer.image.onload = () => {
            this.redraw();
        };
    });

    // Handle resize and adjust the sprite position
    this.handleResize = () => {
        const widthRatio = window.innerWidth / this.originalWidth;
        const heightRatio = window.innerHeight / this.originalHeight;

        // Calculate new x and y positions based on ratios
        this.x = this.initialX * widthRatio;
        this.y = this.initialY * heightRatio;

        // Update positions of each image layer (Carriage, Turret, Wheel)
        this.images[0].x = this.x;                   // Carriage
        this.images[0].y = myGameArea.canvas.height - 120; // Adjust to remain at bottom
        this.images[1].x = this.x;                   // Turret
        this.images[1].y = this.images[0].y - 40;    // Position relative to Carriage
        this.images[2].x = this.x + 80;              // Wheel
        this.images[2].y = this.images[0].y - 40;    // Position relative to Carriage

        // Store new canvas size as the original size for future reference
        this.originalWidth = window.innerWidth;
        this.originalHeight = window.innerHeight;

        this.redraw(); // Redraw the sprite with the updated position
    };

    // Redraw the sprite on the canvas
    this.redraw = () => {
        const ctx = myGameArea.context;
        ctx.clearRect(0, 0, myGameArea.canvas.width, myGameArea.canvas.height); // Clear the canvas

        // Redraw each layer of the sprite
        this.images.forEach((layer) => {
            const aspectRatio = layer.image.height / layer.image.width;
            const height = layer.width * aspectRatio;
            ctx.drawImage(layer.image, layer.x, layer.y, layer.width, height);
        });
    };
}
