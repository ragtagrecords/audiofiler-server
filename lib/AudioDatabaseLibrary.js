const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

function connectToDB() {
    const db = mysql.createConnection({
        user: "audiofiler-fs",
        host: "150.238.75.231",
        password: "weloveclouddatabasesolutions",
        database: "audiofiler"
    });

    if (db) {
        return db;
    } else {
        Logger.logError('connectToDB()', "Couldn't connect to database");
        return false;
    }
}

async function addAudioToDatabase(name, tempo, fileExtension) {
  
    const db = connectToDB();

    db.connect(function(err) {
        if (err) {
            Logger.logError('addAudioToDatabase', err.sqlMessage ?? "Failed to connect to database");
            return false;
        }
    });

    const fileNameWithExtension = name + fileExtension;

    db.query(
        `INSERT INTO audios (path, name, tempo) VALUES (?,?,?)`,
        [
            '/' + fileNameWithExtension,
            name, 
            tempo ?? null
        ],
        (err, result) => {
            if (err) {
                Logger.logError('addAudioToDatabase', err.sqlMessage ?? "Database Error, No message found");
                db.end();
                return false;
            } else {
                
                Logger.logDatabaseSuccess('addAudioToDatabase', 'audios', fileNameWithExtension + ' added to database');
                Logger.logSuccess(
                    'addAudioToDatabase',
                    fileNameWithExtension + ' added to DB table (audios)' 
                );
                db.end();
                return true;
            }
        }
    );
}

module.exports = { addAudioToDatabase };