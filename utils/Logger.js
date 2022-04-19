function logError(fileName, message) {
    if (fileName && message) {
        console.log("ERROR: " + fileName + " | " + message);
    } else {
        console.log("ERROR: undefined issue in Logger.js");
    }
}

function logDatabaseSuccess(fileName, table, message) {
    console.log(fileName + "(" + table + "): " + message);
}

function logFileServer(fileName, message) {
    console.log(fileName + ": " + message);
}

/*
function logAPI(fileName, type, username, message) {
    console.log(fileName + "(" + type + "): " + username + " | " + message);
}
*/

module.exports = { logError, logDatabaseSuccess, logFileServer };
