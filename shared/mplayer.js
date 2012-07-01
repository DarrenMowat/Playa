var MPlayer = exports;

var child = require('child_process');
var path = require('path');
var log = require('./log');

var events = require('events');
var eventEmitter = new events.EventEmitter();

var mplayer;
var paused = false;

var forcefullyStopped = false;


MPlayer.play = function(song) {
	if(song == undefined) return;
	if(mplayer == undefined) {
		// mplayer = child.spawn('mplayer', ['-slave', '-quiet', song.replace(/(^')|('$)/g, "")]);
		log.info('Spawning new MPlayer process to play ' + song);
		mplayer = child.spawn('mplayer', ['-slave', song.replace(/(^')|('$)/g, "")]);
		paused = false;
		forcefullyStopped = false;
		setupEmitters(mplayer);
	} else {
		log.info('Telling current MPlayer process to play ' + song);
		mplayer.stdin.write('loadfile \'' + song + '\'\n');
		paused = false;
	}
}

MPlayer.pause = function() {
	if(mplayer != undefined && !paused) {
		mplayer.stdin.write('pause\n');
		paused = true;
	}
}

MPlayer.unpause = function() {
	if(mplayer != undefined && paused) {
		mplayer.stdin.write('pause\n');
		paused = false;
	}
}

MPlayer.stop = function() {
	if(mplayer != undefined) {
		forcefullyStopped = true;
		mplayer.kill();
		mplayer = undefined;
	}
}

MPlayer.isRunning = function() {
	return mplayer != undefined 
}

MPlayer.isPaused = function() {
	return paused;
}

MPlayer.getEventEmitter = function(callback){
  callback(eventEmitter);
};

function  setupEmitters(proc) {
	// Event Emitters

	proc.stdout.on('data', function (data) {
	  log.print('MPlayer: ' + data);
	});

	proc.stderr.on('data', function (data) {
	  log.print('MPlayer Error: ' + data);
	});

	proc.on('exit', function (code) {
	  log.print('MPlayer process exited with code ' + code);
	  mplayer = undefined;
	  if(!forcefullyStopped) {
	  	// Only notify listeners if the player exited itself
	  	// If we stopped it via stop() don't
	  	eventEmitter.emit('playerExited', 'playerExited');
	  }
	});
}
