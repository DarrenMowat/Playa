var child = require('child_process');
var path = require('path');
var log = require('./log');

var events = require('events');
var eventEmitter = new events.EventEmitter();

var mplayer;
var paused = false;


var play = function(song) {
	if(song == undefined) return;
	if(mplayer == undefined) {
		mplayer = child.spawn('mplayer', ['-slave', '-quiet', song]);
		paused = false;
		setupEmitters(mplayer);
	} else {
		mplayer.stdin.write('loadfile \'' + song + '\'\n');
		paused = false;
	}
}

var pause = function() {
	if(mplayer != undefined && !paused) {
		mplayer.stdin.write('pause\n');
		paused = true;
	}
}

var unpause = function() {
	if(mplayer != undefined && paused) {
		mplayer.stdin.write('pause\n');
		paused = false;
	}
}

var stop = function() {
	if(mplayer != undefined) {
		mplayer.kill(0);
		mplayer = undefined;
	}
}


var setupEmitters = function(proc) {
	// Event Emitters

	proc.stdout.on('data', function (data) {
	  log.debug('MPlayer stdout: ' + data);
	});

	proc.stderr.on('data', function (data) {
	  log.debug('MPlayer stderr: ' + data);
	});

	proc.on('exit', function (code) {
	  log.debug('child process exited with code ' + code);
	  mplayer = undefined;
	  eventEmitter.emit('playerExited', 'playerExited');
	});
}

exports.getEventEmitter = function(callback){
  callback(eventEmitter);
};


exports.play = play;
exports.pause = pause;
exports.unpause = unpause;
exports.stop = stop;