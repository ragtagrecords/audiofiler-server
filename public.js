const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const AuthSvc = require('./services/Auth.js');
const DbSvc = require('./services/Db.js');
const SongSvc = require('./services/Songs.js');
const UserSvc = require('./services/Users.js');
const FileSvc = require('./services/Files.js');
const Logger = require('./utils/Logger.js');
    
const Songs = require('./routes/Songs.js');
const Users = require('./routes/Users.js');
const Auth = require('./routes/Auth.js');


// Songs
router.get('/songs', Songs.getSongs);

router.get('/songs/:fileName', Songs.getFile);

// Get JSON info for all playlists
router.get('/playlists', Songs.getPlaylists);

// Add a new row to the playlists table
router.post('/playlists', Songs.createPlaylist);

// Get JSON info for all songs in a playlist
router.get('/playlists/:playlistID', Songs.getSongsByPlaylistID);

router.post('/songs', Songs.uploadSong);

router.post('/playlists/:playlistID/song/:songID', Songs.addSongToPlaylist);

router.get('/users', Users.getUsers);

// user by username
router.get('/users/:username', Users.getUserByUsername);

router.post('/users', Users.createUser);

router.post('/authorize', Auth.authorize);

router.get('/authenticate', AuthSvc.verifyJWT, Auth.authenticate);

// necessary with express.Router()
module.exports = router;
