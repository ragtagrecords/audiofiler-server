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

exports.getZipFile = (async function (req, res) {
    const song = await FileSvc.getFile(req, res, '/zips');
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

exports.getSongsByParentID = (async function (req, res) {
    const db = await DbSvc.connectToDB();
    const parentID = req.params.parentID;
    const songs = await SongSvc.getSongsByParentID(db, parentID);
    db.end();
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
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

// Intended to replace uploadSongs
// Request must include a song object in req.body.song
exports.addSongToDB = (async function (req ,res) {
    const db = await DbSvc.connectToDB();
    const song = await JSON.parse(req.body.song);
    const parentSong = null;

    // Return if required fields are null
    if (!song || !song.name || !song.path) {
        res.status(500).send({ message: "Data not formatted properly"});
        return false;
    }

    // Add song to database
    db.beginTransaction();
    let newSongID = await SongSvc.addSong(db, song);
    if (!newSongID) {
        db.rollback();
        db.end();
        res.status(404).send({message: 'Failed to add song'});
        return false;
    }

    // Add song to playlists in database
    const playlistIDs = song.playlistIDs;
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
            db.rollback();
            db.end();
            res.status(404).send({message: 'Failed to add song to playlist'});
            return false;
        }
    }

    // Update parent if the song has one
    // TODO: if song.isParent, we need to make sure parent and other children are updated correctly
    if (song.parentID) {
        let updatedParentSong = await SongSvc.getSongByID(db, song.parentID);
        updatedParentSong.isParent = 1;

        const wasParentUpdated = await SongSvc.updateSongParent(db, updatedParentSong);

        if(!wasParentUpdated) {
            db.rollback();
            db.end();
            res.status(404).send({message: 'Failed to update parent'});
            return false;
        }
    }


    db.commit();
    db.end();
    res.status(200).send({newSongID})
    return true;
})