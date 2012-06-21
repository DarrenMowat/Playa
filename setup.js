
/**
 * Playa Setup Script
 *
 * This script will import all the music from the directory
 * passed in to the local Playa database.
 * 
 * USAGE: node setup.js '/dir/to/import/from'
 *
 */

var log = require('./shared/log');
var importer = require('./shared/importer');
var ProgressBar = require('progress');

var bar;
var size;
var current;

var directory = process.argv[2];

if(directory == undefined || (directory + '').replace(/^\s*|\s*$/g, '') === '') {
	log.info('Please pass in the directory to import from as an argument');
	process.exit(1);
}

var setupProgressBar = function(s) {
	size = s;
	bar = new ProgressBar('  :current of :total :percent', {
    total: size
  });
};

var ticker = function() {
	if(bar != undefined && !bar.complete) {
		bar.tick();
	}
};

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

importer.init(directory, setupProgressBar, ticker, function(err) {
	importer.close();
	if(err) {
		log.info('');
		log.info('Couldn\'t import all tracks');
		log.info(err.length + ' Errors');
		err.forEach(function (val, index, array) {
  			log.info(val);
		});
		process.exit(1);
	} else {
		log.info('');
		log.info('Finished importing songs');
		process.exit(0);
	}
});
