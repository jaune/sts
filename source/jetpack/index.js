var Machine = require('./Machine.js');

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






