var log = require('./log');
var mplayer = require('./mplayer');

// Store next tracks in a Queue
var queue = [];
// Store prev tracks in a Stack
var stack = [];

var currentSong;

var findAlbumsByArtist = function(artist_id, callback) {

}

var findSongsByArtist = function(artist_id, callback) {
  
}

var findSongsByAlbum = function(album_id, callback) {
  
}




var next = function() {
  if(queue.length != 0) {
    var nextSong = queue.shift();
    stack.push(nextSong);
    mplayer.play(nextSong.path);
    log.info('Now Playing: ' + nextSong.title + ' - ' + nextSong.artist);
    currentSong = nextSong;
  } else {
    log.info('Queue is empty!');
  }
}

var prev = function() {
  if(stack.length != 0) {
    var prevSong = queue.pop();
    queue.unshift(prevSong);
    next();
  } else {
    log.info('Stack is empty!');
  }
}

var unpause = function() {
  mplayer.unpause();
      log.info('Play: ' + currentSong.title + ' - ' + currentSong.artist);
}

var pause = function() { 
  mplayer.pause();
      log.info('Paused: ' + currentSong.title + ' - ' + currentSong.artist);
}


// This Event Emitter notifies us when the mplayer process finishes
// This allows us to begin playing the next song in the Queue
// Or a random song
mplayer.getEventEmitter(function(eventEmitter) {
  eventEmitter.on('playerExited', function(message){
      next();
  });
});


exports.next = next;
exports.prev = prev;
exports.unpause = unpause;
exports.pause = pause;
