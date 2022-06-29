const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const { sqlInsert } = require('../services/Db.js');

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
                  resolve(playlists);
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
          (err, playlists) => {
              if (err) {
                  Logger.logError('getPlaylistsByID()', err.sqlMessage ?? "Database Error, No message found");
                  resolve(false);
              } else {
                  Logger.logSuccess(
                      'getPlaylistByID()',
                      `Returned playlist ${id} from database` 
                  );
                  resolve(playlists[0]);
              }
          }
      );

  });
}

async function addPlaylist(db, name) {

  if(!db || !name) {
      return false;
  }

  return sqlInsert(
      db,
      'playlists',
      [name]
  );
}

module.exports = { 
  getPlaylistByID, 
  getAllPlaylists, 
  addPlaylist,
};