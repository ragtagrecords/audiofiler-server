function logError(fileName, error, message) {
    if (message) {
        console.log("ERROR: " + fileName + " | " + message);
    }
    console.log(error);
}

function logDatabase(fileName, table, result) {
    console.log(fileName + "(" + table + "): " + result);
}

function logFileServer(fileName, message) {
    console.log(fileName + ": " + message);
}

/*
function logAPI(fileName, type, username, message) {
    console.log(fileName + "(" + type + "): " + username + " | " + message);
}
*/

module.exports = { logError, logDatabase, logFileServer };
