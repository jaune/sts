var Node = function (x, y, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.parent = null;

    this.isOpen = false;
    this.isClose = false;

    this.h = h || 0;
    this.g = 0;
    this.f = 0;
};

Node.prototype.setGScore = function (g) {
    this.g = g;
    this.f = this.h + this.g;
};

module.exports = Node;