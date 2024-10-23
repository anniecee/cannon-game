function startGame() {
    myGameArea.start();
}

// Create a canvas element and append it to the document
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    
        window.addEventListener('resize', function() {
            myGameArea.canvas.width = window.innerWidth;
            myGameArea.canvas.height = window.innerHeight;
        });
    }
}
