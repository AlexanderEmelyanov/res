var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({port: 8080});

//var RealTimeEventServer = require('./res').RealTimeEventServer;

var RealTimeEventServer = require('./res').RealTimeEventServer;
var res = new RealTimeEventServer(server);