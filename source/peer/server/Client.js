
var Client = function (socket) {
    this.socket = socket;
    this.currentFrame = 0;
    this.currentCommands = null;
    this.isReady = false;
};

Client.prototype.send = function () {
    this.socket.send(JSON.stringify(Array.prototype.slice.call(arguments, 0)));
};


Client.prototype.pushCommands = function (commands) {
    this.currentCommands = commands;
};

Client.prototype.flushCommands = function () {
    var commands = this.currentCommands;

    this.currentCommands = null;

    return commands;
};

Client.prototype.hasCommand = function () {
    return !!this.currentCommands;
};

module.exports = Client;