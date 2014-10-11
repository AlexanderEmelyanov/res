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
     * @param name
     * @param owner
     */
    self.createChannel = function (name, owner){
        if (name in self.rooms){
            throw new Error('Channel with name[' + name + '] already exist');
        }
        self.rooms[name] = {
            name: name,
            owner: owner
        };
    };

    /**
     * Return channels objects
     */
    self.getChannelsList = function(){
        var channels = [];
        for(var channel in self.rooms){
            channels.push(channel);
        }
        return channels;
    };

    return this;

}


exports.Roomer = new Roomer();