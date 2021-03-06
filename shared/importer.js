var Importer = exports;

var log = require('./log');
var path = require('path');
var fs = require('fs');
var fsutils = require('./fsutils');
var musicmetadata = require('musicmetadata');

var database = require('./database');


var art_dir = path.join(__dirname, '..', 'data', 'artwork', '/');
 

Importer.parseSongs = function(songs, ticker, callback) {
  var i = 0;
  var errors = [];
	(function next() {
      var file = songs[i++];
      // log.info('Parsing: ' + file);
      if (!file) {
        return callback(errors.length == 0 ? null : errors);
      }
      database.hasSong(file, function(hasSong) {
        if(!hasSong) {
          var stream = fs.createReadStream(file);
            var parser = new musicmetadata(stream);
            parser.on('done', function(err) {
              if(err) {
                errors.push(file);
              }
              stream.destroy();
              next();
            });
            parser.on('metadata', function(result) {
            // Insert into database
            // log.inspect(result);
            database.addSong(result, file, function(added, song, artist, album) {
              if(!added) {
                  errors.push(file);
              } 
            });
          });
        } else {
          // The song has already been added
          next();
        }
        ticker();
      });
    })();
}

Importer.close = function() {
  database.close();
};

Importer.init = function(base_path, setupProgressBar, ticker, callback){
  fsutils.getFileList(base_path, function(err, results) {
    if (err) {
        return callback(err);
    }
    setupProgressBar(results.length);
    Importer.parseSongs(results, ticker, callback);
  });
};