const fs = require('fs');
const path = require('path');
const Logger = require('../utils/Logger.js');
const FileSystem = require('../utils/FileSystem.js');


// files that are accessible via API live in /public
//const rootDir = path.join(__dirname) + '/../public';
const rootDir = '/mnt/public-ext4/main';

function getDirectory(req, res, relativePath) {
    const dirPath = rootDir + relativePath;

    options = {
        withFileTypes: true
    }

    let fileNames = [];
    try {
        fileNames = fs.readdirSync(dirPath, options);
    } catch (error) {
        Logger.logError('getDirectory()', error, "Directory " + dirPath + " not found");
        res.status(404).send({ message: "Directory not found"});
        return false;
    }

    response = { };

    // TODO: use actual ID from database, not i
    for (let i = 0; i < fileNames.length; ++i) {
        response[i] = fileNames[i].name;
    }

    const isEmpty = Object.keys(response).length === 0;
    if (isEmpty){
        Logger.logError('getDirectory()', "Failed to parse" + dirPath + " fileNames into response");
        res.status(404).send({ message: "Failed to return file names"});

        return false;
    }

    res.status(200).send(response);
    Logger.logSuccess('getDirectory()', 'Sent ' + relativePath );
}

function getFile(req, res, dir) {

    var options = {
        root: rootDir + dir + '/'
    };

    const fileName = req.params.fileName;

    isFileAccessible = FileSystem.hasAccess(res, options.root + fileName, fs.constants.R_OK);

    if(!isFileAccessible) {
        return false;
    }

    res.sendFile(fileName, options, function (err) {
        if (err) {
            Logger.logError('getFile()', err);
            return false;

        } else {
            Logger.logSuccess('getFile()', 'Sent ' + fileName);
            return true;
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
        Logger.logSuccess('postFile()', 'Received ' + fileName + " (" + fileSizeMB + " MB)");
        res.status(200).send({ message: "File Uploaded", code: 200 });
    });
}

module.exports = { getDirectory, getFile, postFile };
