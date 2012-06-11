var mplayer = require('./mplayer');

var song2 = '/home/darren/Music/+44/When Your Heart Stops Beating/03 When Your Heart Stops Beating.m4a';
var song1 = '/home/darren/Music/Avicii/Levels - EP/01 Levels (Radio Edit).m4a';

var queue = [];
queue.push(song2);
queue.push(song1);        

mplayer.play(queue.shift());


mplayer.getEventEmitter(function(eventEmitter) {
	eventEmitter.on('playerExited', function(message){
    	if(queue.length !== 0) {
    		mplayer.play(queue.shift());
    	}
	});
});

