/**
 *
 * @param simulation
 * @constructor
 */
var Lobby = function (simulation) {
    this.lastStepTime = null;

    this.maxStepTimeout = null;

    this.clients = {};
    this.commands = [];

    this.simulation = simulation;

    this.state = Lobby.STATE_NONE;
};

Lobby.TIME_MAX_STEP = 1500;
Lobby.TIME_MIN_STEP = 150;
Lobby.FRAME_DURATION = 32;


Lobby.STATE_NONE = 0x00;
Lobby.STATE_WAIT_COMMAND = 0x01;
Lobby.STATE_RUN_SIMULATION = 0x02;


Lobby.prototype.beginSimulation = function () {
    this.isRunning = true;
    this.lastStepTime = Date.now();

    this.stepSimulation();
};

Lobby.prototype.forEachClient = function (cb, scope) {
    Object.keys(this.clients).forEach(function (key) {
        cb.call(scope, this.clients[key]);
    }, this);
};


Lobby.prototype.flushCommands = function () {
    var commands = this.flushClientsCommands();

    while (this.commands.length > 0) {
        commands.push(this.commands.shift());
    }

    return commands;
};


Lobby.prototype.flushClientsCommands = function () {
    var commands = [], cc, c;

    this.forEachClient(function (clt) {
        cc = clt.flushCommands();
        while (cc && (cc.length > 0)) {
            c = cc.shift();
            c.unshift(clt.socket.id);
            commands.push(c);
        }
    });

    return commands;
};

Lobby.prototype.testClientsCommands = function () {
    var test = true;

    this.forEachClient(function (client) {
        test = test && client.hasCommand();
    });

    return test;
};





Lobby.prototype.tryBeginSimulation = function () {
    if (this.state === Lobby.STATE_NONE) {
        this.beginSimulation();
    }
};

Lobby.prototype.trySuspendSimulation = function () {
    //TODO this.suspendSimulation();
};

Lobby.prototype.send = function () {
    var data = JSON.stringify(Array.prototype.slice.call(arguments, 0));

    this.forEachClient(function (c) {
        c.socket.send(data);
    });
};


/**
 * @public
 */
Lobby.prototype.onClientCommands = function (client, commands) {
    if (this.state !== Lobby.STATE_WAIT_COMMAND) {
        console.log('Commands ????');
        return;
    }

    client.pushCommands(commands);

    if (!this.testClientsCommands()) {
        return;
    }
    this.stepSimulation();
};

Lobby.prototype.onStepTimeout = function () {
    if (this.state !== Lobby.STATE_WAIT_COMMAND) {
        return;
    }
    this.stepSimulation();
};



Lobby.prototype.stepSimulation = function () {
    this.state = Lobby.STATE_RUN_SIMULATION;

    clearTimeout(this.maxStepTimeout);

    var now = Date.now();
    var elapsedTime = now - this.lastStepTime;

    if (elapsedTime < Lobby.TIME_MIN_STEP) {
        setTimeout(this.stepSimulation.bind(this), Lobby.TIME_MIN_STEP - elapsedTime);
        return;
    }

    var simulation = this.simulation,
        commands = this.flushCommands();

    var elapsedTick = Math.round(elapsedTime / simulation.tickDuration);

    this.lastStepTime = now;

    simulation.nextTicks(elapsedTick);

    this.send('step', this.simulation._currentTick, elapsedTick, commands);

    commands.forEach(function (c) {
        c.shift(); // client id
        simulation.pushCommand.apply(simulation, c);
    });

    simulation.nextTick();

    this.state = Lobby.STATE_WAIT_COMMAND;
    this.maxStepTimeout = setTimeout(this.onStepTimeout.bind(this), Lobby.TIME_MAX_STEP);
};



/**
 * @public
 */
Lobby.prototype.onClientLeave = function (clientID) {

    var client = this.clients[clientID];

    this.forEachClient(function (c) {
        if ((c !== client) && client.socket) {
            c.send('leave', clientID);
        }
    });

    if (this.clients.hasOwnProperty(clientID)) {
        delete this.clients[clientID];
    }

    this.commands.push(['server', 'destroySubject', clientID]);

    this.trySuspendSimulation();
};

/**
 * @public
 */
Lobby.prototype.onClientJoin = function (client) {

    client.send('snapshot', this.simulation._currentTick, JSON.stringify(this.simulation._currentData));

    this.send('join', client.socket.id);
    this.clients[client.socket.id] = client;

    this.tryBeginSimulation();

};

module.exports = Lobby;