# Playa

Playa is an music player/server with a web interface. It allows your music to be controlled from any device on your home network.

## Background

Playa was inspired by [Play at Github](https://github.com/play/play). I wanted anyone to be able to control my music from any device on my home network and for the music to play through an epic set of speakers I have. [Play](https://github.com/play/play) is powered by iTunes - I'm an Ubuntu guy so I wrote Playa. 

![readme_stuff/playa_index.png](Playa Index)

Playa manages your music library in its own database so it isn't dependant on any other media player. Music is queued up by the users or played randomly by Playa if the queue is empty. I aim to try and make shuffle mode less random in the future by taking into account things like play count.

Playa is pretty lightweight. I run it on a [RaspberryPi](raspberrypi.org) connected to my speakers and its quick. If you don't have a one yet you should get one :P. 

![readme_stuff/playa_rasppi.png](Playa Raspberry Pi)


## Setup

Playa only has a few dependencies that NPM can't handle.

    MPlayer - To play music
    sqlite3 && libsqlite3-dev -- To store library

Now install the rest with

    npm install -d
    
### Add Music 

Playa has to scan all your music and add it to its database. Do this using

    node setup '/path/to/your/music/folder'

### Add Artwork 

If you want to have artwork displayed on the web interface run 

    node artwork

to get artwork. This is a bit experimental at the moment.

### Ready. Set. Go.

At this point, you should be ready to go:

    sudo NODE_ENV=production node app 80

That'll start the server up on [localhost](http://localhost/) or what ever IP Address your server is running on.

## Technical Details

Playa is written in Node.js.
Data is stored in a SQLite3 database.
Socket.io is used to push queue changes to clients.
Last.fm is used to get artwork.

## Tests

Playa doesn't have any tests yet. They're on my to do list.

## Contributing

I'd love to see your contributions to Playa. Playa can be run in development mode with:

    node app

You can hit the server on [localhost:3000](http://localhost:3000). Jade files are automatically reloaded. Node.js code is not though.


## About Me

I'm [Darren Mowat](https://twitter.com/darrenmowat). A 4th year Computer Science student from Scotland. 

[play]: http://rogueamoeba.com/nicecast/
[nicecast]: http://rogueamoeba.com/nicecast/
[campfire]: http://campfirenow.com/
[pusher]:   http://pusher.com/