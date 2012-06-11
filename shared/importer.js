var redis = require('./redis');

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          // Is it an audio file?
          var extension = file.split('.').pop();
          if(extension === 'm4a' || extension === 'mp3') {
            if()
          	results.push(file);
          }
          next();
        }
      });
    })();
  });
};




var parseSongs = function(songs, callback) {
  var i = 0;
	(function next() {
      var file = songs[i++];
      if (!file) {
        return callback(null, results);
      }
      var parser = new musicmetadata(fs.createReadStream(file));
      parser.on('metadata', function(result) {
        log.info(i + ' of ' + songs.length + " " + result.title + " - " + result.artist);
        next();
      });
    })();
}

exports.init = function(){
  log.info("Initialising Library");
  walk(base_path, function(err, results) {
    if (err) throw err;
      
    parseSongs(results, function(err, metas) {
      if(err) throw err;
      log.info("Done parsing meta data");
    });
  
  });
};