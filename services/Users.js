const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const { sqlInsert, sqlSelect } = require('../services/Db.js');

// Users
const defaultColumns = [
    'users.username',
    'users.hashedPassword',
    'users.salt'
];
const allColumns = [
    ...defaultColumns,
    'users.id',
    'users.createTimestamp'
];

async function getAllUsers(db) {
    if (!db) {
        return false;
    }

    return sqlSelect(
        db,
        'users',
        allColumns,
        null,
        null,
        true
    );
}

async function getUserByUsername(db, username) {
    if (!db || !username) {
        console.log('ERROR: Username required');
        return false;
    }

    return sqlSelect(
        db,
        'users',
        allColumns,
        'WHERE username = ?',
        [username],
        false
    );
}
function addUser(db, username, hash, salt) {
    if(!db || !username || !hash || !salt) {
        console.log('ERROR: Username, hash, and salt are required');
        return false;
    }
  
    return sqlInsert(
        db,
        'users',
        defaultColumns
        [username, hash, salt]
    );
}



module.exports = { getAllUsers, getUserByUsername, addUser};
