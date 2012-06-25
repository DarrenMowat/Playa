var Database = exports;

var log = require('./log');
var fs = require('fs');
var path = require('path');
var SqlString = require('./SqlString');
var sqlite3 = require('sqlite3').verbose();

var db_path = path.join(__dirname, '..', 'data', 'library.db');
var db_initialised = path.existsSync(db_path);

var db = new sqlite3.Database(db_path);

if(!db_initialised) {
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
		'albumart TEXT, ' + 
		'artist_id INTEGER, ' + 
		'UNIQUE(name, artist_id) ON CONFLICT IGNORE, ' +  // Ignore incase album art has already been set.
		'FOREIGN KEY(artist_id) REFERENCES artist(id))');
	// Create Song Table
	db.run('CREATE TABLE songs (' + 
		'id INTEGER PRIMARY KEY AUTOINCREMENT, ' + 
		'name TEXT, ' + 
		'path TEXT UNIQUE, ' + 
		'tracknumber INTEGER, ' + 
		'artist_id INTEGER, ' + 
		'album_id INTEGER, ' + 
		'FOREIGN KEY(artist_id) REFERENCES artist(id), ' + 
		'FOREIGN KEY(album_id) REFERENCES album(id))');
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

		var insert_artist = db.prepare("INSERT INTO artists (name) VALUES (?);");
      	insert_artist.run(SqlString.escape(song.artist));
  		insert_artist.finalize();

		db.get('SELECT * FROM artists where name like ?', [ SqlString.escape(song.artist) ], function(err, artist) {
			if(err) throw err;
			var artist_id = artist.id;
			db.run('INSERT INTO albums (name, artist_id) VALUES (?, ?);', [ SqlString.escape(song.album), artist_id ]);
			db.get('SELECT id FROM albums where name = ? and artist_id = ?', [ SqlString.escape(song.album), artist_id], function(err, album) {
				if(err) throw err;
				var album_id = album.id;
				var tracknumber = 0; 
				if(song.track != undefined && song.track.no != undefined) {
					tracknumber = song.track.no;
				}
				db.run('INSERT INTO songs (name, path, tracknumber, artist_id, album_id) VALUES (?, ?, ?, ?, ?);', [ SqlString.escape(song.title), SqlString.escape(path), tracknumber, artist_id, album_id ]);
				return callback(true);
			});
    	});



	});

}

Database.hasSong = function(path, callback) {
	if(isEmpty(path)) {
		log.info('Empty Path');
		callback(true); // Empty path. Just pretend we have this stored
	}
	db.serialize(function() {
		db.get('SELECT * FROM songs where path = ?', [ SqlString.escape(path) ], function(err, rows) {
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
		db.all('SELECT * FROM albums', callback);
	});
}

Database.getAlbumsByArtist = function(id, callback) {
	db.serialize(function() {
		db.all('SELECT * FROM albums where artist_id = ' + id, callback);
	});
}

Database.getSongsByAlbum = function(id, callback) {
	db.serialize(function() {
		db.all('SELECT * FROM songs where album_id=? order by tracknumber' , [ id ], callback);
	});
}

Database.getSongById = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM songs where id = ' + id , callback);
	});
}

Database.getSongsByArtist = function(id, callback) {
	db.serialize(function() {
		db.get('SELECT * FROM songs where artist_id = ?', [ id ], callback);
	});
}

Database.getRandomSong = function(callback) {
	db.serialize(function() {
		db.get('SELECT * FROM songs ORDER BY RANDOM() LIMIT 1', callback);
	});
}


Database.close = function() {
  db.close();
  log.info('Closed Database');
}