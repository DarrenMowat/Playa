
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

app.get('/data/queue.json', playa.getQueue);

app.get('/data/nowplaying.json', playa.getNowPlaying);

app.get('/artist/:id', playa.artist); 

app.get('/album/:id', playa.album); 

app.get('/song/:id', playa.song); 

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
