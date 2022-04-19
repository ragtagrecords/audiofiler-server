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
        if (err) throw err;
        console.log("Connected!");
    });

    db.query(
        `INSERT INTO audios (path, name, tempo) VALUES (?,?,?)`,
        [
            '/' + name + '.' + fileExtension, 
            name, 
            tempo ?? null
        ],
        (err, result) => {
            if (err) {
                Logger.logError(CURR_FILE, err.sqlMessage ?? "Database Error, No message found");
            } else {
                Logger.logDatabase(CURR_FILE, 'audios', result);
            }
        }
    );

    db.end();
}

module.exports = { addAudioToDatabase };