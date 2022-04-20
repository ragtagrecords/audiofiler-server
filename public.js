const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const AudioDatabaseLibrary = require('./lib/AudioDatabaseLibrary.js');
const FileServerLibrary = require('./lib/FileServerLibrary.js');
const Logger = require('./utils/Logger.js');

// ***** GET *****

router.get('/audio', function (req, res) {
  FileServerLibrary.getDirectory(req, res, '/audio');
})

router.get('/images', function (req, res) {
  FileServerLibrary.getDirectory(req, res, '/images');
})


router.get('/audio/:fileName', function (req, res) {
  FileServerLibrary.getFile(req, res, '/audio');
})

router.get('/images/:fileName', function (req, res) {
  FileServerLibrary.getFile(req, res, '/images');
})


// ***** POST *****

// add a new audio
router.post('/audio', async (req, res) => {
  const audioName = req.body.fileName ?? req.files.file.name ?? null;
  //  TODO: add to database with transaction, and rollback if file server fails
  if (!audioName) {
    res.status(404).send({ message: "No file name received"});
    return false;
  }

  // prefer the name in request over actual file name
  const knownExtensions = ['.mp3', '.wav', '.ogg', '.flac'];

  let doesNameIncludeExtension = knownExtensions.some(extension => audioName === extension);

  const databaseResult = await AudioDatabaseLibrary.addAudioToDatabase(
    audioName, 
    req.params.tempo ?? null,
    doesNameIncludeExtension ? '.mp3' : ''
  );

  if (!databaseResult) {
    res.status(404).send({ message: "Failed to add row to database"});
    return false;
  }

  const fileServerResult = await FileServerLibrary.postFile(req, res, '/audio');

  if(!fileServerResult) {
    // TODO: rollback
  }
})

// **** TEST *****
router.get('/test', function (req, res) {
  fs.access('/mnt/public-ext4/main/file.txt', fs.constants.W_OK, (err) => {
    if (err) {
      console.log("File cannot be written to");
      res.status(404).send('Failure');
    } else {
      console.log("File can be written to");
      res.status(200).send('Success');
    }
  });
})

// necessary with express.Router()
module.exports = router;