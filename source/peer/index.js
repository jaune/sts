/** @type {Simulation} */
var simulation = require('./simulation.js')();
var requestAnimationFrame = require('../shim/requestAnimationFrame.js');

var commands = [
];

var socket = require('engine.io-client')('ws://'+document.location.host);

socket.on('open', function () {

    var x = Math.floor((Math.random() * (500 - 5)) + 5);
    var y = Math.floor((Math.random() * (500 - 5)) + 5);

    socket.on('message', function (data) {
        var message = JSON.parse(data);
        var action = message.shift();

//        console.debug(data);

        switch (action) {
            case 'snapshot':
                simulation.loadSnapshot.apply(simulation, message); // frame, data
                commands.push(['createSubject', socket.id, x, y]);
                break;

            case 'step':
                controlledSubjectId = socket.id;

                var serverCurrentTick = message.shift();
                var elapsedTick = message.shift();
                var clientsCommands = message.shift();

                if (serverCurrentTick > simulation._currentTick) {
                    simulation.nextTicks(serverCurrentTick - simulation._currentTick);
                } if (serverCurrentTick < simulation._currentTick) {
                    console.log('rollbackToTick '+serverCurrentTick );
                    if (!simulation.rollbackToTick(serverCurrentTick)){
                        console.error('rollbackToTick '+serverCurrentTick+' fail.');
                    }
                } else {
                }

                clientsCommands.forEach(function (c) {
                    c.shift(); // client id
                    simulation.pushCommand.apply(simulation, c);
                });

                simulation.nextTick();

                simulation.snapshot();

                socket.send(JSON.stringify(['commands', commands]));
                commands = [];
                break;
        }
    });

    socket.on('close', function () {
        console.error('connection lost.');
    });
});

var Subject = function (id, x, y) {
    this.id = id;

    var hue = 120;

    this.destinationCircle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 2,
        fill: 'hsl(' + hue + ', 100%, 65%)'
    });

    this.subjectCircle = new Kinetic.Circle({
        x: x,
        y: y,
        radius: 5,
        fill: 'hsl(' + hue + ', 100%, 35%)'
    });
};

Subject.prototype.setHue = function (hue) {
    this.subjectCircle.fill('hsl(' + hue + ', 100%, 35%)');
    this.destinationCircle.fill('hsl(' + hue + ', 100%, 65%)');

    return this;
};

Subject.prototype.setPosition = function (x, y) {
    var c = this.subjectCircle;
    c.x(x);
    c.y(y);

    return this;
};

Subject.prototype.setDestination = function (x, y) {
    var c = this.destinationCircle;
    c.x(x);
    c.y(y);

    return this;
};

Subject.prototype.destroy = function () {
    this.subjectCircle.destroy();
    this.destinationCircle.destroy();
};


var subjects = {};


var stage = new Kinetic.Stage({
    container: 'kinetic-container',
    width: 500,
    height: 500
});

var layer = new Kinetic.Layer();
var controlledSubjectId = null;

var frameText = new Kinetic.Text({
    x: 0,
    y: 0,
    text: '-f',
    fontSize: 12,
    fontFamily: 'Arial',
    fill: 'green'
});


layer.add(frameText);

stage.add(layer);

stage.on('contentClick', function (event) {
    if (!controlledSubjectId || !subjects.hasOwnProperty(controlledSubjectId)) {
        return;
    }

    var x = event.evt.layerX,
        y = event.evt.layerY;

    subjects[controlledSubjectId].setDestination(x, y);

    commands.push(['goto', controlledSubjectId, x, y]);
});


function doAnimationFrame() {
    simulation.nextTick();

    var ss = simulation._currentData.subjects;

    Object.keys(ss).forEach(function (subjectId) {
        var s = ss[subjectId];

        if (!subjects.hasOwnProperty(subjectId)) {
            var sub = new Subject(subjectId, s.positionX, s.positionX);

            subjects[subjectId] = sub;
            layer.add(sub.destinationCircle);
            layer.add(sub.subjectCircle);
        }
        subjects[subjectId]
            .setPosition(s.positionX, s.positionY)
            .setDestination(s.destinationX, s.destinationY);
    });

    Object.keys(subjects).forEach(function (subjectId) {
        if (!ss.hasOwnProperty(subjectId)) {
            subjects[subjectId].destroy();
            delete subjects[subjectId];
        }
    });


    frameText.text(simulation._currentTick);

    layer.draw();

    requestAnimationFrame(doAnimationFrame);
}

requestAnimationFrame(doAnimationFrame);



