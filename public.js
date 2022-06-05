const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


const AuthSvc = require('./services/AuthSvc.js');
const DbSvc = require('./services/DbSvc.js');
const SongSvc = require('./services/SongSvc.js');
const UserSvc = require('./services/UserSvc.js');
const FileSvc = require('./services/FileSvc.js');
const Logger = require('./utils/Logger.js');

router.get('/songs', async function (req, res) {
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

router.get('/images/:fileName', async function (req, res) {
    const song = await FileSvc.getFile(req, res, '/images');
})

router.get('/songs/:fileName', async function (req, res) {
    const song = await FileSvc.getFile(req, res, '/songs');
})

// Get JSON info for all playlists
router.get('/playlists', async function (req, res) {
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
router.post('/playlists', async function (req, res) {
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
router.get('/playlists/:playlistID', async function (req, res) {
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
router.post('/songs', async (req, res) => {
    
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

router.get('/users', async function (req, res) {
    const db = await DbSvc.connectToDB();
    const users = await UserSvc.getAllUsers(db);
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
    const db = await DbSvc.connectToDB();
    const user = await UserSvc.getUserByUsername(db, req.params.username);
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
    const hashAndSalt = AuthSvc.hashPassword(password);
    const db = await DbSvc.connectToDB();
    const newUserID = UserSvc.addUser(db, username, hashAndSalt.hash, hashAndSalt.salt);

    if(!newUserID) {
        res.status(404).json({
            auth: false,
            added: false,
        });
        return false;
    }

    const user = await UserSvc.getUserByUsername(db, username);
    const token = await AuthSvc.validateUser(db, username, password, user);

    if (!token) {
        res.status(404).json({
            auth: false,
            added: true,
        });
        return false;
    } else {
        res.status(200).json({
            auth: true,
            token: token,
            result: user,
            added: true,
        });
        return true;
    }
})

router.post('/login', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    const db = await DbSvc.connectToDB();
    const user = await UserSvc.getUserByUsername(db, username);
    const token = await AuthSvc.validateUser(db, username, password, user);
    db.end();

    if (!token) {
        res.status(404).json({
            auth: false,
        });
        return false;
    } else {
        res.status(200).json({
            auth: true,
            token: token,
            result: user
        });
        return true;
    }
})

router.get('/authenticate', AuthSvc.verifyJWT, async function (req, res) {
    if(!req.userID) {
        res.status(404).send({
            auth: false,
        });
        return false;
    } else {
        res.status(200).send({
            auth: true,
            userID: req.userID,
        });
        return true;
    }
})

// necessary with express.Router()
module.exports = router;
