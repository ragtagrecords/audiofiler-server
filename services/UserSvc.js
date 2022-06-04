const mysql = require('mysql');
const Logger = require('../utils/Logger.js');

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
            (err, users) => {
                if (err) {
                    Logger.logError('getUserByUsername()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'getUserByUsername',
                        'Returned user from database' 
                    );
                    const jsonUsers = formatUsersJSON(users); 
                    resolve(jsonUsers[0]);
                }
            }
        );

    });
}

function addUser(db, username, hash, salt) {
    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO users (username, hashedPassword, salt) VALUES (?,?,?)`,
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
                    Logger.logSuccess('addUser()', username + ' added to DB table (users)');
                    resolve(result.insertId);
                }
            }
        );
    });
}



module.exports = { getAllUsers, getUserByUsername, addUser};
