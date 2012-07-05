// Main Client Side Playa file

var socket = io.connect('/');
var hasReceivedFirstNowPlaying = false;
var status = 'Stopped';


function listenQueueUpdates() {
    socket.on('queue', function (data) {
	   var items = [];
        $.each(data, function(i, item) {
            items.push('<li>' + item.artist_name + ' - ' + item.name + '  <a href=\'#\' onclick="return removeItemFromQueue(\'' + item.queue_id + '\')">Remove</a>' + '</li>');
        });
         $("#queue").empty();
        $('#queue').append(items.join(''));
    });
}

//
// - gritter : Boolean - Should nowPlaying events trigger a gritter notification
//
function listenNowPlayingUpdates(gritter) {
    socket.on('nowPlaying', function (data) {
    	if(data.paused) {
    		status = 'Paused';
    	} else if (data.song == undefined) {
    		status = 'Stopped';
    	} else {
    		status = 'Playing';
    	}
        console.log(status);
    	var items = [];
    	items.push('<p>Status: ' + status + '</p>');
    	if(data.song != undefined) {
    		items.push('<p>' + data.song.artist_name + ' - ' + data.song.name + '  <a href=\'#\' onclick="return addSongToQueue(\'' + data.song.id + '\')">Requeue</a></p>');
    	}
        // Now update the now playing div
        $("#nowPlaying").empty();
        $('#nowPlaying').append(items.join(''));
        // Gritter Notification
        // Stop Gritter notification on a page refresh
        if(hasReceivedFirstNowPlaying && gritter) {
            var image = (!data.song.album_art_sml) ? '/images/album.png' : data.song.album_art_sml;
            makeGritter(image, 'Now Playing', data.song.artist_name + ' - ' + data.song.name);
        }
        // if(!hasReceivedFirstNowPlaying) {
        hasReceivedFirstNowPlaying = true;
        // }
    });
}

function  notifyUserOnNewQueuedSongs() {

    socket.on('songQueued', function (song) {
        var image = (!song.album_art_sml) ? '/images/album.png' : song.album_art_sml;
        makeGritter(image, 'Song added to queue', song.artist_name + ' - ' + song.name);
    });

    socket.on('albumQueued', function (album) {
         var image = (!album.song.album_art_sml) ? '/images/album.png' : album.song.album_art_sml;
         makeGritter(image, 'Album added to queue', album.song.artist_name + ' - ' + album.song.album_name + ' - ' + album.count + ' songs');
    });

}

function makeGritter(image, title, text) {
    $.gritter.add({
        title: title,
        text: text,
        image: image,
        sticky: false,
        time: ''
    });
}

function doPost(path) {
	$.ajax({
        url: path,
        type: "post",
        error: function(jqXHR, textStatus, errorThrown){
            console.log( "Couldn't POST " + path + " - " + textStatus, errorThrown);
        }
    });
}

function addSongToQueue(song_id) {
	doPost("/queue/song/" + song_id);
	return false;
}

function addAlbumToQueue(album_id) {
	doPost("/queue/album/" + album_id);
	return false;
}

function removeItemFromQueue(queue_id) {
    doPost("/queue/remove/" + queue_id);
    return false;
}

function clearQueue() {
	doPost("/queue/clear");
    return false;
}


function playerNext() {
	doPost("/player/next");
    return false;
}

function playerPause() {
	doPost("/player/pause");
    return false;
}

function playerPlay() {
	doPost("/player/play");
    return false;
}

function playerStop() {
	doPost("/player/stop");
    return false;
}

function playerGetVolume() {
    doPost("/player/getVolume");
    return false;
}

function playerIncVolume() {
    doPost("/player/incVolume");
    return false;
}

function playerDecVolume() {
    doPost("/player/decVolume");
    return false;
}

// Keyboard Player Controls

Mousetrap.bind('ctrl+right', function(e) {
    playerNext();
});

Mousetrap.bind('ctrl+up', function(e) {
    playerIncVolume();
});

Mousetrap.bind('ctrl+down', function(e) {
    playerDecVolume();
});
