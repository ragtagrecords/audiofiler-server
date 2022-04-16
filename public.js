var express = require('express');
var router = express.Router();
var path = require('path');
var http = require('http');

// Home page route.
router.get('/', function (req, res) {
  res.send('public root');
})
  
// About page route.
router.get('/audio/:fileName', function (req, res) {

  var options = {
    root: path.join(__dirname) + '/public/audio/'
  };
  console.log("options.root: ");
  console.log(options.root);
  
  var fileName = req.params.fileName;
  res.sendFile(fileName, options, function (err) {
      if (err) {
          next(err);
      } else {
          console.log('Sent:', fileName);
      }
  });
})

router.get('/images/:fileName', function (req, res) {

  var options = {
    root: path.join(__dirname) + '/public/images/'
  };
  console.log("options.root: ");
  console.log(options.root);
  
  var fileName = req.params.fileName;
  res.sendFile(fileName, options, function (err) {
      if (err) {
          next(err);
      } else {
          console.log('Sent:', fileName);
      }
  });
})

// necessary with express.Router()
module.exports = router;