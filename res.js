var inspect = require('util').inspect;
var dbClient = require('mariasql');

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

    self.supportedRoles = ['user'];

    self.dbClient = new dbClient();

    /**
     * Accept connections
     * @param connection
     */
    self.onConnect = function(connection){
        connection.id = self.connectionsCounter++;
        connection.roles = {};
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
        console.log('System message from connection [' + connectionId + ']. Event: ', event);
        /* Example event for AUTH command
        {
            type: 'system',
            data: { command: 'auth',
                params: [ 'auth', 'user', 'reskator', '05a6f1ce941eda5e62d2834efb873db319d488b2' ]
            }
        }
        */
        switch(event.data.command){
            case 'info':{
                self.sendMessage(connectionId, {type: 'message', data:{text:self.info()}});
                break;
            }
            case 'auth': {
                if (event.data.params.length < 3){
                    // @TODO error handling must be implemented...
                    return;
                }
                var login = event.data.params[1]
                    , authKey = event.data.params[2];
                // self.assignRole(connectionId, role);
                self.startAuth(connectionId, login, authKey, function(){});
                break;
            }
            case 'st': {
                var roles = self.getRoles(connectionId);
                var message = 'Your roles: [' + roles.join(', ') + ']';
                self.sendMessage(connectionId, {type: 'message', data:{text:message}});
                break;
            }
            default: {
                // @TODO error handling must be implemented...
                return;
            }
        }
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

        self.loadConfiguration();

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

    self.loadConfiguration = function(){
        var cmnConfig = require('./config/common.js');
        var envConfig = require('./config/' + self.environment + '.js');
        var locConfig = require('./config/local.js');
        var cloner = require('cloneextend');
        self.config = cloner.cloneextend(cmnConfig, envConfig);
        self.config = cloner.cloneextend(self.config, locConfig);
        console.log(self.config);
    };

    /**************************************************************************
     * Roles management methods ***********************************************
     **************************************************************************/

    /**
     * Assign specified role to connection
     * @param connectionId
     * @param role
     */
    self.assignRole = function(connectionId, role){
        if (typeof self.connections[connectionId] == 'undefined'){
            console.log('ERROR: Role assignment failed, required connection ID [' + connectionId + '] not found. May be connection closed...');
        }
        self.connections[connectionId]['roles'][role] = 1;
        console.log('INFO: Role [' + role + '] assigned connection [' + connectionId + ']');
    };

    /**
     * Revoke specified role from connection
     * @param connectionId
     * @param role
     */
    self.revokeRole = function(connectionId, role){
        if (typeof self.connections[connectionId] == 'undefined'){
            console.log('ERROR: Role revoking failed, required connection ID [' + connectionId + '] not found. May be connection closed...');
        }
        delete self.connections[connectionId]['roles'][role];
        console.log('Role [' + role + '] revoked from connection [' + connectionId + ']');
    };

    /**
     * Return array with connection assigned roles
     * @param connectionId int
     * @return Array
     */
    self.getRoles = function (connectionId){
        var roles = [];
        for(var role in self.connections[connectionId]['roles']){
            roles.push(role);
        }
        return roles;
    };

    self.startAuth = function(connectionId, login, authKey, callback){
        console.log('Start authentication for connection [' + connectionId + '] with credentials: [' + login + '/' + authKey + ']');
        var sql = 'SELECT * FROM foxcams.user WHERE username = \'' + login + '\' AND auth_key = \'' + authKey + '\'';
        console.log('SQL: [' + sql + ']');

        self.dbClient.connect({
            host: self.config.db.host,
            user: self.config.db.user,
            password: self.config.db.pass
        });

        self.dbClient.on('connect', function() {
            console.log('DB client connected');
        }).on('error', function(err) {
            console.log('DB client error: ' + err);
        }).on('close', function(hadError) {
            console.log('DB client closed');
        });

        self.dbClient.query(sql)
            .on('result', function(res) {
                res.on('row', function(row) {
                    console.log('Result row: ' + inspect(row));
                })
                    .on('error', function(err) {
                        console.log('Result error: ' + inspect(err));
                    })
                    .on('end', function(info) {
                        console.log('Result finished successfully');
                    });
            })
            .on('end', function() {
                console.log('Done with all results');
            });

        self.dbClient.end();
    };

    return self.init();

}

exports.RealTimeEventServer = RealTimeEventServer;
