const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const Logger = require('../utils/Logger.js');

const rootURL = 'http://api.ragtagrecords.com/public/songs';

function formatSongsJSON(songs) {
    let songsFormatted = { };
    let i = 0;
    songs.forEach(song => {
        songsFormatted[i] = {
            name: song.name,
            path: rootURL + song.path
        };
        ++i;
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

module.exports = { addSong, getAllSongs };