
/**
 * Module dependencies.
 */

var express = require('express');
var library = require('./shared/library');
var routes = require('./routes');

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

app.get('/', function(req, res){
    res.send('user ' + req.params.id);
});


app.get('/artist/:id', function(req, res){
  
    res.send('user ' + req.params.id);
});

app.get('/album/:id', function(req, res){
    res.send('user ' + req.params.id);
});

app.get('/next', function(req, res) {
  library.next();
  res.send(200);
});

app.get('/prev', function(req, res) {
  library.prev();
  res.send(200);
});

app.get('/pause', function(req, res) {
  library.pause();
  res.send(200);
});

app.get('/unpause', function(req, res) {
  library.unpause();
  res.send(200);
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
