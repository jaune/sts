var engine = require('engine.io');
var Lobby = require('./server/Lobby.js');
var Client = require('./server/Client.js');
var simulation = require('./simulation.js')();

module.exports = function (httpServer) {

    var engineServer = engine.attach(httpServer);

    var lobby = new Lobby(simulation);

    engineServer.on('connection', function (socket) {

        var client = new Client(socket);

        console.log(socket.id + ': join');
        lobby.onClientJoin(client);

        socket.on('message', function (data) {
            var message = JSON.parse(data);
            var action = message.shift();

            switch (action) {
                case 'commands':
                    if (!client.hasCommand()) {

                        lobby.onClientCommands(client, message.shift());
                    } else {
                        console.log('error: too many commands');
                    }
                    break;
            }
        });

        socket.on('close', function () {
            console.log(socket.id + ': leave');
            lobby.onClientLeave(socket.id);
        });

    });


    return engineServer;
};