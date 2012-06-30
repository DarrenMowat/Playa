// Main Playa App

var Playa = exports;

var mplayer = require('./mplayer');
var database = require('./database');
var log = require('./log');

// The socket.io instance is passed in from app.js
var io;

Playa.setSocketIO = function(io_) {
  io = io_;
  io.on('connection', function (socket) {
    // Alert the client of the current queue and now playing
    socket.emit('nowPlaying', nowPlaying);
    socket.emit('queue', queue);
  });
}

// Used to give each queued song a unique id
var q_id = 0;
var queue = []; 
var nowPlaying = {song: undefined, playing: false};


var shouldPlayRandomSong = true;

// Basic Music Player Functions

Playa.index = function(req, res) {
  database.getArtists(function(err, artists) {
    res.render('artists', { title: 'Artists', artists: artists });
  });
}

Playa.artist = function(req, res) {
  var artist_id = req.params.id;
  database.getArtist(artist_id, function(err, artist) {
    database.getAlbumsByArtist(artist_id, function(err, albums) {
     res.render('artist', {title: artist.name, name: artist.name, albums: albums});
    });
  });
}

Playa.album = function(req, res) {
  var album_id = req.params.id;
    database.getAlbumById(album_id, function(err, album) {
      if(err) throw err;
      database.getArtist(album.artist_id, function(err, artist) {
      if(err) throw err;
        database.getSongsByAlbum(album_id, function(err, songs) {
          if(err) throw err;
          res.render('album', {title: album.name, album: album, artist: artist, songs: songs});
        });
      });
    });
    
}

Playa.playMusic = function(req, res){
    if(mplayer.isRunning() && mplayer.isPaused()) {
      mplayer.unpause();
      setNowPlaying(nowPlaying.song, false);
      res.send(200);
      return;
    } else if (queue.length != 0) {
      var next = queue.shift();
      mplayer.play(next.path);
      setNowPlaying(next, false);
      res.send(200);
      return;
    }
    // Can't play music - Queue is empty!
    res.send(500);
};

Playa.pauseMusic = function(req, res){
    if(mplayer.isRunning()) {
      mplayer.pause();
      setNowPlaying(nowPlaying.song, true);
      res.send(200);
      return;
    }
    // Can't pause music - MPlayer isn't running!
    res.send(500);
};

Playa.nextSong = function(req, res){
    if (queue.length != 0) {
      // Kill MPlayer if it is playing
      var next = queue.shift();
      mplayer.play(next.path);
      setNowPlaying(next, false);
      res.send(200);
      return;
    } else if(shouldPlayRandomSong) {
        // Find a random song in the database to play
      database.getRandomSong(function(err, song) {
        if(err) throw err;
        mplayer.play(song.path);
        setNowPlaying(song);
        res.send(200);
        return;
      });
    } else {
      // Can't play music - Queue is empty!
      res.send(500);
    }
};

Playa.stop = function(req, res){
    if(mplayer.isRunning()) {
      mplayer.stop();
      setNowPlaying(undefined, true);
      res.send(200);
      return;
    }
    // Can't pause music - MPlayer isn't running!
    res.send(500);
};

// Queue Managing Functions

Playa.getQueue = function(req, res){
    res.json(queue);
};


Playa.queue = function(req, res){
  res.render('queue', {title: 'Queue');
};

Playa.addSongToQueue = function(req, res){
    var song_id = req.params.id;
    database.getSongById(song_id, function(err, song) {
      if(err) throw err;
      q_id++;
      song.queue_id = q_id;
      queue.push(song);
      notifyQueueChanged();
      res.send(200);
    });
};

Playa.addAlbumToQueue = function(req, res){
    var album_id = req.params.id;
    database.getSongsByAlbum(album_id, function(err, songs) {
      if(err) throw err;
      for(i = 0; i < songs.length; i++) {
        var song = songs[i];
        q_id++;
        song.queue_id = q_id;
        queue.push(song);
      }
      notifyQueueChanged();
      res.send(200);
    });
};

Playa.removeIdFromQueue = function(req, res) {
    var queue_id = req.params.id;
    var stop = false;
    for (i=0; i < queue.length && !stop; i++) {
      if(queue[i].queue_id == queue_id) {
        queue.splice(i, 1);
        stop = true;
      }
    }
    notifyQueueChanged();
    if(stop) {
      res.send(200);
    } else {
      res.send(500);
    }
};

Playa.clearQueue = function(req, res){
    queue = [];
    notifyQueueChanged();
    res.send(200);
};

Playa.getNowPlaying = function(req, res){
    res.json(nowPlaying);
};

Playa.ok = function(req, res) {
  res.send('OK');
};

mplayer.getEventEmitter(function(eventEmitter) {
  eventEmitter.on('playerExited', function(message){
      log.info('MPlayer Process Exited - Play Next Song');
      nowPlaying = null;
      if(queue.length != 0) {
        // Play the next song on the queue
        var next = queue.shift();
        mplayer.play(next.path);
        setNowPlaying(next, false);
      } else if(shouldPlayRandomSong) {
        // Find a random song in the database to play
        database.getRandomSong(function(err, song) {
          if(err) throw err;
          mplayer.play(song.path);
          setNowPlaying(song, false);
        });
      } else {
        setNowPlaying(undefined, false);
      }
  });
});

function getSongObject(song, artist, album, queue_id) {

}

function setNowPlaying(song, paused) {
  if(song == undefined) {
    nowPlaying = {song: undefined, playing: false};
  } else {
    nowPlaying = {song: song, playing: !paused};
  }
  notifyNowPlayingChanged();
}

function notifyNowPlayingChanged() {
  io.sockets.emit('nowPlaying', nowPlaying);
  // Now playing changed so the queue probably changed 
  notifyQueueChanged();
}

function notifyQueueChanged() {
  io.sockets.emit('queue', queue);
}
