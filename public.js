const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DatabaseLibrary = require('./lib/DatabaseLibrary.js');
const SongDatabaseLibrary = require('./lib/SongDatabaseLibrary.js');
const UserDatabaseLibrary = require('./lib/UserDatabaseLibrary.js');
const FileServerLibrary = require('./lib/FileServerLibrary.js');
const Logger = require('./utils/Logger.js');

router.get('/songs', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const songs = await SongDatabaseLibrary.getAllSongs(db);
    db.end();
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

// Get JSON info for all playlists
router.get('/playlists', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const playlists = await SongDatabaseLibrary.getAllPlaylists(db);
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


// Get JSON info for all songs in a playlist
router.get('/playlists/:playlistID', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const songs = await SongDatabaseLibrary.getSongsByPlaylistID(db, req.params.playlistID);
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

        await db.beginTransaction();

        let newSongID = await SongDatabaseLibrary.addSong(
            db,
            '/' + fileName,
            song.name ?? null,
            song.tempo ?? null
        );
            
        if (newSongID.sqlMessage) {
            DatabaseLibrary.rollbackAndLog(db, failures, song.fileName, newSongID.sqlMessage, 'POST /songs');
            continue;
        }
        
        let newSongPlaylistID = null;
        if (playlistIDs) {
            for (let i = 0; i < playlistIDs.length; ++i) {
                newSongPlaylistID = await SongDatabaseLibrary.addSongPlaylist(
                    db,
                    newSongID,
                    playlistIDs[i]
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

router.get('/users', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const users = await UserDatabaseLibrary.getAllUsers(db);
    db.end();
    if(users) {
        res.status(200).send(users);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get users"});
        return false;
    }
})

// user by username
router.get('/users/:username', async function (req, res) {
    const db = await DatabaseLibrary.connectToDB();
    const user = await UserDatabaseLibrary.getUserByUsername(db, req.params.username);
    db.end();
    if(user) {
        res.status(200).send(user);
        return true;
    } else {
        res.status(404).send({ message: "Couldn't get user"});
        return false;
    }
})

router.post('/signup', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const hashAndSalt = UserDatabaseLibrary.hashPassword(password);
    const db = await DatabaseLibrary.connectToDB();
    const newUser = UserDatabaseLibrary.addUser(db, username, hashAndSalt.hash, hashAndSalt.salt);
    console.log(newUser);
    if(newUser) {
        res.status(200).send("success");
        return true;
    } else {
        res.status(404).send({ message: "Fail"});
        return false;
    }

})

router.post('/login', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const db = await DatabaseLibrary.connectToDB();

    const user = await UserDatabaseLibrary.validateUser(db, username, password);
    db.end();

    if (!user) {
        console.log("invalid user");
        res.status(404).send({ message: "Invalid credentials"});
        return false;
    } else {
        res.status(200).send("success");
        return true;
    }

})

// necessary with express.Router()
module.exports = router;
