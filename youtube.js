

// Kudos: http://www.benfarrell.com/2012/06/14/morph-your-media-with-node-js/

var priority = [18,34,22,37,35,5,6];

// int p = 0; tryDownload(fn(err) {if err -> p++ tryDownload..., else convertToMp3})

var Youtube = exports;


Youtube.getAudio = function(req, res) {

};

var youtubedl = require('youtube-dl');

var dl = youtubedl.download(
		'http://www.youtube.com/watch?v=MITA4FhVjDc',
	  	'./data/temp',
	  	['--max-quality=18']
  	);

// will be called when the download starts
dl.on('download', function(data) {
  console.log('Download started');
  console.log('filename: ' + data.filename);
  console.log('size: ' + data.size);
});

// will be called during download progress of a video
dl.on('progress', function(data) {
  process.stdout.write(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
});

// catches any errors
dl.on('error', function(err) {
  throw err;
});

// called when youtube-dl finishes
dl.on('end', function(data) {
  console.log('\nDownload finished!');
  console.log('Filename: ' + data.filename);
  console.log('Size: ' + data.size);
  console.log('Time Taken: ' + data.timeTaken);
  console.log('Time Taken in ms: ' + data.timeTakenms);
  console.log('Average Speed: ' + data.averageSpeed);
  console.log('Average Speed in Bytes: ' + data.averageSpeedBytes);
});