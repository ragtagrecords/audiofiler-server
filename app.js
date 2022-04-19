var http = require('http');
var express = require('express');
var PORT = 3000;
var app = express();
var public = require('./public.js');
const cors = require('cors');

const fileupload = require("express-fileupload");
const bodyParser = require('body-parser');

app.use(cors());
app.use(fileupload());
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', public);

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});