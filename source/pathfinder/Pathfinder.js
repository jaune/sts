var Node = require('./Node.js');

var Pathfinder = function () {
    this.grid = null;

    this.heap = [];

    this.nodes = {};

    this.endX = 0;
    this.endY = 0;

};

Pathfinder.prototype.processNeighbour = function (currentNode, neighbourX, neighbourY) {
    var neighbour;
    var neighbourG = currentNode.g + 10;

    if (this.grid.isOpen(neighbourX, neighbourY) && !this.inCloseList(neighbourX, neighbourY)) {
        neighbour = this.getNode(neighbourX, neighbourY);
        if (!neighbour.isOpen) {
            neighbour.isOpen = true;
            neighbour.parent = currentNode;
            neighbour.setGScore(neighbourG);
            this.heap.push(neighbour);
            this.sortHeap();
        } else {
            if (neighbour.g < neighbourG) {
                neighbour.parent = currentNode;
                neighbour.setGScore(neighbourG);
                this.sortHeap();
            }
        }
    }
};

Pathfinder.prototype.find = function (grid, startX, startY, endX, endY) {
    this.grid = grid;

    this.endX = endX;
    this.endY = endY;

    var startNode = new Node();
    startNode.x = startX;
    startNode.y = startY;

    this.heap.push(startNode);

    var iteration = 0;

    while ((this.heap.length > 0) && (iteration < 100)) {
        var currentNode = this.heap.pop();
        var currentX = currentNode.x;
        var currentY = currentNode.y;

        if ((currentNode.x == endX) && (currentNode.y == endY)) {
            return this.createPath(currentNode);
        }

        currentNode.isOpen = false;
        currentNode.isClose = true;

        this.processNeighbour(currentNode, currentX, currentY + 1);
        this.processNeighbour(currentNode, currentX + 1, currentY);
        this.processNeighbour(currentNode, currentX, currentY - 1);
        this.processNeighbour(currentNode, currentX - 1, currentY);

        iteration++;
    }

    return null;
};

Pathfinder.prototype.sortHeap = function () {
    this.heap.sort(function (a, b) {
        return a.f < b.f;
    });
};


Pathfinder.prototype.inCloseList = function (x, y) {
    return this.hasNode(x, y) && this.getNode(x, y).isClose;
};

Pathfinder.prototype.hasNode = function (x, y) {
    var k = x + '|' + y;

    return this.nodes.hasOwnProperty(k);
};


Pathfinder.prototype.getNode = function (x, y) {
    var k = x+'|'+ y;

    if (!this.nodes.hasOwnProperty(k)) {
        this.nodes[k] = new Node(
            x, y,
                10 * (Math.abs(x - this.endX) + Math.abs(y - this.endY))
        );
    }

    return this.nodes[k];
};

Pathfinder.prototype.createPath = function (node) {
    var path = [],
        n = node;

    while (n) {
        path.unshift({
            x: n.x,
            y: n.y
        });

        n = n.parent;
    }

    return path;
};

module.exports = Pathfinder;