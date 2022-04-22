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

function addSong(path, name, tempo) {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `INSERT INTO songs (path, name, tempo) VALUES (?,?,?)`,
            [
                path,
                name,
                tempo ?? null
            ],
            (err, result) => {
                if (err) {
                    Logger.logError('addSong', err.sqlMessage ?? "Database Error, No message found");
                    db.rollback();
                    db.end();
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'addSong',
                        name + ' added to DB table (songs)' 
                    );
                    db.commit();
                    db.end();
                    resolve(result);
                }
            }
        );
    });
}

// TODO: needs tested
function addPlaylist(name) {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `INSERT INTO playlists (name) VALUES (?)`,
            [name],
            (err, result) => {
                if (err) {
                    Logger.logError('addSong', err.sqlMessage ?? "Database Error, No message found");
                    db.rollback();
                    db.end();
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'addPlaylist()',
                        name + ' added to DB table (playlists)' 
                    );
                    db.commit();
                    db.end();
                    resolve(result);
                }
            }
        );
    });
}

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

function getSongsByPlaylistID(playlistID) {
    return new Promise(async resolve => {
        const db = await createDBConnection();

        await db.query(
            `Select songs.id, songs.path, songs.name, songs.tempo, songs.artist from songs inner join songPlaylists on songs.id = songPlaylists.songID;`,
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

module.exports = { addSong, getAllSongs, getSongsByPlaylistID, getAllPlaylists, addPlaylist };
