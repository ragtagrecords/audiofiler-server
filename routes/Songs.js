const DbSvc = require('../services/Db.js');
const SongSvc = require('../services/Songs.js');

exports.getSongs = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const songs = await SongSvc.getAllSongs(db);
    db.end();
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
})

exports.getFile = (async function (req, res) {
    const song = await FileSvc.getFile(req, res, '/songs');
})

// Get JSON info for all playlists
exports.getPlaylists = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const playlists = await SongSvc.getAllPlaylists(db);
    db.end();
    if(playlists) {
        res.status(200).send(playlists);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
    
})

// Add a new row to the playlists table
exports.createPlaylist = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    if (!db) {
        res.status(404).send({'message': "Failed to connect to database" });
        return false;
    }
    
    const newPlaylistID = await SongSvc.addPlaylist(db, req.body.name);

    if (!newPlaylistID) {
        res.status(404).send({'message': "Failed to create playlist" });
        return false;
    }

    const newPlaylist = await SongSvc.getPlaylistByID(db, newPlaylistID);
    res.status(200).send(newPlaylist);
    return true;
})

// Get JSON info for all songs in a playlist
exports.getSongsByPlaylistID = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const songs = await SongSvc.getSongsByPlaylistID(db, req.params.playlistID);
    db.end();
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
})

/* 
* Add songs to file server and database
* Expects files and JSON song info to be included in request
* Optionally add them to playlists as well if ID's are provided
*/
exports.uploadSong = (async (req, res) => {
    
    const files = Object.values(req.files);
    const songs = await JSON.parse(req.body.songs);
    let errorEncountered = false;
    
    if (!files || !songs || (files.length !== songs.length)) {
        res.status(500).send({ message: "Data not formatted properly"});
    }

    let successes = [];
    let failures = [];
    const db = await DbSvc.connectToDB();
    
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let song = songs[i];
        let fileName = file ? file.name : null;
        let playlistIDs = song.playlistIDs;
        
        if (!fileName || !song) {
            errorEncountered = true;
            continue;
        }

        await db.beginTransaction();

        let newSongID = await SongSvc.addSong(
            db,
            '/' + fileName,
            song.name ?? null,
            song.tempo ?? null
        );
            
        if (newSongID.sqlMessage) {
            DbSvc.rollbackAndLog(db, failures, song.fileName, newSongID.sqlMessage, 'POST /songs');
            continue;
        }
        
        let newSongPlaylistID = null;
        if (playlistIDs) {
            for (let i = 0; i < playlistIDs.length; ++i) {
                newSongPlaylistID = await SongSvc.addSongPlaylist(
                    db,
                    newSongID,
                    playlistIDs[i]
                );
                if (!newSongPlaylistID) {
                    break;
                }
            }
            if(!newSongPlaylistID) {
                DbSvc.rollbackAndLog(db, failures, song.fileName, newSongID.sqlMessage, '/songs');
                continue;
            }
        }

        let songAddedToFileServer = await FileSvc.postFile(file, '/songs');
            
        if(!songAddedToFileServer) {
            DbSvc.rollbackAndLog(db, failures, song.fileName, 'Failed to upload song to file server', '/songs');
        } else {
            const message = song.name + ' fully uploaded!'
            DbSvc.commitAndLog(db, successes, song.fileName, message, '/songs')
        }
    }

    db.end();

    hadFailure = failures.length > 0;
    hadSuccess = successes.length > 0;

    responseStatus = hadFailure ? 500 : 200;
    response = {
        'msg': hadFailure ? 'Some songs failed to upload' : 'Songs uploaded successfully',
        'successes': hadSuccess ? successes : null,
        'failures': hadFailure ? failures : null
    };
    res.status(responseStatus).send(JSON.stringify(response));
})

exports.addSongToPlaylist = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const playlistID = req.params.playlistID;
    const songID = req.params.songID;
    if (!playlistID || !songID) {
        res.status(404).send({ message: `Couldn't add song to playlist`});
        return false;
    }
    newSongPlaylistID = await SongSvc.addSongPlaylist(db, songID, playlistID);
    db.end();
    if(newSongPlaylistID) {
        res.status(200).send(newSongPlaylistID);
        return true;
    } else {
        res.status(404).send({ message: `Couldn't add song(id=${songID}) to playlist(id=${playlistID})`});
        return false;
    }
})
