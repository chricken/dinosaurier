
'use strict';

let fs = require('fs');

fs.readFile('public/data/daten.json', (err, inhalt) => {

    inhalt = JSON.parse(inhalt.toString());
    // console.log( inhalt );

    const killBilder = o => {
        if (o.imageLebend) delete o.imageLebend;
        if (o.imageSkelett) delete o.imageSkelett;
        if (o.imageSchema) delete o.imageSchema;

        if (o.children) {

            for (let child in o.children) {
                killBilder(o.children[child]);
            }
        }

    }

    killBilder(inhalt.Amniota);

    fs.writeFile('public/data/daten.json', JSON.stringify(inhalt), err => {
        if (err) console.log(err);
    })

})