var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({port: 8080});

//var RealTimeEventServer = require('./res').RealTimeEventServer;

var RealTimeEventServer = require('./res').RealTimeEventServer;
var res = new RealTimeEventServer(server);

/*

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
    */

