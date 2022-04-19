const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const AudioDatabaseLibrary = require('./lib/AudioDatabaseLibrary.js');
const FileServerLibrary = require('./lib/FileServerLibrary.js');

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
router.post('/audio', function (req, res) {
  //  TODO: add to database with transaction, and rollback if file server fails
  const result = AudioDatabaseLibrary.addAudioToDatabase(
    req.params.name ?? 'TEST', 
    req.params.tempo ?? null,
    '.mp3'
  );

  if (!result) {
    res.status(404).send({ message: "Failed to upload file"});
    return null;
  }

  FileServerLibrary.postFile(req, res, '/audio');
})

// necessary with express.Router()
module.exports = router;