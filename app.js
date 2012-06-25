
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var playa = require('./shared/playa');
playa.setSocketIO(io);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', playa.index);

app.get('/artist/:id', playa.artist); 

app.get('/album/:id', playa.album); 

app.get('/status', playa.ok);

app.get('/upload', playa.ok);

app.post('/upload', playa.ok);

// Queue Control

app.get('/queue/song/:id', playa.addSongToQueue);

app.get('/queue/album/:id', playa.addAlbumToQueue);

app.get('/queue/clear', playa.clearQueue);

app.get('/queue.json', playa.getQueue);

app.get('/nowplaying.json', playa.getNowPlaying);

// Player Control Routes

app.get('/player/play', playa.playMusic);

app.get('/player/pause', playa.pauseMusic);

app.get('/player/next', playa.nextSong);

app.get('/player/stop', playa.stop);

// I don't support previous songs yet
// app.post('/player/prev', playa.ok);

app.listen(3000, function(){
  console.log("Playa server listening on port %d in %s mode", app.address().port, app.settings.env);
});
