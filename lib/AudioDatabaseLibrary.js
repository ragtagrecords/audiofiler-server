const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

const CURR_FILE = 'AudioDatabaseLibrary';

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
        Logger.logError(CURR_FILE, "Couldn't connect to database");
        return null;
    }
}

function addAudioToDatabase(name, tempo, fileExtension) {
  
    const db = connectToDB();

    db.connect(function(err) {
        if (err) {
            Logger.logError(CURR_FILE, err.sqlMessage ?? "Failed to connect to database");
            return null;
        }
    });

    fileNameWithExtension = name + fileExtension;
    db.query(
        `INSERT INTO audios (path, name, tempo) VALUES (?,?,?)`,
        [
            '/' + fileNameWithExtension,
            name, 
            tempo ?? null
        ],
        (err, result) => {
            if (err) {
                console.log('hello world');
                Logger.logError(CURR_FILE, err.sqlMessage ?? "Database Error, No message found");
            } else {
                Logger.logDatabase(CURR_FILE, 'audios', fileNameWithExtension + 'added to database');
            }
        }
    );

    db.end();
}

module.exports = { addAudioToDatabase };