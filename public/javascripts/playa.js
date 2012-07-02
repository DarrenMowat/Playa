// Main Client Side Playa file

var socket = io.connect('/');

socket.on('queue', function (data) {
	console.log(data.length + ' Queued Tracks');
	console.log(data);
	$("#queue").empty();
	var items = [];
    $.each(data, function(i, item) {
        items.push('<li>' + item.artist_name + ' - ' + item.name + '  <a href=\'#\' onclick="return removeItemFromQueue(\'' + item.queue_id + '\')">Remove</a>' + '</li>');
    });
    $('#queue').append(items.join(''));
});

socket.on('nowPlaying', function (data) {
	var status;
	if(data.paused) {
		status = 'Paused';
	} else if (data.song == undefined) {
		status = 'Stopped';
	} else {
		status = 'Playing';
	}
	console.log('Status: ' + status);
	// Now update the now playing div
	$("#nowPlaying").empty();
	var items = [];
	items.push('<p>Status: ' + status + '</p>');
	if(data.song != undefined) {
		items.push('<p>' + data.song.artist_name + ' - ' + data.song.name + '</p>');
	}
    $('#nowPlaying').append(items.join(''));
});

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

