var requestAnimationFrame =
    global.requestAnimationFrame ||
    global.webkitRequestAnimationFrame ||
    global.mozRequestAnimationFrame ||
    global.oRequestAnimationFrame ||
    global.msRequestAnimationFrame ||
    function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
        global.setTimeout(callback, 1000 / 60);
    };

module.exports = requestAnimationFrame;

