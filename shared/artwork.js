
var Artwork = exports;

var path = require('path');

var database = require('./database');
var log = require('./log');

var art_dir = path.join(__dirname, '..', 'data', 'artwork', '/');


Artwork.getArtworkArtist = function(req, res) {
    var artist_id = req.params.id;
    database.getArtist(artist_id, function(err, artist) {
    	if(err || artist == undefined) {
    		log.print(err);
    		res.send(404);
    		return;
    	}
    	log.print('About to try and get artwork for ' + artist.name);
    	res.send(200);
    });
};

Artwork.getAlbumArtist = function(req, res) {
    var album_id = req.params.id;
    database.getAlbumById(album_id, function(err, album) {
    	if(err || album == undefined) {
    		log.print(err);
    		res.send(404);
    		return;
    	}
    	log.print('About to try and get artwork for ' + album.name + ' - ' + album.artist_name);
    	res.send(200);
    });
};

// Use Last.fm api to try and find artwork