(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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


var machine = new Machine();


global.machine = machine;

var interval = null;
var cursorFrame = 0;
var doJetpackAction = false;
var isReplay = false;

function ____playMachine (r) {
    isReplay = r || false;
    if (interval) { return; }
    interval = global.setInterval(function () {
        if (isReplay && machine._maxFrame == machine._currentFrame) {
            ____pauseMachine();
        } else {
            machine.stepForward();
        }
        ____updateMachineUI();
    }, 32);
}

function ____replayMachine () {
    ____playMachine(true);
}

function ____pauseMachine () {
    if (!interval) { return; }
    global.clearInterval(interval);
    ____updateMachineUI();
    interval = null;
}

function ____beginJetpackAction () {
    if (!doJetpackAction) {
        machine.pushCommand('jetpack:begin');
    }
    doJetpackAction = true;
}

function ____endJetpackAction () {
    if (doJetpackAction) {
        machine.pushCommand('jetpack:end');
    }
    doJetpackAction = false;
}

function ____updateMachineUI () {
    var bars = document.querySelector('.machine-ui .bars');
    var cursor = document.querySelector('.machine-ui .bars .cursor');
    var current = document.querySelector('.machine-ui .bars .current');
    var info = document.querySelector('.machine-ui .info');

    var w = (bars.clientWidth - 5) / machine._maxFrame;

    cursor.style['width'] = '5px';
    cursor.style['marginLeft'] = ( w * cursorFrame)  + 'px';

    current.style['width'] = '5px';
    current.style['marginLeft'] = ( w * machine._currentFrame)  + 'px';

    info.innerHTML = '['+cursorFrame+'] '+machine._currentFrame + ' / ' + machine._maxFrame;
}

global.____updateMachineUI = ____updateMachineUI;

____updateMachineUI();

window.addEventListener('keydown', function (event) {
    ____beginJetpackAction();
}, false);

window.addEventListener('keyup', function (event) {
    ____endJetpackAction();
}, false);

window.addEventListener('blur', function (event) {
    ____endJetpackAction();
    ____pauseMachine();
}, false);


document.querySelector('.machine-ui .control.play').addEventListener('click', function (event) {
    ____playMachine();
}, false);

document.querySelector('.machine-ui .control.play').addEventListener('click', function (event) {
    ____playMachine();
}, false);

document.querySelector('.machine-ui .control.replay').addEventListener('click', function (event) {
    ____replayMachine();
}, false);




document.querySelector('.machine-ui .control.pause').addEventListener('click', function (event) {
    ____pauseMachine();
}, false);

document.querySelector('.machine-ui .control.step').addEventListener('click', function (event) {
    machine.stepForward();
    ____updateMachineUI();
}, false);

document.querySelector('.machine-ui .control.jumpTo').addEventListener('click', function (event) {
    machine.jumpTo(cursorFrame);
    ____updateMachineUI();
}, false);

document.querySelector('.machine-ui .bars').addEventListener('click', function (event) {
    cursorFrame = Math.floor(event.clientX / (this.clientWidth / (machine._maxFrame + 1)));

    var html = '';

    machine.getCommandsAt(cursorFrame).forEach(function (command) {
        html += command.join(' ') + '\n';
    });

    document.querySelector('.machine-ui .commands').innerHTML = html;

    ____updateMachineUI();
});

(function () {

    var stage = new Kinetic.Stage({
        container: 'kinetic-container',
        width: 150,
        height: 500
    });

    var layer = new Kinetic.Layer();

    var jetpackGroup = new Kinetic.Group({
        x: 50,
        y: 400
    });

    var jetpack = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        fill: '#f0f',
        stroke: 'none',
        strokeWidth: 0
    });
    jetpackGroup.add(jetpack);

    var flameGroup = new Kinetic.Group({
    });

    var flame0 = new Kinetic.Rect({
        x: (50 / 2) - (16 / 2),
        y: 50 + 5,
        width: 16,
        height: 8,
        opacity: 0.2,
        fill: 'yellow',
        stroke: 'red',
        strokeWidth: 4
    });
    flameGroup.add(flame0);

    var flame1 = new Kinetic.Rect({
        x: (50 / 2) - (8 / 2),
        y: 50 + 5 + 8 + 6,
        width: 8,
        height: 8,
        fill: 'yellow',
        stroke: 'red',
        strokeWidth: 4
    });
    flameGroup.add(flame1);

    jetpackGroup.add(flameGroup);

    layer.add(jetpackGroup);

    stage.add(layer);

    (new Kinetic.Tween({
        node: flame0,
        opacity: 1,
        duration: 0.8,
        easing: Kinetic.Easings.EaseInOut,
        yoyo: true
    })).play();

    (new Kinetic.Tween({
        node: flame1,
        opacity: 0.2,
        duration: 0.8,
        easing: Kinetic.Easings.EaseInOut,
        yoyo: true
    })).play();

    global.setInterval(function () {
        jetpackGroup.y(400 - machine._currentData.jetpackPosition);
        layer.draw();
    }, 16);
})();







}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);