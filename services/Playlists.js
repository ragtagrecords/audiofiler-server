const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const { sqlInsert, sqlSelect } = require('../services/Db.js');

// Playlists
const defPlaylistsColumns = ['playlists.name'];
const allPlaylistsColumns = [...defPlaylistsColumns, 'playlists.id'];

// SongPlaylists
const defSongPlaylistsColumns = [
    'songPlaylists.songID',
    'songPlaylists.playlistID',
    'songPlaylists.order'
];
const allSongPlaylistsColumns = [...defSongPlaylistsColumns, 'songPlaylists.id'];

async function getPlaylists(db) {
    if (!db) {
        return false;
    }

    return sqlSelect(
        db,
        'playlists',
        allPlaylistsColumns,
        null,
        null,
        true,
    );
}

async function getPlaylistByID(db, id) {
    if (!db || !id) {
        console.log('ERROR: Playlist ID required');
        return false;
    }

    return sqlSelect(
        db,
        'playlists',
        allPlaylistsColumns,
        'WHERE id = ?',
        [id],
        false
    );
}

async function addPlaylist(db, name) {

    if(!db || !name) {
        console.log('ERROR: Playlist name required');
        return false;
    }

    return sqlInsert(
        db,
        'playlists',
        defPlaylistsColumns,
        [name]
    );
}

async function addSongToPlaylist(db, songID, playlistID, order = null) {

    if(!db || !songID || !playlistID) {
        console.log('ERROR: songID and playlistID required');
        return false;
    }

    return sqlInsert(
        db,
        'songPlaylists',
        defSongPlaylistsColumns,
        [
            songID,
            playlistID,
            order
        ]
    );
}

module.exports = { 
  getPlaylistByID, 
  getPlaylists, 
  addPlaylist,
  addSongToPlaylist
};