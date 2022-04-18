const express = require('express');
const router = express.Router();
const path = require('path');
const http = require('http');
const fs = require('fs');
const mysql = require('mysql');


// handles JSON response for GET requests to a directory
function sendListOfFilesInFolder(req, res, folderPath) {
  dirPath = path.join(__dirname) + '/public' + folderPath;

  options = {
    withFileTypes: true
  }

  var fileNames = fs.readdirSync(dirPath, options);
  response = { };

  // TODO: use actual ID from database, not i
  for (let i = 0; i < fileNames.length; ++i) {
    response[i] = fileNames[i].name;
  }

  res.send(response);

}

function sendFileAsResponse(req, res, dirName) {
  var options = {
    root: path.join(__dirname) + '/public/' + dirName + '/'
  };
  
  var fileName = req.params.fileName;
  res.sendFile(fileName, options, function (err) {
      if (err) {
          console.log(err);
      } else {
          console.log('Sent:', fileName);
      }
  });
}

router.get('/', function (req, res) {
  res.send('public root');
})

// return list of all files in directory, enumerated by ID
router.get('/audio', function (req, res) {
  // db
  const db = mysql.createConnection({
    user: "audiofiler-fs",
    host: "150.238.75.231",
    password: "weloveclouddatabasesolutions",
    database: "audiofiler"
  });

  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

  db.query(
    `INSERT INTO audios (path, name, tempo) VALUES (?,?,?)`,
    ['sample1.mp3', null, 111],
    (err, result) => {
      if (err) {
          console.log(err.sqlMessage);
      } else {
        console.log(result);
      }
    }
  );


  sendListOfFilesInFolder(req, res, '/audio');
})

// About page route.
router.get('/audio/:fileName', function (req, res) {
  sendFileAsResponse(req, res, 'audio')
})

// return list of all files in directory, enumerated by ID
router.get('/images', function (req, res) {
  sendListOfFilesInFolder(req, res, '/images');
})

router.get('/images/:fileName', function (req, res) {
  sendFileAsResponse(req, res, 'images');
})

// necessary with express.Router()
module.exports = router;