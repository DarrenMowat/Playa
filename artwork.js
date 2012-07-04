
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
var artwork = require('./shared/artwork');
var db = require('./shared/database');
var ProgressBar = require('progress');


var bar;
var size;
var current;

var LastFmNode = require('lastfm').LastFmNode;

var lastfm = new LastFmNode({
  api_key: '72a18fcddcfc99a52cbb7d02b18b4279',
  secret: '292aced3ea3921acdef16d15194445d7'
});

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

db.getAlbums(function(err, albums) {
	if(err || albums == undefined) {
		throw err;
	}
	var errors = [];
	log.print("About to try and get artwork for " + albums.length);
	log.print("");
	setupProgressBar(albums.length);
	// Loop over albums, only process one at a time
	var i = 0;
    (function next() {
      ticker();
      var album = albums[i++];
      if (!album) {
      	log.print("Done!");
      	return;
      } 
      db.hasArtwork(album.id, function(err, hasArtwork) {
      	if(err) {
          throw err;
      	} else if (hasArtwork) { 
          log.info('Had artwork');
          next();
        } else {
      		// Download artwork
          getAlbumInfo(album.name, album.artist_name, function(err, images) {
            if(err || images == undefined || images.length == 0) {
              // Store default images/album.png image
              var url = "/images/album.png";
              db.addAlbumArtwork(url, url, url, album.id, function(err, row) {
                //if(err) throw err;
                log.print("Couldn't fetch art for " + album.name + " - " + album.artist_name);
              });
            } else {
              db.addAlbumArtwork(images[1]['#text'], images[2]['#text'], images[3]['#text'], album.id, function(err, row) {
                //if(err) throw err;
                log.print("Stored art for " + album.name + " - " + album.artist_name);
              });
            } 
            next();
          });
      	}
      });
    })();


});


function getAlbumInfo(album, artist, callback){
    var request = lastfm.request("album.getInfo", {
        artist: artist,
        album: album,
        handlers: {
            success: function(data) {
                callback(undefined, data.album.image);
            },
            error: function(error) {
                callback(error);
            }
        }
    });
}
