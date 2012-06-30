var Vlc = exports;

var child = require('child_process');
var path = require('path');
var log = require('./log');

var events = require('events');
var eventEmitter = new events.EventEmitter();

var vlc;
var paused = false;

var forcefullyStopped = false;


Vlc.play = function(song) {
	if(song == undefined) return;
	if(vlc == undefined) {
		// mplayer = child.spawn('mplayer', ['-slave', song.replace(/(^')|('$)/g, "")]);
		log.info('Spawning new MPlayer process to play ' + song);
		mplayer = child.spawn('mplayer', ['-slave', '-quiet', song.replace(/(^')|('$)/g, "")]);
		paused = false;
		forcefullyStopped = false;
		setupEmitters(mplayer);
	} else {
		log.info('Telling current MPlayer process to play ' + song);
		mplayer.stdin.write('loadfile \'' + song + '\'\n');
		paused = false;
	}
}

Vlc.pause = function() {
	if(mplayer != undefined && !paused) {
		mplayer.stdin.write('pause\n');
		paused = true;
	}
}

Vlc.unpause = function() {
	if(mplayer != undefined && paused) {
		mplayer.stdin.write('pause\n');
		paused = false;
	}
}

Vlc.stop = function() {
	if(mplayer != undefined) {
		forcefullyStopped = true;
		mplayer.kill();
		mplayer = undefined;
	}
}

Vlc.isRunning = function() {
	return mplayer != undefined 
}

Vlc.isPaused = function() {
	return paused;
}

Vlc.getEventEmitter = function(callback){
  callback(eventEmitter);
};

function  setupEmitters(proc) {
	// Event Emitters

	proc.stdout.on('data', function (data) {
	  log.info('MPlayer stdout: ' + data);
	});

	proc.stderr.on('data', function (data) {
	  log.debug('MPlayer stderr: ' + data);
	});

	proc.on('exit', function (code) {
	  log.info('MPlayer process exited with code ' + code);
	  vlc = undefined;
	  if(!forcefullyStopped) {
	  	// Only notify listeners if the player exited itself
	  	// If we stopped it via stop() don't
	  	eventEmitter.emit('playerExited', 'playerExited');
	  }
	});
}
