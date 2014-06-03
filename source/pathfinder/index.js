var Gird = require('./BasicGrid.js');
var Pathfinder = require('./Pathfinder.js');



var grid = new Gird(50, 50);

grid.close(5, 5);
grid.close(5, 6);
grid.close(5, 7);
grid.close(6, 5);
grid.close(7, 5);


var startX = 3,
    startY = 3;

var endX = 15,
    endY = 15;


var pathfinder = new Pathfinder();

var path = pathfinder.find(grid, startX, startY, endX, endY);


var cellW = 10, cellH = 10;


var elCanvas = document.createElement('CANVAS');
var cxCanvas = elCanvas.getContext('2d');

var x, y,
    gridW = grid.width * cellW, gridH = grid.height * cellH,
    xl = gridW / cellW, yl = gridH / cellH;

elCanvas.setAttribute('width', gridW);
elCanvas.setAttribute('height', gridH);


for (x = 0; x < xl; x++) {
    for (y = 0; y < yl; y++) {

        if (grid.isClose(x, y)) {
            cxCanvas.fillStyle = '#000000';
            cxCanvas.fillRect(x * cellW, y * cellH, cellW, cellH);
        }

    }
}


if (path) {
    cxCanvas.strokeStyle = '#FF00FF';
    cxCanvas.beginPath();
    cxCanvas.moveTo((startX * cellW) + (cellW / 2), (startY * cellH) + (cellH / 2));

    var i, n, l = path.length;
    for (i = 1; i < l; i++) {
        n = path[i];
        cxCanvas.lineTo((n.x * cellW) + (cellW / 2), (n.y * cellH) + (cellH / 2));
    }
    cxCanvas.stroke();
}

// draw start/end

cxCanvas.fillStyle = '#00FF00';
cxCanvas.fillRect(startX * cellW, startY * cellH, cellW, cellH);

cxCanvas.fillStyle = '#FF0000';
cxCanvas.fillRect(endX * cellW, endY * cellH, cellW, cellH);

// draw path


document.querySelector('body').appendChild(elCanvas);

