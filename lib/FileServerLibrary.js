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
        res.status(404).send({ message: "Directory not found"});
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
        res.status(404).send({ message: "Failed to return file names"});

        return null;
    }

    res.status(200).send(response);
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
function postFile(req, res, relativePath) {
    const dirPath = rootDir + relativePath + '/';
    const file = req.files.file;
    const fileName = file.name;
    const fileSizeMB = file.size / 1e6;


    file.mv(`${dirPath}${fileName}`, (err) => {
        if (err) {
            res.status(500).send({ message: "File upload failed", code: 200 });
        }
        Logger.logFileServer(CURR_FILE, 'Received ' + fileName + " (" + fileSizeMB + " MB)");
        res.status(200).send({ message: "File Uploaded", code: 200 });
    });
}

module.exports = { getDirectory, getFile, postFile };
