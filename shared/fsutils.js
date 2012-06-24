var FSUtils = exports;

var fs = require('fs');
var log = require('./log');

function getFileExt(filename) {
	return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

FSUtils.getFileList = function(dir, done) {
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
          FSUtils.getFileList(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          var ext = getFileExt(file);
          if(ext == 'mp3' || ext == 'm4a' || ext == 'ogg') {
				    results.push(file);
        	}
          next();
        }
      });
    })();
  });
};
