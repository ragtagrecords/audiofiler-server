const DbSvc = require('../services/Db.js');
const SongSvc = require('../services/Songs.js');
const PlaylistSvc = require('../services/Playlists.js');

exports.getSongs = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const songs = await SongSvc.getSongs(db);
    db.end();
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return null;
    }
})

// Get JSON info for a single song
exports.getSongByID = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const song = await SongSvc.getSongByID(db, req.params.id, true);
    db.end();

    if(song && song.name) {
        res.status(200).send(song);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get song"});
        return null;
    }
})

// Get JSON info for all songs in a playlist
exports.getSongsByPlaylistID = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const songs = await SongSvc.getSongsByPlaylistID(db, req.params.playlistID);
    db.end();

    if(songs && songs.length > 0) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return null;
    }
})

exports.getSongsByParentID = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const parentID = req.params.parentID;
    const songs = await SongSvc.getSongsByParentID(db, parentID);
    db.end();

    if(songs && songs.length > 0) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return null;
    }
})

// Intended to replace uploadSongs
// Request must include a song object in req.body.song
exports.addSongToDB = (async function (req ,res) {
    let song = null;

    // Requests from React App must be parsed from JSON
    try {
        song = await JSON.parse(req.body.song);
    } catch(ex) { // Requests from Python do not
        song = req.body.song
    }

    // Return if required fields are null
    if (!song || !song.name || !song.path) {
        res.status(500).send({ message: "Data not formatted properly"});
        return;
    }

    const db = await DbSvc.connectToDB();
    db.beginTransaction(); // Allows us to commit or rollback the changes to the database
    
    // Add song to database
    let newSongID = await SongSvc.addSong(db, song);
    if (!newSongID) {
        db.rollback();
        db.end();
        res.status(404).send({message: 'Failed to add song'});
        return;
    }

    // Add song to playlists in database
    const playlistIDs = song.playlistIDs;
    if (playlistIDs) {
        for (let i = 0; i < playlistIDs.length; i += 1) {
            newSongPlaylistID = await PlaylistSvc.addSongToPlaylist(
                db,
                newSongID,
                playlistIDs[i]
            );
            if (!newSongPlaylistID) {
                break;
            }
        }
        if(!newSongPlaylistID) {
            db.rollback();
            db.end();
            res.status(404).send({message: 'Failed to add song to playlist'});
            return;
        }
    }

    // Update parent if the song has one
    if (song.parentID || song.isParent) {
        let parentSong = await SongSvc.getSongByID(db, song.parentID);

        if (!parentSong) {
            db.rollback();
            db.end();
            message = `ERROR: No parent song found with id:${song.parentID}`;
            console.log(message);
            res.status(404).send({message});
            return;
        }

        // If new song is replacing the parent
        if (song.isParent) {
            parentSong.isParent = 0;
            parentSong.parentID = newSongID;
        } else {
            parentSong.isParent = 1;
            parentSong.parentID = null;
        }
        
        // remove ID before update
        delete parentSong.id;

        const wasParentUpdated = await SongSvc.updateSong(db, parentSong, song.parentID);

        if(!wasParentUpdated) {
            db.rollback();
            db.end();
            res.status(404).send({message: 'Failed to update parent'});
            return;
        }
    }

    db.commit();
    db.end();
    res.status(200).send({newSongID})
    return;
})

exports.deleteSongByID = (async function (req ,res) {
    const id = req.params.id;

    if (!id) {
        res.status(404).send({ message: `ID required, structure request like so: /public/songs/<id>`});
        return null;
    }

    const db = await DbSvc.connectToDB();
    const songDeleted = await SongSvc.deleteSongByID(db, id);
    db.end();

    if(songDeleted) {
        res.status(200).send({ message: `Song (${id}) was deleted` });
        return true;
    } else {
        res.status(404).send({ message: `Couldn't delete song ${id}`});
        return null;
    }
})

exports.updateSong = (async function (req ,res) {
    const id = req.params.id;
    let song = null;

    // Requests from React App need to be parsed from JSON
    try {
        song = await JSON.parse(req.body.song);
    } catch(ex) { // Requests from Python do not
        song = req.body.song
    }

    if (!song || !id) {
        res.status(404).send({message: 'No song object found in request body'});
        return false;
    }


    // Attempt to update song in database
    const db = await DbSvc.connectToDB();
    let resultMessage = await SongSvc.updateSong(db, song, id);
    db.end();

    if (!resultMessage) {
        res.status(404).send({message: 'Failed to update song'});
        return null;
    }

    res.status(200).send({ message: resultMessage});
    return true;
})
