const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import services
const AuthSvc = require('./services/Auth.js');

// Import route functions
const Songs = require('./routes/Songs.js');
const Users = require('./routes/Users.js');
const Auth = require('./routes/Auth.js');

// Songs
router.get('/songs', Songs.getSongs);
router.post('/songs', Songs.uploadSong);
router.get('/songs/:fileName', Songs.getFile);
router.get('/songs/:id/zip', Songs.getZipFile);
router.get('/songs/parent/:parentID', Songs.getSongsByParentID);
router.put('/songs/:id', Songs.updateSongData);

// Playlists
router.get('/playlists', Songs.getPlaylists);
router.post('/playlists', Songs.createPlaylist);
router.get('/playlists/:playlistID', Songs.getSongsByPlaylistID);
router.post('/playlists/:playlistID/song/:songID', Songs.addSongToPlaylist);
router.put('/playlists/:id', Songs.updatePlaylistData);

// Users
router.get('/users', Users.getUsers);
router.get('/users/:username', Users.getUserByUsername);
router.post('/users', Users.createUser);

// Auth
router.post('/authorize', Auth.authorize);
router.get('/authenticate', AuthSvc.verifyJWT, Auth.authenticate);

// necessary with express.Router()
module.exports = router;
