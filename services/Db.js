const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

/* Defines what columns we use for queries on a given table */

// Songs
const insertSongsColumns = 'songs.path, songs.name, songs.tempo, songs.artist,'
    + 'songs.isParent, songs.parentID, songs.zipPath';
const selectSongsColumns = 'songs.id, songs.createTimestamp, ' + insertSongsColumns;

// Playlists
const insertPlaylistsColumns = 'playlists.name';
const selectPlaylistsColumns = 'playlists.id, '+ insertPlaylistsColumns;

// SongPlaylists
const insertSongPlaylistsColumns = 'songPlaylists.songID, songPlaylists.playlistID, songPlaylists.order';
const selectSongPlaylistsColumns = 'songPlaylists.id, ' + insertSongPlaylistsColumns;

// Users
const insertUsersColumns = 'users.username, users.hashedPassword, users.salt';
const selectUsersColumns = 'users.id, users.createTimestamp, ' + insertUsersColumns;

async function connectToDB() {
    const db = await mysql.createConnection({
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

// TRANSACTIONS
async function rollbackAndLog(db, failures, fileName, errMessage, funcName) {
    await db.rollback();
    failures.push({
        'fileName': fileName,
        'err': errMessage
    });
    Logger.logError(funcName, errMessage);
}

async function commitAndLog(db, successes, fileName, message, funcName) {
    await db.commit();
    successes.push({
        'fileName': fileName,
        'err': message
    });
    Logger.logSuccess(funcName, message)
}

// UTILS
function getColumns(table, type) {
    switch (table) {
        case 'songs':
            return type === 'INSERT' ? insertSongsColumns : selectSongsColumns;
        case 'playlists':
            return type === 'INSERT' ? insertPlaylistsColumns : selectPlaylistsColumns;
        case 'songPlaylists':
            return type === 'INSERT' ? insertSongPlaylistsColumns : selectSongPlaylistsColumns;
        case 'users':
            return type === 'INSERT' ? insertUsersColumns : selectUsersColumns;
    }
}

function getQuestionMarks(count) {
    if (count <= 0) {
        return '';
    }
    let str = '?';
    for (let i = 0; i < count - 1; i += 1) {
        str += ',?';
    }
    return str;
}

// QUERIES
function sqlInsert(db, table, params = null) {
    const columns = getColumns(table, 'INSERT');

    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO ${table} (${columns}) VALUES (${getQuestionMarks(params.length)})`,
            [...params],
            (err, result) => {
                if (err) {
                    Logger.logError('sqlInsert()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess('sqlInsert()', `id(${result.insertId}) added to ${table})`);
                    resolve(result.insertId);
                }
            }
        );
    });
}

function sqlSelect(db, table, whereClause, id, multipleRows) {
    const columns = getColumns(table, 'SELECT');

    return new Promise(async resolve => {
        await db.query(
            `SELECT ${columns}
            FROM ${table} 
            ${whereClause};`,
            [id],
            (err, rows) => {
                if (err) {
                    Logger.logError(`sqlSelect() on table: ${table}`, err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'sqlSelect()',
                        `Returned id(${id}) from ${table}` 
                    );
                    resolve(multipleRows ? rows : rows[0]);
                }
            }
        );

    });
}

module.exports = { connectToDB, rollbackAndLog, commitAndLog, sqlInsert, sqlSelect };
