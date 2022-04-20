function logError(functionName, message) {
        console.log("ERROR: " + functionName + " | " + message);
}

function logSuccess(functionName, message) {
    console.log(functionName + ": " + message);
}

/*
function logAPI(functionName, type, username, message) {
    console.log(functionName + "(" + type + "): " + username + " | " + message);
}
*/

module.exports = { logError, logSuccess };
