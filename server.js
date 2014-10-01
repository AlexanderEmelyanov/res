var WebSocketServer = require('ws').Server;

var Server = new WebSocketServer({port: 8080});

var greetingMessage = {type: 'system', data: {text: 'Welcome to Real-time Events Server'}};

Server.on('connection', function(ws) {
    console.log('New connection');
    ws.on('message', function(message, flags, buffer) {
        console.log(message);
    });
    ws.send(JSON.stringify(greetingMessage));
});