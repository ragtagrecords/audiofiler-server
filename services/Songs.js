const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const { sqlInsert, sqlSelect } = require('../services/Db.js');

const allSongColumns = 'songs.id, songs.name, songs.path, songs.artist,'
    + 'songs.tempo, songs.createTimestamp, songs.isParent, songs.parentID, songs.zipPath';

async function addSong(db, song) {
    const { path, name, tempo, artist, isParent, parentID, zipPath } = song;

    if (!path || !name) {
        return false;
    }

    return sqlInsert(
        db,
        'songs',
        [
            path,
            name,
            tempo ? tempo : null,
            artist ? artist : null,
            isParent ? isParent : null,
            parentID ? parentID: null,
            zipPath ? zipPath : null,
        ]
    );
}

async function addSongToPlaylist(db, songID, playlistID, order = null) {

    if(!db || !songID || !playlistID) {
        return false;
    }

    return sqlInsert(
        db,
        'songPlaylists',
        [
            songID,
            playlistID,
            order
        ]
    );
}

async function getSongByID(db, id) {
    if (!db || !id) {
        return false;
    }

    return sqlSelect(
        db,
        'songs',
        'WHERE id = ?',
        id,
        false
    );
}

async function getSongsByPlaylistID(db, id) {
    if (!db || !id) {
        return false;
    }

    return sqlSelect(
        db,
        'songs',
        'INNER JOIN songPlaylists ON songs.id = songPlaylists.songID WHERE songPlaylists.playlistID = ?',
        id,
        true,
    );
}

async function getSongsByParentID(db, id) {
    if (!db || !id) {
        return false;
    }

    return sqlSelect(
        db,
        'songs',
        'WHERE songs.parentID = ?',
        id,
        true,
    );
}

// TODO: Abstract these functions into a single getAllRows(tableName) func
function getAllSongs(db) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT ${allSongColumns}
            FROM songs`,
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
                    resolve(songs);
                }
            }
        );

    });
}

function deleteSong(db, id) {
    if (!id) {
        return false;
    }

    return new Promise(async resolve => {
        await db.query(
            `DELETE FROM songs WHERE id=?`,
            [id],
            (err, result) => {
                if (err) {
                    Logger.logError('deleteSong()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(err);
                } else {
                    Logger.logSuccess(
                        'deleteSong()',
                        `Song ${id} deleted` 
                    );
                    resolve(true);
                }
            }
        );
    });
}









// eventually make this updateSong - all the columns
function updateSongParent(db, parentSong) {
    return new Promise(async resolve => {
        const { isParent, parentID, id } = parentSong;
        await db.query(
            `UPDATE songs 
            SET isParent = ?, parentID = ?
            WHERE id = ?;`,
            [isParent, parentID, id],
            (err, res) => {
                if (err) {
                    Logger.logError('updateSongParent()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'updateSongParent()',
                        `Updated parent: ${parentSong.name}`
                    );
                    resolve(true);
                }
            }
        );
    });
}

module.exports = { 
    addSong, 
    addSongToPlaylist, 
    getSongByID,
    getSongsByPlaylistID, 
    getSongsByParentID,
    getAllSongs, 
    updateSongParent,
    deleteSong
};
