var MPlayer = exports;

var child = require('child_process');
var path = require('path');
var log = require('./log');

var S = require('string');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var mplayer;
var paused = false;

var forcefullyStopped = false;

var volume = 0;


MPlayer.play = function(song) {
	if(song == undefined) return;
	// Tidy the song up
	song = song.replace(/(^')|('$)/g, "");
	song = song + "";
	if(mplayer == undefined) {
		// mplayer = child.spawn('mplayer', ['-slave', '-quiet', song.replace(/(^')|('$)/g, "")]);
		log.info('Spawning new MPlayer process to play ' + song);
		mplayer = child.spawn("mplayer", ["-slave", "-quiet", song]);
		paused = false;
		forcefullyStopped = false;
		setupEmitters(mplayer);
		if(volume > 0) {
			log.info('Setting volume to ' + volume);
			mplayer.stdin.write("set_property volume " + volume + "\n");
		}
	} else {
		log.info('Telling current MPlayer process to play ' + song);
		MPlayer.pause();
		// Trying to stop audible pop during song switchover
		setTimeout(function() {
			mplayer.stdin.write("loadfile \"" + song + "\"\n");
			paused = false;
			if(volume > 0) {
				log.info('Setting volume to ' + volume);
				mplayer.stdin.write("set_property volume " + volume + "\n");
			}
		}, 100);
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

MPlayer.getVolume = function() {
	if(mplayer != undefined) {
		mplayer.stdin.write("get_property volume\n");
	}
}

MPlayer.incVolume = function() {
	if(mplayer != undefined) {
		mplayer.stdin.write("volume 0.5\n");
		setTimeout(MPlayer.getVolume, 1000);
	}
}

MPlayer.decVolume = function() {
	if(mplayer != undefined) {
		mplayer.stdin.write("volume -0.5\n");
		setTimeout(MPlayer.getVolume, 1000);
	}
}

// in 1s do get_property volume - store this and use it to spawn new mplayer processes

MPlayer.getEventEmitter = function(callback){
  callback(eventEmitter);
};

function  setupEmitters(proc) {
	// Event Emitters

	proc.stdout.on('data', function (data) {
		var sout = S(data.toString()).trim().s;
		if(S(sout).contains("ANS_volume=")) {
			volume = S(sout).replaceAll("ANS_volume=", "").s;
		} else {
			log.print('MPlayer: ' + data);
		}
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
