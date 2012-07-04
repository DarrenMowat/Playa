// Main Client Side Playa file

var socket = io.connect('/');


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

function listenNowPlayingUpdates(growl) {
    socket.on('nowPlaying', function (data) {
    	var status;
    	if(data.paused) {
    		status = 'Paused';
    	} else if (data.song == undefined) {
    		status = 'Stopped';
    	} else {
    		status = 'Playing';
    	}
    	var items = [];
    	items.push('<p>Status: ' + status + '</p>');
    	if(data.song != undefined) {
    		items.push('<p>' + data.song.artist_name + ' - ' + data.song.name + '  <a href=\'#\' onclick="return addSongToQueue(\'' + data.song.id + '\')">Requeue</a></p>');
    	}
        // Now update the now playing div
        $("#nowPlaying").empty();
        $('#nowPlaying').append(items.join(''));
        //
        var image = (!data.song.album_art_sml) ? '/images/album.png' : data.song.album_art_sml;
        if(growl) {
            $.gritter.add({
                title: 'Now Playing',
                text: data.song.artist_name + ' - ' + data.song.name,
                image: image,
                sticky: false,
                time: ''
            });
        }
    });
}

function  notifyUserOnNewQueuedSongs() {

    socket.on('songQueued', function (song) {
        var image = (!song.album_art_sml) ? '/images/album.png' : song.album_art_sml;
        $.gritter.add({
                title: 'Song added to queue',
                text: song.artist_name + ' - ' + song.name,
                image: image,
                sticky: false,
                time: ''
            });
    });

    socket.on('albumQueued', function (album) {
         var image = (!album.song.album_art_sml) ? '/images/album.png' : album.song.album_art_sml;
        $.gritter.add({
                title: 'Album added to queue',
                text: album.song.artist_name + ' - ' + album.song.album_name + ' - ' + album.count + ' songs',
                image: image,
                sticky: false,
                time: ''
            });
    });

}

function removeItemFromQueue(queue_id) {
	$.ajax({
        url: "/queue/remove/" + queue_id,
        type: "post",
        // callback handler that will be called on success
        success: function(response, textStatus, jqXHR){
            // log a message to the console
            console.log("Hooray, it worked!");
        },
        // callback handler that will be called on error
        error: function(jqXHR, textStatus, errorThrown){
            // log the error to the console
            console.log(
                "The following error occured: "+
                textStatus, errorThrown
            );
        }
    });
    return false;
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

