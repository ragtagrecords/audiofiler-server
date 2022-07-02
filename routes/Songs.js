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

exports.addSongToPlaylist = (async function (req, res) {
    const playlistID = req.params.playlistID;
    const songID = req.params.songID;

    if (!playlistID || !songID) {
        res.status(404).send({ message: `Couldn't add song to playlist`});
        return null;
    }

    const db = await DbSvc.connectToDB();
    newSongPlaylistID = await SongSvc.addSongToPlaylist(db, songID, playlistID);
    db.end();

    if(newSongPlaylistID) {
        res.status(200).send({ id: newSongPlaylistID });
        return true;
    } else {
        res.status(404).send({ message: `Couldn't add song(id=${songID}) to playlist(id=${playlistID})`});
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

    const parentSong = null;
    
    // Return if required fields are null
    if (!song || !song.name || !song.path) {
        res.status(500).send({ message: "Data not formatted properly"});
        return null;
    }

    const db = await DbSvc.connectToDB();
    db.beginTransaction(); // Allows us to commit or rollback the changes to the database
    
    // Add song to database
    let newSongID = await SongSvc.addSong(db, song);
    if (!newSongID) {
        db.rollback();
        db.end();
        res.status(404).send({message: 'Failed to add song'});
        return null;
    }

    // Add song to playlists in database
    const playlistIDs = song.playlistIDs;
    if (playlistIDs) {
        for (let i = 0; i < playlistIDs.length; ++i) {
            newSongPlaylistID = await SongSvc.addSongToPlaylist(
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
            return null;
        }
    }

    // Update parent if the song has one
    if (song.parentID || song.isParent) {
        let parentSong = await SongSvc.getSongByID(db, song.parentID);

        // If new song is replacing the parent
        if (song.isParent) {
            parentSong.isParent = 0;
            parentSong.parentID = newSongID;
        } else {
            parentSong.isParent = 1;
            parentSong.parentID = null;
        }

        const wasParentUpdated = await SongSvc.updateSongParent(db, parentSong);

        if(!wasParentUpdated) {
            db.rollback();
            db.end();
            res.status(404).send({message: 'Failed to update parent'});
            return null;
        }
    }

    db.commit();
    db.end();
    res.status(200).send({newSongID})
    return true;
})

exports.deleteSong = (async function (req ,res) {
    const id = req.params.id;

    if (!id) {
        res.status(404).send({ message: `ID required, structure request like so: /public/songs/<id>`});
        return null;
    }

    const db = await DbSvc.connectToDB();
    const songDeleted = await SongSvc.deleteSong(db, id);
    db.end();

    if(songDeleted) {
        res.status(200).send({ message: `Song (${id}) was deleted` });
        return true;
    } else {
        res.status(404).send({ message: `Couldn't delete song ${id}`});
        return null;
    }
})