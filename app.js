// http://192.168.86.163:3000/

var http = require('http');
var express = require('express');

//var path = require('path');
var PORT = 3000;
var app = express();
var public = require('./public.js');
app.use('/public', public);




/*
// Without middleware
router.get('/', function(req, res){
    var options = {
        root: path.join(__dirname)
    };
    
     
    var fileName = 'sample1.mp3';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log("req: ");
            console.log(req);
            console.log("path: ");
            console.log(path);
            console.log("dirname: ");
            console.log(__dirname);
            next(err);
        } else {
            console.log('Sent:', fileName);
            console.log("req: ");
            console.log(req);
            console.log("path: ");
            console.log(path);
            console.log("dirname: ");
            console.log(__dirname);
        }
    });
});

router.get('/public/audio/:fileName', function(req, res){
    var options = {
        root: path.join(__dirname)
    };
    console.log(options.root);
     
    var fileName = req.params.fileName;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log("req params: ");
            console.log(req.params);
            console.log("path: ");
            console.log(path);
            console.log("dirname: ");
            console.log(__dirname);
            next(err);
        } else {
            console.log('Sent:', fileName);
            console.log("req params: ");
            console.log(req.params);
            console.log("path: ");
            console.log(path);
            console.log("dirname: ");
            console.log(__dirname);
        }
    });
});
*/

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});