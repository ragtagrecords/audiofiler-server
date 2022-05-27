const mysql = require('mysql');
const Logger = require('../utils/Logger.js');
const crypto = require('crypto');

// Update userFormatted when we want additional rows from DB
function formatUsersJSON(users) {
    let usersFormatted = [];
    users.forEach(user => {
        const userFormatted = {
            id: user.id,
            username: user.username,
            createTimestamp: user.createTimestamp ?? '',
            hashedPassword: user.hashedPassword,
            salt: user.salt,
        };

        usersFormatted.push(userFormatted);
    });
    return usersFormatted;
}

function getAllUsers(db) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT * FROM users`,
            [],
            (err, users) => {
                if (err) {
                    Logger.logError('getAllUsers()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getAllUsers',
                        'Returned all users from database' 
                    );
                    resolve(formatUsersJSON(users));
                }
            }
        );

    });
}

function getUserByUsername(db, username) {
    return new Promise(async resolve => {
        await db.query(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err, user) => {
                if (err) {
                    Logger.logError('getUserByUsername()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getUserByUsername',
                        'Returned user from database' 
                    );
                    resolve(formatUsersJSON(user));
                }
            }
        );

    });
}

function addUser(db, username, hash, salt) {
    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO users (ussername, password) VALUES (?,?)`,
            [
                username,
                hash,
                salt
            ],
            (err, result) => {
                if (err) {
                    Logger.logError('addUser()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(err);
                } else {
                    Logger.logSuccess('addUser()', name + ' added to DB table (users)');
                    resolve(result.insertId);
                }
            }
        );
    });
}

function hashPassword(password){
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    let hashSalt = {
        salt: salt,
        hash: hash,
    };
    return hashSalt;
}

function validatePassword(password){
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === hash;
}

function validateUser(username, password){
    const user = getUserByUsername(username);
}

module.exports = { getAllUsers, getUserByUsername, addUser, hashPassword };
