/**
 *
 * @param data
 * @constructor
 */
var Machine = function () {
    this._maxFrame = 0;
    this._commands = {};
//    this._snapshots = {};

    this._actions = {
        'jetpack:begin': function () {
            this.jetpackAcceleration += 8;
        },
        'jetpack:end': function () {
            this.jetpackAcceleration += -8;
        }
    };

    this._initialData = JSON.stringify({
        jetpackAcceleration: -3,
        jetpackVelocity: 0,
        jetpackPosition: 0
    });

    this._currentFrame = 0;
    this._currentData = JSON.parse(this._initialData);
};

/**
 *
 * @private
 */
Machine.prototype._rollback = function () {
    this._currentFrame = 0;
    this._currentData = JSON.parse(this._initialData);
};


/**
 *
 * @private
 */
Machine.prototype._runCommands = function () {
    if (!this._commands.hasOwnProperty(this._currentFrame)) {
        return;
    }

    var commands = this._commands[this._currentFrame],
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
 *
 */
Machine.prototype.stepForward  = function () {
    this._runCommands();

    // ----

    var data = this._currentData;

    data.jetpackVelocity += data.jetpackAcceleration;

    if (data.jetpackVelocity > 20) {
        data.jetpackVelocity = 20;
    }
    if (data.jetpackVelocity < -20) {
        data.jetpackVelocity = -20;
    }

    data.jetpackPosition += data.jetpackVelocity;

    if (data.jetpackPosition > 400) {
        data.jetpackPosition = 400;
    }

    if (data.jetpackPosition < 0) {
        data.jetpackPosition = 0;
    }

    // ----

    this._currentFrame++;
    this._maxFrame = Math.max(this._currentFrame, this._maxFrame);
};
/**
 *
 */
Machine.prototype.jumpTo = function (frame) {
    if (frame < 0 || frame > this._maxFrame) {
        console.error('Invalid frame, out of bounds. '+frame+' not in [0..'+this._maxFrame+'].');
        return;
    }
    this._rollback();
    while (this._currentFrame < frame) {
        this.stepForward();
    }
};


/**
 */
Machine.prototype.pushCommand  = function (/* command, arguments... */) {
    var parameters = Array.prototype.slice.call(arguments, 0);
    var frame = this._currentFrame;
    if (!this._commands.hasOwnProperty(frame)) {
        this._commands[frame] = [];
    }
    this._commands[frame].push(parameters);
};


/**
 *
 * @returns {Array}
 */
Machine.prototype.getCommandsAt = function (frame) {
    if (frame < 0 || frame > this._maxFrame) {
        console.error('Invalid frame, out of bounds. '+frame+' not in [0..'+this._maxFrame+'].');
        return [];
    }
    return this._commands[frame] || [];
};


module.exports = Machine;