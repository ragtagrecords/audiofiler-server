var express = require('express');
var router = express.Router();
var path = require('path');

// Home page route.
router.get('/', function (req, res) {
  res.send('public root');
})
  
  // About page route.
router.get('/audio/:fileName', function (req, res) {

  var options = {
    root: path.join(__dirname)
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

  //res.send('public audio: ' + req.params.fileName);
})

// necessary with express.Router()
module.exports = router;