var http = require('http');
var send = require('send');
var port = 80;

console.log('Starting static web server in "'+__dirname+'" on port '+port+'.');

var app = http.createServer(function(req, res){
    send(req, req.url)
        .root(__dirname)
        .pipe(res);
}).listen(port);