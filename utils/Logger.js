function logError(functionName, message) {
        console.log("ERROR: " + functionName + " | " + message);
}

function logSuccess(functionName, message) {
    console.log('SUCCESS: ' + functionName + " | " + message);
}

module.exports = { logError, logSuccess };
