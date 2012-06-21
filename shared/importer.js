var log = require('./log');
var fs = require('fs');
var fsutils = require('./fsutils');
var musicmetadata = require('musicmetadata');

var path = require('path');

var database = require('./database');


var parseSongs = function(songs, ticker, callback) {
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
              errors.push(file);
              stream.destroy();
              next();
            });
            parser.on('metadata', function(result) {
            // Insert into database
            database.addSong(result, file, function(added) {
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

exports.close = function() {
  database.close();
};

exports.init = function(base_path, setupProgressBar, ticker, callback){
  fsutils.getFileList(base_path, function(err, results) {
    if (err) {
        return callback(err);
    }
    setupProgressBar(results.length);
    parseSongs(results, ticker, callback);
  });
};