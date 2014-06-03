var BasicGrid = function (w, h) {
    this.width = w;
    this.height = h;

    var i, l = w * h;

    this.data = new Uint8Array(l);

    for (i = 0; i < l; i++) {
        this.data[i] = 1;
    }
};


BasicGrid.prototype.close = function (x, y) {
    this.data[x + this.width * y] = 0;
};

BasicGrid.prototype.open = function (x, y) {
    this.data[x + this.width * y] = 1;
};

BasicGrid.prototype.getValue = function (x, y) {
    return this.data[x + this.width * y];
};

BasicGrid.prototype.isOpen = function (x, y) {
    return this.getValue(x, y) === 1;
};

BasicGrid.prototype.isClose = function (x, y) {
    return this.getValue(x, y) === 0;
};

module.exports = BasicGrid;