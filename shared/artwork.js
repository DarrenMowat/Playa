
// I had some bother importing artwork from the audio files themselves.
// The images were often corrupt and there was no way of telling if the image was corrupt or not
//
// So artwork is now grabbed from Last.fm on first request, cached on disk & served to the user

var Artwork = exports;

var path = require('path');

var database = require('./database');
var log = require('./log');

var art_dir = path.join(__dirname, '..', 'data', 'artwork', '/');

var LastFmNode = require('lastfm').LastFmNode;

var lastfm = new LastFmNode({
  api_key: '72a18fcddcfc99a52cbb7d02b18b4279',
  secret: '292aced3ea3921acdef16d15194445d7'
});


Artwork.getArtworkArtist = function(req, res) {
    var artist_id = req.params.id;
    database.getArtist(artist_id, function(err, artist) {
    	if(err || artist == undefined) {
    		log.print(err);
    		res.send(404);
    		return;
    	}
        getArtistInfo(artist.name, function(err, images){
            if(err) {
                 log.print(err);
                res.send(404);
                return;  
            }
        });
    });
};

Artwork.getArtworkAlbum = function(req, res) {
    var album_id = req.params.id;
    database.getAlbumById(album_id, function(err, album) {
    	if(err || album == undefined) {
    		log.print(err);
    		res.send(404);
    		return;
    	}
        getAlbumInfo(album.name, album.artist_name, function(err, images){
                        log.print(err);
            res.send(404);
            return;
        });
    	res.send(200);
    });
};

// Use Last.fm api to try and find artwork

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

function getArtistInfo(artist, callback){
    var request = lastfm.request("artist.getInfo", {
        artist: artist,
        handlers: {
            success: function(data) {
                callback(undefined, data.artist.image);
            },
            error: function(error) {
                callback(error);
            }
        }
    });
}
