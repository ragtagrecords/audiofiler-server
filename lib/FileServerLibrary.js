const fs = require('fs');
const path = require('path');
const Logger = require('../utils/Logger.js');


// files that are accessible via API live in /public
const rootDir = path.join(__dirname) + '/../public';
const CURR_FILE = 'FileServerLibrary'

function getDirectory(req, res, relativePath) {
    const dirPath = rootDir + relativePath;

    options = {
        withFileTypes: true
    }

    let fileNames = [];
    try {
        fileNames = fs.readdirSync(dirPath, options);
    } catch (error) {
        Logger.logError(CURR_FILE, error, "Directory " + dirPath + " not found");
        res.status(404).send('Directory not found');
        return null;
    }

    response = { };

    // TODO: use actual ID from database, not i
    for (let i = 0; i < fileNames.length; ++i) {
        response[i] = fileNames[i].name;
    }

    const isEmpty = Object.keys(response).length === 0;
    if (isEmpty){
        Logger.logError(CURR_FILE, "Failed to parse" + dirPath + " fileNames into response");
        res.status(404).send('Failed to return file names');
        return null;
    }

    res.send(response);
    Logger.logFileServer(CURR_FILE, 'Sent ' + relativePath );
}

function getFile(req, res, dir) {
    var options = {
        root: rootDir + dir + '/'
    };

    const fileName = req.params.fileName;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            Logger.logError(CURR_FILE, err);
        } else {
            Logger.logFileServer(CURR_FILE, 'Sent ' + fileName);
        }
    });
}

// TODO: 
function postFile(req, res) {
    console.log("undefined endpoint");
}

module.exports = { getDirectory, getFile, postFile };
