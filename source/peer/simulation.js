var Simulation = require('./common/Simulation.js');

var simulation = new Simulation({
    tickDuration: 16,
    tickFunction: function (frame) {
        var speedX = 2,
            speedY = 2;

        Object.keys(this.subjects).forEach(function (subjectId) {
            var subject = this.subjects[subjectId];

            var deltaX = subject.destinationX - subject.positionX;
            var deltaY = subject.destinationY - subject.positionY;


            var length = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
            if (length == 0) {
                return;
            }

            subject.positionX += (deltaX / length) * speedX;
            subject.positionY += (deltaY / length) * speedY;

            // subject.positionX = Math.round(subject.positionX);
            // subject.positionY = Math.round(subject.positionY);
        }, this);
    },
    actions: {
        goto: function (subjectId, x, y) {
            this.subjects[subjectId].destinationX = x;
            this.subjects[subjectId].destinationY = y;
        },
        createSubject: function (subjectId, x, y) {
            this.subjects[subjectId] = {
                id: subjectId,
                positionX: x,
                positionY: y,
                destinationX: x,
                destinationY: y
            };
        },
        destroySubject: function (subjectId) {
            delete this.subjects[subjectId];
        }
    },
    data: {
        subjects: {
        }
    }
});

module.exports = function () {
    return simulation;
};