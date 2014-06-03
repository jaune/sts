/**
 * @class Simulation
 * @param options
 * @constructor
 */
var Simulation = function (options) {
    this._maxFrame = 0;
    this._commands = {};

    this.tickDuration = options.tickDuration || 16;
    this._tickFunction = options.tickFunction || function () {};

    this._actions = options.actions || {};

    this._snapshotTick = 0;
    this._snapshotData = JSON.stringify(options.data || {});

    this._currentTick = 0;
    this._currentData = JSON.parse(this._snapshotData);
};

/**
 *
 * @param {int} frame
 * @param {string} snapshotData
 */
Simulation.prototype.loadSnapshot = function (frame, snapshotData) {
    this._snapshotTick = frame;
    this._snapshotData = snapshotData;

    this.rollbackToSnapshot();
};

/**
 *
 * @public
 */
Simulation.prototype.rollbackToSnapshot = function () {
    this._currentTick = this._snapshotTick;
    this._currentData = JSON.parse(this._snapshotData);
};


Simulation.prototype.rollbackToTick = function (tick) {
    if (tick < this._snapshotTick) {
        return false;
    }
    this.rollbackToSnapshot();
    this.nextTicks(tick - this._currentTick);

    return true;
};

/**
 *
 * @public
 */
Simulation.prototype.snapshot = function () {
    this._snapshotTick = this._currentTick;
    this._snapshotData = JSON.stringify(this._currentData );
};


/**
 *
 * @private
 */
Simulation.prototype._runCommands = function () {
    if (!this._commands.hasOwnProperty(this._currentTick)) {
        return;
    }

    var commands = this._commands[this._currentTick],
        i = 0,
        l = commands.length,
        action = null,
        command = null;

    for (; i < l; i++) {
        command = commands[i].slice(0);
        action = command.shift();

        if (this._actions.hasOwnProperty(action)) {
            this._actions[action].apply(this._currentData, command);
        } else {
            console.error('Missing action '+action);
        }
    }
};



/**
 * @public
 */
Simulation.prototype.pushCommand  = function (/* command, arguments... */) {
    var parameters = Array.prototype.slice.call(arguments, 0);
    var frame = this._currentTick;
    if (!this._commands.hasOwnProperty(frame)) {
        this._commands[frame] = [];
    }
    this._commands[frame].push(parameters);
};


/**
 * @public
 * @param {int} elapsedTick
 */
Simulation.prototype.nextTicks  = function (elapsedTick) {
    var i;

    for (i = 0; i < elapsedTick; i++) {
        this.nextTick();
    }
};

/**
 * @public
 */
Simulation.prototype.nextTick  = function () {
    this._runCommands();

    this._tickFunction.call(this._currentData, this._currentTick);

    this._currentTick++;
    this._maxFrame = Math.max(this._currentTick, this._maxFrame);
};


module.exports = Simulation;