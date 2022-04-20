const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

const rootURL = 'http://api.ragtagrecords.com/public/songs';

function createDBConnection() {
    const db = mysql.createConnection({
        user: "audiofiler-fs",
        host: "150.238.75.231",
        password: "weloveclouddatabasesolutions",
        database: "audiofiler"
    });

    if (db) {
        return db;
    } else {
        Logger.logError('createDBConnection()', "Couldn't connect to database");
        return false;
    }
}

function addSong(path, name, tempo) {
    return new Promise(resolve => {
        const db = createDBConnection();

        db.connect(function(err) {
            if (err) {
                Logger.logError('addSong', err.sqlMessage ?? "Failed to connect to database");
                resolve(false);
            }
        });

        db.query(
            `INSERT INTO songs (path, name, tempo) VALUES (?,?,?)`,
            [
                path,
                name,
                tempo ?? null
            ],
            (err, result) => {
                if (err) {
                    Logger.logError('addSong', err.sqlMessage ?? "Database Error, No message found");
                    db.end();
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'addSong',
                        name + ' added to DB table (songs)' 
                    );
                    db.end();
                    resolve(result);
                }
            }
        );
    });
}

function getAllSongs() {
    return new Promise(resolve => {
        const db = createDBConnection();

        db.connect(function(err) {
            if (err) {
                Logger.logError('getAllSongs()', err.sqlMessage ?? "Failed to connect to database");
                resolve(false);
            }
        });

        db.query(
            `SELECT * FROM songs`,
            [],
            (err, songs) => {
                if (err) {
                    Logger.logError('getAllSongs()', err.sqlMessage ?? "Database Error, No message found");
                    db.end();
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getAllSongs',
                        'Returned all songs from database' 
                    );
                    db.end();
                    let songsFormatted = { };
                    let i = 0;
                    songs.forEach(song => {
                        songsFormatted[i] = {
                            name: song.name,
                            path: rootURL + song.path
                        };
                        ++i;
                    });
                    resolve(songsFormatted);
                }
            }
        );

    });
}

module.exports = { addSong, getAllSongs };