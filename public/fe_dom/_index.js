'use strict';

// Import
import dom from './dom.js';
import view from './view.js';

// Variablen
let getUp = dom.$('#getUp');

let inputSuche = dom.$('#inputSuche');
let inputSuche2 = dom.$('#inputSuche2');
let inputScrollTo = dom.$('#inputScrollTo');

// Funktionen
const eintragen = () => {

    let inputs = dom.$$('#details .inner input[type="text"]');

    inputs.forEach(input => {
        if (input.value) {
            view.aktiverDino[input.className] = input.value;
        } else {
            delete view.aktiverDino[input.className];
        }
    })

    let lebensraum = dom.$('#details .inner .cblebensraum');
    if (lebensraum) {
        view.aktiverDino.lebensraum = {};
        [...lebensraum.querySelectorAll('input')].forEach((el, index) => {
            view.aktiverDino.lebensraum[el.getAttribute('data-typ')] = el.checked;
        })
    }
    let nahrung = dom.$('#details .inner .cbnahrung');
    if (nahrung) {
        view.aktiverDino.nahrung = {};
        [...nahrung.querySelectorAll('input')].forEach((el, index) => {
            view.aktiverDino.nahrung[el.getAttribute('data-typ')] = el.checked;
        })
    }
    sichern.aufServerSichern();
}

const init = () => {

    // Alle Eingabefelder leeren
    Array.from(document.querySelectorAll('input')).forEach(el => el.value = '');
    // Eingabefeldern 
    Array.from(document.querySelectorAll('input')).forEach(dom.templates.emptyThis);

    // Daten laden
    Promise.all([
        fetch('data/daten.json'),
        fetch('data/attributes.json')
    ]).then(
        data => {
            return Promise.all([
                data[0].json(),
                data[1].json()
            ]);
        }
    ).then(
        data => {
            //console.log(data);

            // Attribute
            view.attributes = data[1];
            dom.attributes = data[1];


            // Baumzeichnung starten
            view.datensammlung = data[0];
            view.agesZeichnen('Karbon', 358, 298);
            view.agesZeichnen('Perm', 298, 251.9);
            view.agesZeichnen('Trias', 251.9, 201.3);
            view.agesZeichnen('Jura', 201.3, 145);
            view.agesZeichnen('Kreide', 145, 66);
            view.agesZeichnen('Eo', 66, 0);
            console.time();
            view.baumDarstellen({
                daten: data[0],
                eltern: baum,
                color: {
                    hue: 0,
                    sat: 50,
                    val: 100
                }
            });
            console.timeEnd();

        }
    )

    // Sprachdatei laden
    fetch('data/languages.json').then(
        antwort => antwort.json()
    ).then(
        antwort => {
            view.language = antwort;
            dom.language = antwort;
        }
    )
}

// Eventlistener
inputSuche.addEventListener('input', view.filtern);
inputScrollTo.addEventListener('keyup', evt => view.scrollTo(evt));
getUp.addEventListener('click', view.scrollUp);

// Init
init();