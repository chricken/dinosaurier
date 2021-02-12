'use strict';
// Variablen
let datenPfad = 'public/data/daten.json';
// let attributePfad = 'data/attributes.json';

// Module
const express = require('express');
const opn = require('better-opn');

const fs = require('fs');

let server = express();

server.use(express.static('public', {
    extensions: ['htm', 'html'],
}));
server.use(express.json({limit: '50mb'}));


server.post('/saveData', (req, res) => {
    //console.log ( req.body );
    fs.writeFile( datenPfad, JSON.stringify(req.body), err => {
        if ( err ) {
            console.log(err);
            res.send(JSON.stringify({status:'unok'}));
        } else {
            res.send(JSON.stringify({status:'ok'}));
        }
    });
})

server.listen(80, err => {
    console.log(err || 'Läuft');
    opn('http://localhost');
    opn('http://localhost/backend');
});