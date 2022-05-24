const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const Logger = require('../utils/Logger.js');

const rootURL = 'http://api.ragtagrecords.com/public/songs';

function formatSongsJSON(songs) {
    let songsFormatted = [];
    let i = 0;
    songs.forEach(song => {
        const songFormatted = {
            id: song.id,
            name: song.name,
            path: rootURL + song.path,
            artist: song.artists ? song.artist : '',
            tempo: song.tempo ? song.tempo : ''
        };

        songsFormatted.push(songFormatted);
    });
    return songsFormatted;
}

// TODO: convert rest of functions in public.js to use DatabaseLibrary::connectToDB() instead of this
async function createDBConnection() {
    const db = await mysql.createConnection({
        user: "audiofiler-fs",
        host: "150.238.75.231",
        password: "weloveclouddatabasesolutions",
        database: "audiofiler"
    });

    if (db) {
        await db.beginTransaction()
        return db;
    } else {
        Logger.logError('createDBConnection()', "Couldn't connect to database");
        return false;
    }
}

function addSong(path, name, tempo, db) {
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

function addSongPlaylist(songID, playlistID, db) {

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
                    Logger.logError('addSong', err.sqlMessage ?? "Database Error, No message found");
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

// TODO: probably should change this to work like getSongs and getSongPlaylists
// basically stop creating/ending/rollback db connection here
function getAllSongs() {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `SELECT * FROM songs`,
            [],
            (err, songs) => {
                if (err) {
                    Logger.logError('getAllSongs()', err.sqlMessage ?? "Database Error, No message found");
                    db.rollback();
                    db.end();
                    resolve(false);
                } else {
                    db.commit();
                    db.end();

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

// TODO: probably should change this to work like getSongs and getSongPlaylists
// basically stop creating/ending/rollback db connection here
function getAllPlaylists() {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `SELECT * FROM playlists`,
            [],
            (err, songs) => {
                if (err) {
                    Logger.logError('getAllPlaylists()', err.sqlMessage ?? "Database Error, No message found");
                    db.rollback();
                    db.end();
                    resolve(false);
                } else {
                    db.commit();
                    db.end();

                    Logger.logSuccess(
                        'getAllPlaylists()',
                        'Returned all playlists from database' 
                    );
                    
                    resolve(formatSongsJSON(songs));
                }
            }
        );

    });
}


// TODO: probably should change this to work like getSongs and getSongPlaylists
// basically stop creating/ending/rollback db connection here
function getSongsByPlaylistID(playlistID) {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `SELECT songs.id, songs.path, songs.name, songs.tempo, songs.artist, songPlaylists.playlistID
            FROM songs
            INNER JOIN songPlaylists ON songs.id = songPlaylists.songID
            WHERE songPlaylists.playlistID = ?;`,
            [playlistID],
            (err, songs) => {
                if (err) {
                    Logger.logError('getSongsByPlaylist()', err.sqlMessage ?? "Database Error, No message found");
                    db.rollback();
                    db.end();
                    resolve(false);
                } else {
                    db.commit();
                    db.end();

                    Logger.logSuccess(
                        'getSongsByPlaylist()',
                        'Returned playlist ' + playlistID + ' successfully' 
                    );
                    
                    resolve(formatSongsJSON(songs));
                }
            }
        );
    });
}

module.exports = { addSong, getAllSongs, getSongsByPlaylistID, getAllPlaylists, addPlaylist, addSong, addSongPlaylist };
