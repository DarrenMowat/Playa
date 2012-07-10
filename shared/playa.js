// Main Playa App

var Playa = exports;

var mplayer = require('./mplayer');
var database = require('./database');
var log = require('./log');

// The socket.io instance is passed in from app.js
var io;

var status = 'paused';

Playa.setSocketIO = function(io_) {
  io = io_;
  io.on('connection', function (socket) {
    // Tell the client whats queued & whats playing
    socket.emit('nowPlaying', nowPlaying);
    socket.emit('queue', queue);
    socket.emit('status', status);
  });
}

// Used to give each queued song a unique incremental id
var q_id = 0;
var queue = []; 
var nowPlaying = undefined;

var shouldPlayRandomSong = true;

// Basic Music Player Functions

Playa.index = function(req, res) {
  database.getXRandomAlbums(15, function(err, albums) {
    var rows = [];
    // Split array into rows of 5
    // Also deal with users having less than 15 albums
    while(albums.length != 0) {
      var x = 0;
      var row = [];
      while(albums.length != 0 && x < 5) {
        row.push(albums.shift());
        x++;
      }
      rows.push(row);
    }
    res.render('index', { title: 'Playa', rows: rows, active: 'home'});
  });
}

Playa.search = function(req, res) {
  var query = req.query["query"];
  if(query == undefined || query == '') {
    res.send(404);
    return;
  }

  database.searchArtist(query, function(err, artists) {
    if(err) {
      res.send(500);
      return;
    }
    database.searchAlbum(query, function(err, albums) {
      if(err) {
        res.send(500);
        return;
      }
      database.searchSong(query, function(err, songs) {
        if(err) {
          res.send(500);
          return;
        }
        // Now make a page from the search terms
        // Split albums into rows are they're laid out in a grid
        var rows = [];
        while(albums.length != 0) {
          var x = 0;
          var row = [];
          while(albums.length != 0 && x < 5) {
            row.push(albums.shift());
            x++;
          }
          rows.push(row);
        }
        res.render('search', { title: 'Playa', artists: artists, albums: rows, songs: songs, active: 'search', query: query});
      });
    });
  });
}

Playa.artists = function(req, res) {
  database.getArtists(function(err, artists) {
    if(err) {
      res.send(404);
      return;
    }
    res.render('artists', {title:'Artists', artists: artists, active: 'artists'});
  });
}

Playa.artist = function(req, res) {
  var artist_id = req.params.id;
  database.getAlbumsByArtist(artist_id, function(err, albums) {
    if(err || !albums || albums.length == 0) {
      res.send(404);
      return;
    }
    var artist_name = albums[0].artist_name;
    var rows = [];
    // Split array into rows of 5
    // Also deal with users having less than 15 albums
    while(albums.length != 0) {
      var x = 0;
      var row = [];
      while(albums.length != 0 && x < 5) {
        row.push(albums.shift());
        x++;
      }
      rows.push(row);
    }
    res.render('artist', {title: artist_name, artist_name: artist_name, rows: rows, active: 'artist'});
  });
}

Playa.album = function(req, res) {
  var album_id = req.params.id;
    database.getAlbumById(album_id, function(err, album) {
      if(album == undefined) {
        res.send(404);
        return;
      }
      if(err) throw err;
      database.getSongsByAlbum(album_id, function(err, songs) {
        if(err) throw err;
        res.render('album', {title: album.name, album: album, songs: songs, active: 'album', song_count: songs.length});
      });
    });
    
}

Playa.playMusic = function(req, res){
    if(mplayer.isRunning() && mplayer.isPaused()) {
      mplayer.unpause();
      setIsPlaying(true);
      res.send(200);
      return;
    } else if (queue.length != 0) {
      var next = queue.shift();
      mplayer.play(next);
      setNowPlaying(next);
      setIsPlaying(true);
      res.send(200);
      return;
    }
    // Can't play music - Queue is empty!
    res.send(500);
};

Playa.pauseMusic = function(req, res){
    if(mplayer.isRunning()) {
      mplayer.pause();
      setIsPlaying(false);
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
      mplayer.play(next);
      setNowPlaying(next);
      setIsPlaying(true);
      notifyQueueChanged();
      res.send(200);
      return;
    } else if(shouldPlayRandomSong) {
        // Find a random song in the database to play
      database.getRandomSong(function(err, song) {
        if(err) throw err;
        mplayer.play(song);
        setNowPlaying(song);
        setIsPlaying(false);
        // notifyQueueChanged(); // Queue won't change since it's empty!
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
      setNowPlaying(undefined);
      res.send(200);
      return;
    }
    // Can't pause music - MPlayer isn't running!
    res.send(500);
};

Playa.getVolume = function(req, res) {
    if(mplayer.isRunning()) {
      mplayer.getVolume();
      res.send(200);
      return;
    }
    // Can't pause music - MPlayer isn't running!
    res.send(500);
};


Playa.incVolume = function(req, res) {
    if(mplayer.isRunning()) {
      mplayer.incVolume();
      res.send(200);
      return;
    }
    // Can't pause music - MPlayer isn't running!
    res.send(500);
};


Playa.decVolume = function(req, res) {
    if(mplayer.isRunning()) {
      mplayer.decVolume();
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
  res.render('queue', {title: 'Queue', active: 'queue'});
};

Playa.addSongToQueue = function(req, res){
    var song_id = req.params.id;
    database.getSongById(song_id, function(err, song) {
      if(err) throw err;
      q_id++;
      song.queue_id = q_id;
      var shouldStartPlaying = queue.length == 0 && nowPlaying == undefined;
      if(shouldStartPlaying) {
        var next = song;
        mplayer.play(next);
        setNowPlaying(next);
        setIsPlaying(true);
      } else {
        queue.push(song);
      }
      notifyQueueChanged();
      notifyNewSongQueued(song);
      res.send(200);
    });
};

Playa.addAlbumToQueue = function(req, res){
    var album_id = req.params.id;
    database.getSongsByAlbum(album_id, function(err, songs) {
      if(err) throw err;
      var shouldStartPlaying = queue.length == 0 && nowPlaying == undefined;
      for(i = 0; i < songs.length; i++) {
        var song = songs[i];
        q_id++;
        song.queue_id = q_id;
        queue.push(song);
      }
      if(shouldStartPlaying) {
        var next = queue.shift();
        mplayer.play(next);
        setNowPlaying(next);
        setIsPlaying(true);
      } 
      notifyQueueChanged();
      notifyNewAlbumQueued(songs);

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
      nowPlaying = null;
      if(queue.length != 0) {
        // Play the next song on the queue
        var next = queue.shift();
        mplayer.play(next);
        setNowPlaying(next);
        setIsPlaying(true);
      } else if(shouldPlayRandomSong) {
        // Find a random song in the database to play
        database.getRandomSong(function(err, song) {
          if(err) throw err;
          mplayer.play(song);
          setNowPlaying(song);
          setIsPlaying(true);
        });
      } else {
        setNowPlaying(undefined);
        setIsPlaying(false);
      }
  });
});

function setNowPlaying(song) {
  nowPlaying = song;
  notifyNowPlayingChanged();
}

function setIsPlaying(playing) {
  status = playing ? 'playing' : 'paused';
  io.sockets.emit('status', status);
}

// The track usually takes a bit of time to load
// Don't notify connected clients for 0.25 seconds
function notifyNowPlayingChanged() {
  setTimeout(function() {
    io.sockets.emit('nowPlaying', nowPlaying);
  }, 250);
}

function notifyQueueChanged() {
  io.sockets.emit('queue', queue);
}

function notifyNewSongQueued(song) {
    io.sockets.emit('songQueued', song);
}

function notifyNewAlbumQueued(songs) {
  var album = {song: songs[0], count: songs.length};
  io.sockets.emit('albumQueued', album);
}
