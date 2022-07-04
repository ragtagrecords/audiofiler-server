const DbSvc = require('../services/Db.js');
const SongSvc = require('../services/Songs.js');
const PlaylistSvc = require('../services/Playlists.js');


// When a a new song is added, playlists or parent/child info in the DB may need to change
// This function makes sure other songs are updated accordingly when a new song is added
async function updateSongVersions(db, newSongID, parentID, isParent) {
    let parentSong = await SongSvc.getSongByID(db, parentID);

    if (!parentSong) {
        return {
            success: 0,
            message: `ERROR: No parent song found with id:${song.parentID}`,
        };
    }

    if (parentSong.parentID) {
        return {
            success: 0,
            message: `ERROR: Song id:${song.parentID} is a child, not a valid parentID`,
        };
    }

    const songsToUpdate = [];

    // Simple case here, new song is a child, make sure parent is set
    if (!isParent) {
        parentSong.isParent = 1;
        parentSong.parentID = null;
        songsToUpdate.push(parentSong);
    } else { // If new song is replacing the parent

        // Update new song info
        const newSong = await SongSvc.getSongByID(db, newSongID);
        if (!newSong) {
            return {
                success: 0,
                message: `ERROR: Failed to get song info`,
            };
        }
        newSong.parentID = null;
        songsToUpdate.push(newSong);

        // Update parent info
        parentSong.isParent = 0;
        parentSong.parentID = newSongID;
        songsToUpdate.push(parentSong);

        // Get all the playlists that this song is in
        const playlists = await PlaylistSvc.getPlaylistsBySongID(db, parentSong.id);

        // Because it is a new parent, we need to replace the existing parent song in each of its playlists
        playlists.forEach(async({id}) => {

            // Remove parent song from playlists
            songRemoved = await PlaylistSvc.deleteSongFromPlaylist(db, parentID, id);

            if (!songRemoved) {
                return {
                    success: 0,
                    message: `ERROR: Could not remove parentID(${parentID}) from playlist(${id})`,
                };
            }

            // Add new song to playlists
            newSongAdded = await PlaylistSvc.addSongToPlaylist(db, newSongID, id);

            if (!newSongAdded) {
                return {
                    success: 0,
                    message: `ERROR: Could not add song(${newSongID}) to playlist(${id})`,
                };
            }
            
        })
        

        // Get existing children, we need to update them as well
        const childrenSongs = await SongSvc.getSongsByParentID(db, parentID);
        
        if (!childrenSongs) {
            return {
                success: 0,
                message: `ERROR: Could not fetch existing versions for parentID:${parentID}`,
            };
        }
        
        // Update existing children to new parentID
        childrenSongs.forEach((child) => {
            if(child.id != newSongID) {
                child.parentID = newSongID;
                songsToUpdate.push(child);
            }
        })
    }

    // Update all the songs with new info
    songsToUpdate.forEach(async (song) => {
        const wasSongUpdated = await SongSvc.updateSong(db, song, song.id);
    
        if(!wasSongUpdated) {
            return {
                success: 0,
                message: `ERROR: Could not update songID:${song.id}, an existing child of parentID:${song.parentID}`,
            };
        }
    })

    return {
        success: 1,
        message: "SUCCESS: All related versions were updated",
    };
}

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

// Request must include a song object in req.body.song
exports.addSong = (async function (req ,res) {
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

    // If the song has a parentID, other songs may need to be updated
    if (song.parentID) {
        const { success, message } = await updateSongVersions(db, newSongID, song.parentID, song.isParent);

        if (!success) {
            db.rollback();
            db.end();
            console.log(message);
            res.status(404).send({message});
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
    db.beginTransaction();
    let resultMessage = await SongSvc.updateSong(db, song, id);

    if (!resultMessage) {
        db.rollback();
        db.end();
        res.status(404).send({message: 'Failed to update song'});
        return null;
    }
    
    // If the song has a parentID, other songs may need to be updated
    if (song.parentID) {
        const { success, message } = await updateSongVersions(db, id, song.parentID, song.isParent);
        
        if (!success) {
            db.rollback();
            db.end();
            console.log(message);
            res.status(404).send({message});
        }
    }
    
    db.commit();
    db.end();
    res.status(200).send({ message: resultMessage});
    return true;
})
