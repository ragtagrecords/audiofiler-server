const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

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

module.exports = { connectToDB, rollbackAndLog, commitAndLog };
