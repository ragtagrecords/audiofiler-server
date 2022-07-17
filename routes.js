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
router.post('/songs', Songs.addSong);
router.get('/songs', Songs.getSongs);
router.get('/songs/:id', Songs.getSongByID);
router.get('/songs/playlist/:playlistID', Songs.getSongsByPlaylistID);
router.get('/songs/parent/:parentID', Songs.getSongsByParentID);
router.put('/songs/:id', Songs.updateSong);
router.delete('/songs/:id', Songs.deleteSongByID);

// Playlists
router.get('/playlists', Playlists.getPlaylists);
router.get('/playlists/:playlistID', Playlists.getPlaylist);
router.get('/playlists/song/:songID', Playlists.getPlaylistsBySongID);
router.post('/playlists', Playlists.addPlaylist);
router.post('/playlists/:playlistID/song/:songID', Playlists.addSongToPlaylist);
router.delete('/playlists/:playlistID/song/:songID', Playlists.deleteSongFromPlaylist);
router.put('/playlists/:id', Playlists.updatePlaylist);

// Users
router.get('/users', Users.getUsers);
router.get('/users/:username', Users.getUserByUsername);
router.post('/users', Users.createUser);

// Auth
router.post('/authorize', Auth.authorize);
router.get('/authenticate', AuthSvc.verifyJWT, Auth.authenticate);

// necessary with express.Router()
module.exports = router;
