var http = require('http');
var express = require('express');
var PORT = 3000;
var app = express();
var public = require('./public.js');
const cors = require('cors');

app.use(cors());

app.use('/public', public);

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});