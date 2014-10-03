function RealTimeEventServer(webSocketServer){

    // Simple “RealTimeEventServer” instantiation
    if(!( this instanceof RealTimeEventServer )){
        console.log('Simple “RealTimeEventServer” instantiation');
        return new RealTimeEventServer(webSocketServer)
    }

    var self = this;

    self.webSocketServer = webSocketServer;

    self.greetingMessage = {type: 'message', data: {text: 'Welcome to Real-time Events Server'}};

    self.connections = {};

    self.connectionsCounter = 0;

    /**
     * Accept connections
     * @param connection
     */
    self.onConnect = function(connection){
        connection.id = self.connectionsCounter++;
        var connectionId = connection.id;
        self.connections[connectionId] = connection;
        console.log('Connection #' + connectionId + ' accepted.');
        self.sendMessage(connectionId, self.greetingMessage);
        return connectionId;
    };

    /**
     * Process all incoming messages
     * @param connectionId
     * @param message
     */
    self.onMessage = function (connectionId, message, flags, buffer){
        console.log('Connection #' + connectionId + ' message received', message);
    };

    /**
     *
     * @param connectionId
     * @param message
     */
    self.sendMessage = function(connectionId, message){
        var connection = self.connections[connectionId];
        connection.send(JSON.stringify(self.greetingMessage));
    };

    /**
     * Internal method, called for WebSocketServer connections closing handling.
     * @param connectionId
     */
    self.onDisconnect = function(connectionId){
        delete self.connections[connectionId];
        console.log('Connection #' + connectionId + ' closed');
    };

    /**
     * Init server and assign event's handlers
     */
    this.init = function(){

        self.startedAd = (new Date());

        self.webSocketServer.on('connection', function(connection) {

            var connectionId = self.onConnect(connection);

            connection.on('message', function(message, flags, buffer){
                self.onMessage(connectionId, message, flags, buffer);
            });

            connection.on('close', function(){
                self.onDisconnect(connectionId);
            });
        });

        console.log('Initialization ended successfully');

    };

    this.info = function(){
        return 'Real-time Event Server started at: ' + self.startedAd + '\r\nAccepted connections: ' + (self.connectionsCounter);
    };

    this.init();

    return this;

}

exports.RealTimeEventServer = RealTimeEventServer;
