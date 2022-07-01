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

// Removes null properties from objects within an array
function deleteNullProperties (arrayOfObjects) {

    if (arrayOfObjects.length === 0) {
        return [];
    }
    // For each key in each object, remove it if null
    arrayOfObjects.forEach((object) => {
        Object.keys(object).forEach(key => {
            if (object[key] === null) {
              delete object[key];
            }
          });
    });

    return arrayOfObjects;
}

// Template for INSERT queries on our database
async function sqlInsert(db, table, cols, args = null) {

    if (!db || !table || !cols || !args) {
        return false;
    }

    return new Promise(async resolve => {
        await db.query(
            `INSERT INTO ${table} (${cols}) VALUES (${getQuestionMarks(args.length)})`,
            args,
            (err, result) => {
                if (err) {
                    Logger.logError('sqlInsert()', err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess('sqlInsert()', `id(${result.insertId}) added to ${table}`);
                    resolve(result.insertId);
                }
            }
        );
    });
}

// Template for SELECT queries on our database
function sqlSelect(db, table, cols, whereClause, args, multipleRows) {

    if (!db || !table || !cols) {
        return false;
    }

    // If only one of them is included
    if (!!whereClause + !!args == 1) {
        return false;
    }

    return new Promise(async resolve => {
        await db.query(
            `SELECT ${cols} FROM ${table} ${whereClause ?? ''};`,
            args ?? [],
            (err, rows) => {
                if (err) {
                    Logger.logError(`sqlSelect() on table: ${table}`, err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'sqlSelect()',
                        `Returned ${args ?? 'all rows'} from ${table}` 
                    );
                    const result = deleteNullProperties(rows);
                    resolve(multipleRows ? result : result[0]);
                }
            }
        );

    });
}

// Template for DELETE queries on our database
async function sqlDelete(db, table, whereClause, args) {

    if (!db || !table || !whereClause || !args) {
        return false;
    }

    return new Promise(async resolve => {
        await db.query(
            `DELETE FROM ${table} ${whereClause} LIMIT 1;`,
            args,
            (err, result) => {
                if (err) {
                    Logger.logError(`sqlDelete() on table: ${table}`, err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    Logger.logSuccess(
                        'sqlDelete()',
                        `Deleted ${args} from ${table}` 
                    );
                    resolve(result.affectedRows);
                }
            }
        );

    });
}

// TODO: make sure song parent still getting updated when necessary

/* Given: 
    [name, tempo, path]

   Returns:
    'name = ?, tempo = ?, path = ?'
*/
function getSQLStringToUpdateColumns(cols) {
    let str = '';
    for(let i = 0; i < cols.length; i += 1) {
        if (i != 0) {
            str += ', '
        }
        str += `${cols[i]} = ?`
    }
    return str;
}

// Template for UPDATE queries on our database
// Expects an object that has properties correlating to columns in the database
// Object must contain a row ID that exists in the table
// EXAMPLE: To update a song:
/*
    object = {
        name: 'new song name',
        tempo: '102'
    }
*/
async function sqlUpdate(db, table, whereClause, object, id) {

    if (!db || !table || !whereClause || !object || Object.keys(object).length === 0 || !id) {
        console.log('ERROR: Required fields to update not found');
        return false;
    }

    // Read object property names and values into arrays
    let colNames = Object.keys(object);
    let colValues = Object.values(object);

    return new Promise(async resolve => {
        await db.query(
            `UPDATE ${table} SET ${getSQLStringToUpdateColumns(colNames)} ${whereClause};`,
            [...colValues, id],
            (err, res) => {
                if (err) {
                    Logger.logError(`sqlUpdate() on table: ${table}`, err.sqlMessage ?? "Database Error, No message found");
                    resolve(false);
                } else {
                    message = `Updated ${colNames.join(', ')} for song ${id}`;
                    Logger.logSuccess(
                        'sqlUpdate()',
                        message 
                    );
                    resolve(message);
                }
            }
        );

    });
}

module.exports = { connectToDB, rollbackAndLog, commitAndLog, sqlInsert, sqlSelect, sqlUpdate, sqlDelete };
