const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const { sqlInsert, sqlSelect, sqlDelete, sqlUpdate } = require('../services/Db.js');

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

async function getPlaylistsBySongID(db, songID) {
    if (!db || !songID) {
        console.log('ERROR: Song ID required');
        return false;
    }

    return sqlSelect(
        db,
        'playlists',
        allPlaylistsColumns,
        'INNER JOIN songPlaylists ON playlists.id = songPlaylists.playlistID WHERE songPlaylists.songID = ?',
        [songID],
        true
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

async function deleteSongFromPlaylist(db, songID, playlistID) {
    if (!db || !songID || !playlistID) {
        console.log(`ERROR: ID's required for song and playlist`);
        return false;
    }

    return sqlDelete(
        db,
        'songPlaylists',
        'WHERE songID = ? AND playlistID = ?',
        [songID, playlistID]
    );
}

async function updatePlaylistName(db, playlistID, newName) {
    if (!db || !playlistID || !newName) {
        console.log(`ERROR: Playlist ID and new playlist name are required`);
        return false;
    }

    // return sqlUpdate(
    //     db,
    //     'playlists',

    // )


    return new Promise(async resolve => {
        db.query(
            "UPDATE playlists SET name = ? WHERE id = ?",
            [newName, playlistID],
            (err, result) => {
                if (err)
                {
                    console.log(err);
                    resolve(false);
                } else {
                    console.log(result);
                    resolve(result);
                }
            }
        );
    })
}

module.exports = { 
    getPlaylists,
    getPlaylistByID,
    getPlaylistsBySongID, 
    addPlaylist,
    addSongToPlaylist,
    deleteSongFromPlaylist,
    updatePlaylistName
};