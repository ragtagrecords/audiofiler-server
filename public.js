const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const SongDatabaseLibrary = require('./lib/SongDatabaseLibrary.js');
const FileServerLibrary = require('./lib/FileServerLibrary.js');
const Logger = require('./utils/Logger.js');

// ***** GET *****

router.get('/songs', async function (req, res) {
  const songs = await SongDatabaseLibrary.getAllSongs();

  if(songs) {
    res.status(200).send(songs);
    return true;
  } else {
    res.status(404).send({ message: "Couldn't get songs"});
    return false;
  }
})
/*
// TODO: make this work like /songs, it should return a JSON object of images
router.get('/images', function (req, res) {
  const images = await SongDatabaseLibrary.getAllImages();

  if(images) {
    res.status(200).send(images);
    return true;
  }
})
*/
router.get('/images/:fileName', async function (req, res) {
  const song = await FileServerLibrary.getFile(req, res, '/images');
})

router.get('/songs/:fileName', async function (req, res) {
  const song = await FileServerLibrary.getFile(req, res, '/songs');
})

router.get('/playlists', async function (req, res) {
  const playlists = await SongDatabaseLibrary.getAllPlaylists();
  if(1) {
    res.status(200).send(playlists);
    return true;
  } else {
    res.status(404).send({ message: "Couldn't get songs"});
    return false;
  }

})

// TODO: needs tested
router.post('/playlists', async function (req, res) {
  const playlists = await SongDatabaseLibrary.addPlaylist(req.params.name);
  if(1) {
    res.status(200).send(playlists);
    return true;
  } else {
    res.status(404).send({ message: "Couldn't get songs"});
    return false;
  }
})




router.get('/playlists/:playlistID', async function (req, res) {
  const songs = await SongDatabaseLibrary.getSongsByPlaylistID(req.params.playlistID);
  if(songs) {
    res.status(200).send(songs);
    return true;
  } else {
    res.status(404).send({ message: "Couldn't get songs"});
    return false;
  }
})


// ***** POST *****

// add new songs
router.post('/songs', async (req, res) => {

  const files = Object.values(req.files);
  let errorEncountered = false;
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    let fileName = file.name;

    if (!fileName) {

      errorEncountered = true;
      continue;
    }

    let databaseResult = await SongDatabaseLibrary.addSong(
      '/' + fileName,
      fileName, // TODO: should be a custom name, we dont have ui for entering them all
      req.params.tempo ?? null,
    );

    //  TODO: add to database with transaction, and rollback if file server fails
    if (!databaseResult) {
      errorEncountered = true;
      continue;
    }

    let fileServerResult = await FileServerLibrary.postFile(file, '/songs');
    
    if(fileServerResult) {
      errorEncountered = true;
      continue;
    }
  }
  if (errorEncountered) {
    // TODO: commit
    res.status(500).send({ message: "Some or all of the files were not uploaded"});
  } else {
    // TODO: rollback
    res.status(200).send({ message: "Files uploaded"});
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