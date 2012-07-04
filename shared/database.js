var Database = exports;

var log = require('./log');
var fs = require('fs');
var path = require('path');
// var SqlString = require('./SqlString');
var sqlite3 = require('sqlite3').verbose();

var db_path = path.join(__dirname, '..', 'data', 'library.db');
var db_initialised = path.existsSync(db_path);

var db = new sqlite3.cached.Database(db_path);

if(!db_initialised) {
	db.serialize(function() {
		log.info('Initialising database');	
		// Create Artist Table
		db.run('CREATE TABLE artists (' + 
			'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
			'name TEXT COLLATE NOCASE, ' + 
			'UNIQUE(name) ON CONFLICT IGNORE)');
		// Create Album Table
		db.run('CREATE TABLE albums (' + 
			'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
			'name TEXT COLLATE NOCASE, ' + 
			'albumart_sml TEXT, ' + 
			'albumart_med TEXT, ' + 
			'albumart_lrg TEXT, ' + 
			'artist_id INTEGER, ' + 
			'UNIQUE(name, artist_id) ON CONFLICT IGNORE, ' +  // Ignore incase album art has already been set.
			'FOREIGN KEY(artist_id) REFERENCES artist(id))');
		// A View that combines albums & artists
		db.run('CREATE VIEW if not exists album_view as select ' + 
			'albums.id as id, ' + 
			'albums.name as name, ' + 
			'albums.albumart_sml as albumart_sml, ' + 
			'albums.albumart_med as albumart_med, ' + 
			'albums.albumart_lrg as albumart_lrg, ' + 
			'artists.id as artist_id, ' + 
			'artists.name as artist_name ' + 
			'from albums, artists ' + 
			'where albums.artist_id = artists.id');
		// Create Song Table - This should never be accessed outside this module
		// Always Query against song_view or stuff will break
		db.run('CREATE TABLE songs (' + 
			'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
			'name TEXT, ' + 
			'path TEXT UNIQUE, ' + 
			'tracknumber INTEGER, ' + 
			'artist_id INTEGER, ' + 
			'album_id INTEGER, ' + 
			'FOREIGN KEY(artist_id) REFERENCES artist(id), ' + 
			'FOREIGN KEY(album_id) REFERENCES album(id))');
		// Song(id, name, path, tracknumber), Artist(id, name), Album(id, name, albumart)
		db.run('CREATE VIEW if not exists song_view as select ' + 
			'songs.id as id, ' +
			'songs.name as name, ' +
			'songs.path as path, ' + 
			'songs.tracknumber as tracknumber, ' +
			'album_view.id as album_id, ' + 
			'album_view.name as album_name, ' + 
			'album_view.albumart_sml as album_art_sml, ' + 
			'album_view.albumart_med as album_art_med, ' + 
			'album_view.albumart_lrg as album_art_lrg, ' + 
			'album_view.artist_id as artist_id, ' + 
			'album_view.artist_name as artist_name ' + 
			'from songs, album_view ' + 
			'where songs.album_id = album_view.id');
		// Try to avoid SQLITE_BUSY errors when importing whilst the app is running
		// db.run('PRAGMA journal_mode = WAL'); // Faster but causes some problems 

	});

}

Database.addSong = function(song, path, callback) {
    if(song == undefined) {
    	return callback(false);
    }
    if(isEmpty(song.title) || isEmpty(song.artist)) {
		return callback(false);
	}
	if(isEmpty(song.album)) {
		// Create an Album Title
		song.album = song.artist + ' - Unknown Album';
	}
	db.serialize(function() {

  		db.run("INSERT INTO artists (name) VALUES ($name)", {
        	$name: song.artist.toString()
    	});

		db.get('SELECT * FROM artists where name like $name', { 
			$name: song.artist.toString() 
			}, function(err, artist) {
			if(err) throw err;
			var artist_id = artist.id;
			db.run("INSERT INTO albums (name, artist_id) VALUES ($name, $artist_id)", {
        		$name: song.album.toString(),
        		$artist_id: artist_id
    		});
			db.get('SELECT * FROM albums where name = $name and artist_id = $artist_id', {
        			$name: song.album.toString(),
        			$artist_id: artist_id
    			}, function(err, album) {
				if(err) throw err;
				var album_id = album.id;
				var tracknumber = 0; 
				if(song.track != undefined && song.track.no != undefined) {
					tracknumber = song.track.no;
				}
				db.run('INSERT INTO songs (name, path, tracknumber, artist_id, album_id) VALUES ($name, $path, $tracknumber, $artist_id, $album_id);', {
					$name: song.title.toString(),
					$path: path.toString(),
					$tracknumber: tracknumber,
					$artist_id: artist_id,
					$album_id: album_id
				});
				return callback(true, song, artist, album);
			});
    	});
	});
}

Database.addAlbumArtwork = function(url_sml, url_med, url_lrg, album_id, callback) {
	db.run("UPDATE albums SET albumart_sml = $albumart_sml, albumart_med = $albumart_med, albumart_lrg = $albumart_lrg WHERE id = $id", {
        		$albumart_sml: url_sml,
        		$albumart_med: url_med,
        		$albumart_lrg: url_lrg,
        		$id: album_id
    }, callback);
}

Database.hasArtwork = function(album_id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM album_view where id = ' + album_id, function(err, row) {
			if(err) {
				log.inspect("Error with album " + album_id);
				log.inspect(err);
				log.inspect(row);
				//throw err;
			}
			return callback(row.albumart_sml != undefined && row.albumart_sml != '');
		});
	});
}

Database.hasSong = function(path, callback) {
	if(isEmpty(path)) {
		log.info('Empty Path');
		callback(true); // Empty path. Just pretend we have this stored
	}
	db.serialize(function() {
		db.get('SELECT * FROM songs where path = $path', { $path: path.toString() }, function(err, rows) {
			if(err || rows == undefined) {
				return callback(false);
			}
			return callback(true);
		});
	});
}

function isEmpty(x) {
	return (x == undefined || (x + '').replace(/^\s*|\s*$/g, '') === '');
}

Database.getArtists = function(callback) {
	db.serialize(function() {
		db.all('SELECT * FROM artists ORDER BY name COLLATE NOCASE', callback);
	});
}

Database.getArtist = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM artists where id = ' + id, callback);
	});
}

Database.getAlbums = function(callback) {
	db.serialize(function() {
		db.all('SELECT * FROM album_view', callback);
	});
}

// TODO: Orderby alphabetically

Database.getAlbumsByArtist = function(id, callback) {
	db.serialize(function() {
		db.all('SELECT * FROM album_view where artist_id = ' + id, callback);
	});
}

Database.getAlbumById = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM album_view where id = ' + id, callback);
	});
}

Database.getSongsByAlbum = function(id, callback) {
	db.serialize(function() {
		db.all('SELECT * FROM song_view where album_id=? order by tracknumber' , [ id ], callback);
	});
}

Database.getSongById = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM song_view where id = ' + id , callback);
	});
}

Database.getSongsByArtist = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM song_view where artist_id = ?', [ id ], callback);
	});
}

Database.getRandomSong = function(callback) {
	db.serialize(function() {
		db.get('SELECT * FROM song_view ORDER BY RANDOM() LIMIT 1', callback);
	});
}

Database.getXRandomAlbums = function(x, callback) {
	db.serialize(function() {
		db.all('SELECT * FROM album_view ORDER BY RANDOM() LIMIT ' + x, callback);
	});
}


Database.close = function() {
  db.close();
  log.info('Closed Database');
}