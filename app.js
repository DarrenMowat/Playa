
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

var playa = require('./shared/playa');
playa.setSocketIO(io);

var port = process.argv[2];

if(port == undefined) {
  port = 3000;
}

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/data'));
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

app.post('/queue/song/:id', playa.addSongToQueue);

app.post('/queue/album/:id', playa.addAlbumToQueue);

app.post('/queue/remove/:id', playa.removeIdFromQueue)

app.post('/queue/clear', playa.clearQueue);

app.get('/queue.json', playa.getQueue);

app.get('/nowplaying.json', playa.getNowPlaying);

// Player Control Routes

app.post('/player/play', playa.playMusic);

app.post('/player/pause', playa.pauseMusic);

app.post('/player/next', playa.nextSong);

app.post('/player/stop', playa.stop);

app.get('/library*', function(req, res) {
  res.send(403);
});

// I don't support previous songs yet
// app.post('/player/prev', playa.ok);

app.listen(port, function(){
  console.log("Playa server listening on port %d in %s mode", port, app.settings.env);
});
