const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

// all paths stored in DB are relative to this URL
const rootURL = 'http://api.ragtagrecords.com/public/songs';

// Update songFormatted when we want additional rows from DB
function formatSongsJSON(songs) {
    let songsFormatted = [];
    songs.forEach(song => {
        const songFormatted = {
            id: song.id,
            name: song.name,
            path: rootURL + song.path,
            artist: song.artists ?? '',
            tempo: song.tempo ?? '',
            createTimestamp: song.createTimestamp ?? ''
        };

        songsFormatted.push(songFormatted);
    });
    return songsFormatted;
}

function formatPlaylistsJSON(playlists) {
    let playlistsFormatted = [];

    playlists.forEach(playlist => {
        const playlistFormatted = {
            id: playlist.id,
            name: playlist.name
        };

        playlistsFormatted.push(playlistFormatted);
    });
    return playlistsFormatted;
}

function addSong(db, path, name, tempo) {
    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO songs (path, name, tempo) VALUES (?,?,?)`,
            [
                path,
                name,
                tempo ?? null
            ],
            (err, result) => {
                if (err) {
                    Logger.logError('addSong()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(err);
                } else {
                    Logger.logSuccess('addSong()', name + ' added to DB table (songs)');
                    resolve(result.insertId);
                }
            }
        );
    });
}

function addSongPlaylist(db, songID, playlistID) {

    if(!songID || !playlistID || !db) {
        return false;
    }
    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO songPlaylists (songID, playlistID) VALUES (?,?)`,
            [
                songID,
                playlistID
            ],
            (err, result) => {
                if (err) {
                    Logger.logError('addSongPlaylist()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(err);
                } else {
                    Logger.logSuccess(
                        'addSongPlaylist()',
                        songID + ' added to DB table (songPlaylist)' 
                    );
                    resolve(result.insertId);
                }
            }
        );
    });
}

function addPlaylist(db, name) {
    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO playlists (name) VALUES (?)`,
            [name],
            (err, result) => {
                if (err) {
                    Logger.logError('addPlaylist()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'addPlaylist()',
                        name + ' added to DB table (playlists)' 
                    );
                    resolve(result.insertId);
                }
            }
        );
    });
}

function getAllSongs(db) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT * FROM songs`,
            [],
            (err, songs) => {
                if (err) {
                    Logger.logError('getAllSongs()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getAllSongs',
                        'Returned all songs from database' 
                    );
                    resolve(formatSongsJSON(songs));
                }
            }
        );

    });
}

function getAllPlaylists(db) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT * FROM playlists`,
            [],
            (err, playlists) => {
                if (err) {
                    Logger.logError('getAllPlaylists()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getAllPlaylists()',
                        'Returned all playlists from database' 
                    );
                    resolve(formatPlaylistsJSON(playlists));
                }
            }
        );

    });
}

function getPlaylistByID(db, id) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT * FROM playlists WHERE id = ?;`,
            [id],
            (err, playlist) => {
                if (err) {
                    Logger.logError('getAllPlaylists()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getAllPlaylists()',
                        `Returned playlist ${id} from database` 
                    );
                    resolve(formatPlaylistsJSON(playlist)[0]);
                }
            }
        );

    });
}

function getSongsByPlaylistID(db, id) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT songs.id, songs.name, songs.path, songs.artist, songs.tempo, songs.createTimestamp 
            FROM songs
            INNER JOIN songPlaylists ON songs.id = songPlaylists.songID
            WHERE songPlaylists.playlistID = ?;`,
            [id],
            (err, songs) => {
                if (err) {
                    Logger.logError('getSongsByPlaylist()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getSongsByPlaylist()',
                        `Returned songs from playlist ${id}`
                    );
                    resolve(formatSongsJSON(songs));
                }
            }
        );
    });
}

module.exports = { addSong, getAllSongs, getSongsByPlaylistID, getPlaylistByID, getAllPlaylists, addPlaylist, addSong, addSongPlaylist };