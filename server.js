var WebSocketServer = require('ws').Server;

var Server = new WebSocketServer({port: 8080});

var greetingMessage = {type: 'message', data: {text: 'Welcome to Real-time Events Server'}};

Server.on('connection', function(ws) {
    console.log('New connection');
    ws.on('message', function(message, flags, buffer) {
        try{
            var event = JSON.parse(message);
            if (event.type == 'message'){
                ws.send(JSON.stringify({type: 'message', data: {text: 'You say: "' + event.data.text + '"'}}));
            }
        } catch (e){
            console.log('Message JSON format is broker: ' + e.message);
        }
    });
    ws.send(JSON.stringify(greetingMessage));
});