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
        try{
            var event = JSON.parse(message);
            switch(event.type){
                case 'message': {
                    self.sendMessage(connectionId, {type: 'message', data: {text: 'You say: "' + event.data.text + '"'}});
                    break;
                }
                case 'system': {
                    console.log('Start system message processing');
                    self.processSystemMessage(connectionId, event);
                    break;
                }
                default: {
                    console.log('Unknown message type: ' + event.type);
                }
            }
        } catch (e){
            console.log('Message JSON format is broker: ' + e.message);
        }
    };

    /**
     * @param connectionId Connection ID, which system message received
     * @param event
     */
    self.processSystemMessage = function(connectionId, event){
        //console.log('Send to connection #' + connectionId + ' message:' + self.info());
        self.sendMessage(connectionId, {type: 'message', data:{text:self.info()}});
    };

    /**
     *
     * @param connectionId int
     * @param message Object
     */
    self.sendMessage = function(connectionId, message){
        var connection = self.connections[connectionId];
        connection.send(JSON.stringify(message));
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

        self.detectEnvironment();

        console.log('Initialization ended successfully');

        return self;

    };

    self.info = function(){
        return 'Real-time Event Server started at: ' + self.startedAd + '\r\nAccepted connections: ' + (self.connectionsCounter);
    };

    /**
     * Detect server environment
     */
    self.detectEnvironment = function(){
        if (typeof process.env.NODE_ENV == 'undefined'){
            console.log('Process environment undefined.');
            self.environment = 'development';
        } else {
            self.environment = process.env.NODE_ENV;
        }
        console.log('Real-time Event Server environment for running: [' + self.environment + ']');
    };

    return self.init();

}

exports.RealTimeEventServer = RealTimeEventServer;
