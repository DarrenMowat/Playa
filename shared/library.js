var log = require('./log.js');
var fs = require('fs');
var musicmetadata = require('musicmetadata');

var base_path = '/home/darren/Music/';

var next = function() {

}

var prev = function() {

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

