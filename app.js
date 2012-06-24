
/**
 * Module dependencies.
 */

var express = require('express');
var playa = require('./shared/playa');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
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

// Visible Routes

app.get('/', playa.index);

app.get('/artist/:id', playa.artist); 

app.get('/album/:id', playa.album); 

// Queue Control

app.post('/queue/song/:id', playa.queueSong);

app.post('/queue/album/:id', playa.queueAlbum);

app.post('/queue/clear', playa.ok);

// Player Control Routes

app.post('/player/play', playa.ok);

app.post('/player/pause', playa.ok);

app.post('/player/next', playa.ok);

app.post('/player/prev', playa.ok);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
