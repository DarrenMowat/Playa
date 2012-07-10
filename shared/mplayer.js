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

var volume = 80;


MPlayer.play = function(song) {
	if(song == undefined) return;
	// Tidy the song up
	var path = song.path.replace(/(^')|('$)/g, "");
	path = S(path).replaceAll('\'', "'").s;
	path = path + "";
	if(mplayer == undefined) {
		// mplayer = child.spawn('mplayer', ['-slave', '-quiet', song.replace(/(^')|('$)/g, "")]);
		// log.info('Spawning new MPlayer process to play ' + song);
		if(volume > 0) {
			mplayer = child.spawn("mplayer", ["-slave", "-quiet", "-volume", volume, path]);
		} else {
			mplayer = child.spawn("mplayer", ["-slave", "-quiet", path]);
		}
		paused = false;
		forcefullyStopped = false;
		setupEmitters(mplayer);
		eventEmitter.emit('playing', !paused);
	} else {
		// log.info('Telling current MPlayer process to play ' + song);
		MPlayer.pause();
		// Trying to stop audible pop during song switchover
		// Might be a kernel module issue on the RPi though
		setTimeout(function() {
			mplayer.stdin.write("loadfile \"" + path + "\"\n");
			paused = false;
			eventEmitter.emit('paused', paused);
			eventEmitter.emit('playing', !paused);
		}, 50);
	}
	log.info("Playing " + song.name + " by " + song.artist_name);
}

MPlayer.pause = function() {
	if(mplayer != undefined && !paused) {
		mplayer.stdin.write('pause\n');
		paused = true;
		eventEmitter.emit('playing', !paused);
	}
}

MPlayer.unpause = function() {
	if(mplayer != undefined && paused) {
		mplayer.stdin.write('pause\n');
		paused = false;
		eventEmitter.emit('playing', !paused);
	}
}

MPlayer.stop = function() {
	if(mplayer != undefined) {
		forcefullyStopped = true;
		mplayer.kill();
		mplayer = undefined;
		paused = false;
		eventEmitter.emit('playing', !paused);
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
		var newVol = (volume + 3) > 100 ? 100 : (volume + 3);
		mplayer.stdin.write("set_property volume " + newVol + " 1");
		setTimeout(MPlayer.getVolume, 1000);
	}
}

MPlayer.decVolume = function() {
	if(mplayer != undefined) {
		var newVol = (volume - 3) > 100 ? 100 : (volume - 3);
		mplayer.stdin.write("set_property volume " + newVol + " 1");
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
			volume = Math.floor(S(sout).replaceAll("ANS_volume=", "").s) + 1;
			log.info('Volume: ' + volume);
		} 
		// else {
		// 	log.print('MPlayer: ' + data);
		// }
	});

	proc.stderr.on('data', function (data) {
	  log.print('MPlayer Error: ' + data);
	});

	proc.on('exit', function (code) {
	  // log.print('MPlayer process exited with code ' + code);
	  mplayer = undefined;
	  if(!forcefullyStopped) {
	  	// Only notify listeners if the player exited itself
	  	// If we stopped it via stop() don't
	  	eventEmitter.emit('playerExited', 'playerExited');
	  }
	});
}
