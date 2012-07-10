
var express = require('express');
var io = require('socket.io');
var http = require('http');
var app = express();
var server = http.createServer(app);
var playa = require('./shared/playa');

var port = (process.argv[2] != undefined) ? process.argv[2] : 3000;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use(app.router);
  app.use(express.compress());
  app.use(express.staticCache());
  app.use(express.static(__dirname + '/public'));
});

// Routes

app.get('/', playa.index);

app.get('/search', playa.search);

app.get('/artists', playa.artists); 

app.get('/artist/:id', playa.artist); 

app.get('/album/:id', playa.album); 

app.get('/status', playa.ok);

app.get('/upload', playa.uploadGet);

app.post('/upload', playa.uploadPost);

// Queue Control

app.get('/queue', playa.queue);

app.post('/queue/song/:id', playa.addSongToQueue);

app.post('/queue/album/:id', playa.addAlbumToQueue);

app.post('/queue/remove/:id', playa.removeIdFromQueue)

app.post('/queue/moveup/:id', playa.moveItemUpQueue)

app.post('/queue/movedown/:id', playa.moveItemDownQueue)

app.post('/queue/clear', playa.clearQueue);

app.get('/queue.json', playa.getQueue);

app.get('/nowplaying.json', playa.getNowPlaying);

// Player Control Routes

app.post('/player/play', playa.playMusic);

app.post('/player/pause', playa.pauseMusic);

app.post('/player/next', playa.nextSong);

app.post('/player/stop', playa.stop);

app.post('/player/getVolume', playa.getVolume);

app.post('/player/incVolume', playa.incVolume);

app.post('/player/decVolume', playa.decVolume);

// Lets start the express server & socket.io server
server.listen(port);
var io_server = io.listen(server);
io_server.set('log level', 0); // reduce logging
playa.setSocketIO(io_server);

console.log("                               ");
console.log("    _____  _                   ");
console.log("   |  __ \\| |                  ");
console.log("   | |__) | | __ _ _   _  __ _ ");
console.log("   |  ___/| |/ _` | | | |/ _` |");
console.log("   | |    | | (_| | |_| | (_| |");
console.log("   |_|    |_|\\__,_|\\__, |\\__,_|");
console.log("                    __/ |      ");
console.log("                   |___/       ");
console.log("                               ");

console.log("   Playa► server listening on port %d in %s mode", port, app.settings.env);
