const express = require('express');
const router = express.Router();

// Import services
const AuthSvc = require('./services/Auth.js');

// Import route functions
const Songs = require('./routes/Songs.js');
const Playlists = require('./routes/Playlists.js');
const Users = require('./routes/Users.js');
const Auth = require('./routes/Auth.js');

// Root
router.get('/', (req, res) => {
  res.status(200).send('Welcome to the Audiofiler API');
});

// Songs
router.get('/songs', Songs.getSongs);
router.get('/songs/:id', Songs.getSongByID);
router.post('/songs', Songs.addSongToDB);
router.delete('/songs/:id', Songs.deleteSong);
router.get('/songs/playlist/:playlistID', Songs.getSongsByPlaylistID);
router.get('/songs/parent/:parentID', Songs.getSongsByParentID);

// Playlists
router.get('/playlists', Playlists.getPlaylists);
router.post('/playlists', Playlists.addPlaylist);
router.get('/playlists/:playlistID', Playlists.getPlaylist);
router.post('/playlists/:playlistID/song/:songID', Songs.addSongToPlaylist);

// Users
router.get('/users', Users.getUsers);
router.get('/users/:username', Users.getUserByUsername);
router.post('/users', Users.createUser);

// Auth
router.post('/authorize', Auth.authorize);
router.get('/authenticate', AuthSvc.verifyJWT, Auth.authenticate);

// necessary with express.Router()
module.exports = router;
