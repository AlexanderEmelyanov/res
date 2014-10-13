/**
 * Class Roomer
 *
 * Real-time Events Server components - channels manager "Roomer"
 * Used for RES methods:
 * 1. Create channel.
 *
 * 2. Subscribe user to all messages of specified channel.
 * 3. Send message from user to channel.
 *
 * @returns {Roomer}
 * @constructor
 */

function Roomer() {

    // Simple “Roomer” instantiation
    if(!( this instanceof Roomer )){
        console.log('Simple “Roomer” instantiation');
        return new Roomer()
    }

    var self = this;

    self.rooms = {};

    /**
     * Create channel with specified owner
     * @param channelName
     * @param owner
     */
    self.createChannel = function (channelName, owner){
        if (channelName in self.rooms){
            throw new Error('Channel [' + channelName + '] already exist');
        }
        self.rooms[channelName] = {
            name: channelName,
            owner: channelName,
            subscribers: {}
        };
    };

    /**
     * Return channels list as ['Channel name 1', 'Channel name 2', etc...]
     */
    self.getChannelsList = function(){
        var channels = [];
        for(var channelName in self.rooms){
            channels.push(channelName);
        }
        return channels;
    };

    /**
     * Subscribe specified connection to channel
     * @param channelName string
     * @param connectionId int
     */
    self.subscribe = function(channelName, connectionId){
        if (!(channelName in self.rooms)){
            throw new Error('Channel [' + channelName + '] not found, subscribe is impossible');
        }
        self.rooms[channelName].subscribers[connectionId] = 1;
    };

    /**
     * Subscribe specified connection to channel
     * @param channelName string
     * @param connectionId int
     */
    self.unsubscribe = function(channelName, connectionId){
        if (!(channelName in self.rooms)){
            throw new Error('Channel [' + channelName + '] not found, subscribe is impossible');
        }
        if (!(connectionId in self.rooms[channelName].subscribers)){
            throw new Error('User [' + connectionId + '] not subscribed, unsubscribe not required');
        }
        delete self.rooms[channelName].subscribers[connectionId];
    };

    /**
     * Send message to channel. Will be delivered for all channel subscribers
     * @param channelName
     * @param message object
     * @param callback function
     */
    self.sendMessage = function(channelName, message, callback){
        if (!(channelName in self.rooms)){
            throw new Error('Channel [' + channelName + '] not found, message sending failed');
        }
        for (var connectionId in self.rooms[channelName].subscribers){
            callback(connectionId, message);
        }
    };

    return this;

}


module.exports = Roomer;