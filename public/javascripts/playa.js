// Main Client Side Playa file

var socket = io.connect('/');
var status = 'paused';

var hasReceivedFirstNowPlaying = false;
var notifyNowPlaying = false;

// Listen for chagnes to the players state Playing|Paused|Stopped
socket.on('status', function (stat) {
    status = stat;
    console.log(status);
    // Toggle pause / play button

});

socket.on('nowPlaying', function (song) {
    console.log(song);
    // Gritter Notification
    // Stop Gritter notification on a page refresh
    if(hasReceivedFirstNowPlaying && song !== undefined) {
        var image = (!song.album_art_sml) ? '/images/album.png' : song.album_art_sml;
        makeGritter(image, 'Now Playing', song.artist_name + ' - ' + song.name);
    }
    hasReceivedFirstNowPlaying = true;
    // Now add now playing to the nowPlaying div
    $("#nowPlaying").empty();
    if(song !== undefined) {
        var items = [];
        items.push('<p>' + song.name + '</p>');
        items.push('<p>' + song.album_name + '</p>');
        items.push('<p>' + song.artist_name + '</p>');
        $('#nowPlaying').append(items.join(''));
      }
});

socket.on('songQueued', function (song) {
    var image = (!song.album_art_sml) ? '/images/album.png' : song.album_art_sml;
    makeGritter(image, 'Song added to queue', song.artist_name + ' - ' + song.name);
});

socket.on('albumQueued', function (album) {
    if(album.count == 1) {
        // Album only contains 1 song. 
        var song = album.song;
        var image = (!song.album_art_sml) ? '/images/album.png' : song.album_art_sml;
        makeGritter(image, 'Song added to queue', song.artist_name + ' - ' + song.name);
    } else {
        var image = (!album.song.album_art_sml) ? '/images/album.png' : album.song.album_art_sml;
        makeGritter(image, 'Album added to queue', album.song.artist_name + ' - ' + album.song.album_name + ' - ' + album.count + ' songs');
    }
});

function listenQueueUpdates() {
    // Not all pages want to listen for Queue updates
    socket.on('queue', function (data) {
       var items = [];
        $.each(data, function(i, item) {
            items.push('<li>' + item.artist_name + ' - ' + item.name + '  <a href=\'#\' onclick="return removeItemFromQueue(\'' + item.queue_id + '\')">Remove</a>' + '</li>');
        });
         $("#queue").empty();
        $('#queue').append(items.join(''));
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
