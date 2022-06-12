const fs = require('fs');
const path = require('path');
const Logger = require('../utils/Logger.js');
const FileSystem = require('../utils/FileSystem.js');
const SongSvc = require('../services/Songs.js');
const DbSvc = require('../services/Db.js');

// files that are accessible via API live here
const rootDir = '/public-ext4/main';

// returns a JSON list of all the files in a given dir
// not currently being used
function getDirectory(req, res, dir) {
    return new Promise(resolve => {
        const dirPath = rootDir + dir;

        options = {
            withFileTypes: true,
        }

        let fileNames = [];
        try {
            fileNames = fs.readdirSync(dirPath, options);
        } catch (error) {
            Logger.logError('getDirectory()', error, "Directory " + dirPath + " not found");
            res.status(404).send({ message: "Directory not found"});
            resolve(false);
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

            resolve(false);
        }

        res.status(200).send(response);
        Logger.logSuccess('getDirectory()', 'Sent ' + dir );
        resolve(true);
    });
}

// todo: use promises
function getFile(req, res, dir) {
    return new Promise(async resolve => {
        var options = {
            root: rootDir + dir + '/'
        };

        const songID = req.params.id;

        let song = null;

        const db = await DbSvc.connectToDB();

        if (songID) {
            song = await SongSvc.getSongByID(db, songID);
        }

        console.log(song)

        const fileName = songID ? song.zipPath: req.params.fileName;
        const filePath = rootDir + dir + '/' + fileName;

        // should prob check the file out before yeeting a response
        res.download(filePath, function (err) {
            if (err) {
                Logger.logError('getFile()', err);
                resolve(false);
            } else {
                Logger.logSuccess('getFile()', 'Sent ' + fileName);
                resolve(true);
            }
        });
    });
}

// TODO: 
function postFile(file, dir) {
    return new Promise(resolve => {
        const dirPath = rootDir + dir + '/';
        const fileName = file.name;
        const fileSizeMB = file.size / 1e6;
        
        file.mv(`${dirPath}${fileName}`, (err) => {

            if (err) {
                Logger.logError('postFile()', err.message);
                resolve(false);
            } else {
                Logger.logSuccess('postFile()', 'Received ' + fileName + " (" + fileSizeMB + " MB)");
                resolve(true);
            }
        });
    });
}

module.exports = { getDirectory, getFile, postFile };
