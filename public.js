const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DatabaseLibrary = require('./lib/DatabaseLibrary.js');
const SongDatabaseLibrary = require('./lib/SongDatabaseLibrary.js');
const FileServerLibrary = require('./lib/FileServerLibrary.js');
const Logger = require('./utils/Logger.js');

router.get('/songs', async function (req, res) {
    const songs = await SongDatabaseLibrary.getAllSongs();
    
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
})

router.get('/images/:fileName', async function (req, res) {
    const song = await FileServerLibrary.getFile(req, res, '/images');
})

router.get('/songs/:fileName', async function (req, res) {
    const song = await FileServerLibrary.getFile(req, res, '/songs');
})

router.get('/playlists', async function (req, res) {
    const playlists = await SongDatabaseLibrary.getAllPlaylists();
    if(playlists) {
        res.status(200).send(playlists);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
    
})

router.post('/playlists', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const newPlaylistID = await SongDatabaseLibrary.addPlaylist(db, req.body.name);
    db.end();
    if(newPlaylistID) {
        res.status(200).send({'playlist': newPlaylistID});
        return true;
    } else {
        res.status(404).send({'message': "Couldn't get songs"});
        return false;
    }
})

router.get('/playlists/:playlistID', async function (req, res) {
    const songs = await SongDatabaseLibrary.getSongsByPlaylistID(req.params.playlistID);
    if(songs) {
        res.status(200).send(songs);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get songs"});
        return false;
    }
})


// ***** POST *****

/* Add songs to file server and database
* Optionally add them to playlists as well if ID's are provided
*
*/
router.post('/songs', async (req, res) => {
    
    const files = Object.values(req.files);
    const songs = await JSON.parse(req.body.songs);
    let errorEncountered = false;
    
    if (!files || !songs || (files.length !== songs.length)) {
        res.status(500).send({ message: "Data not formatted properly"});
    }

    let successes = [];
    let failures = [];
    const db = await DatabaseLibrary.connectToDB();
    
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let song = songs[i];
        let fileName = file ? file.name : null;
        let playlistIDs = song.playlistIDs;
        
        if (!fileName || !song) {
            errorEncountered = true;
            continue;
        }

        //  TODO: use transaction
        await db.beginTransaction();

        let newSongID = await SongDatabaseLibrary.addSong(
            '/' + fileName,
            song.name ?? null,
            song.tempo ?? null,
            db
        );
            
        if (newSongID.sqlMessage) {
            DatabaseLibrary.rollbackAndLog(db, failures, song.fileName, newSongID.sqlMessage, 'POST /songs');
            continue;
        }
        
        let newSongPlaylistID = null;
        if (playlistIDs) {
            for (let i = 0; i < playlistIDs.length; ++i) {
                newSongPlaylistID = await SongDatabaseLibrary.addSongPlaylist(
                    newSongID,
                    playlistIDs[i],
                    db
                );
                if (!newSongPlaylistID) {
                    break;
                }
            }
            if(!newSongPlaylistID) {
                DatabaseLibrary.rollbackAndLog(db, failures, song.fileName, newSongID.sqlMessage, '/songs');
                continue;
            }
        }

        let songAddedToFileServer = await FileServerLibrary.postFile(file, '/songs');
            
        if(!songAddedToFileServer) {
            DatabaseLibrary.rollbackAndLog(db, failures, song.fileName, 'Failed to upload song to file server', '/songs');
        } else {
            const message = song.name + ' fully uploaded!'
            DatabaseLibrary.commitAndLog(db, successes, song.fileName, message, '/songs')
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
        
// **** TEST *****
router.get('/test', function (req, res) {
    fs.access('/mnt/public-ext4/main/file.txt', fs.constants.W_OK, (err) => {
        if (err) {
            console.log("File cannot be written to");
            res.status(404).send('Failure');
        } else {
            console.log("File can be written to");
            res.status(200).send('Success');
        }
    });
})

// necessary with express.Router()
module.exports = router;