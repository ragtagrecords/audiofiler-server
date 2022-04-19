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
  AudioDatabaseLibrary.addAudioToDatabase(
    req.params.name ?? 'TEST', 
    req.params.tempo ?? null,
    '.mp3'
  );
  // TODO::
  // FileServerLibrary.addAudioToFileServer
})

// necessary with express.Router()
module.exports = router;