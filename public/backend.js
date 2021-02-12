'use strict';

// Import
import dom from './dom.js';
import view from './view_be.js';
import sichern from './sichern.js';

// Variablen
let btnSave = dom.$('#btnSave');
let getUp = dom.$('#getUp');

//let inputNeuerKnoten = dom.$('#inputNeuerKnoten');

//let selNeuesAttribut = dom.$('#selNeuesAttribut');
//let btnNeuesAttribut = dom.$('#btnNeuesAttribut');
let inputSuche = dom.$('#inputSuche');
let inputScrollTo = dom.$('#inputScrollTo');

const init = () => {

    // Alle Eingabefelder leeren
    Array.from(document.querySelectorAll('input')).forEach(el => el.value = '');

    // Eingabefeldern 
    Array.from(document.querySelectorAll('input')).forEach(dom.templates.emptyThis);

    // Daten laden
    Promise.all([
        fetch('/data/daten.json'),
        fetch('/data/attributes.json')
    ]).then(
        data => {
            return Promise.all([
                data[0].json(),
                data[1].json()
            ]);
        }
    ).then( 
        data => {
            // Attribute
            view.attributes = data[1];
            dom.attributes = data[1];
            // selNeuesAttribut.innerHTML = '';

            // Baumzeichnung starten
            view.datensammlung = data[0];
            view.baumDarstellen({
                daten: data[0],
                eltern: baum
            });
        }
    )

    // Sprachdatei laden
    fetch('/data/lang.json').then(
        antwort => antwort.json()
    ).then(
        antwort => {
            view.language = antwort;
            dom.language = antwort;
        }
    )
}

const eingabeEintragen = () => {

    let inputs = dom.$$('#details .inner input[type="text"], #details .inner input[type="color"]');

    inputs.forEach(input => {
        if (input.value) {
            view.aktiverDino[input.className] = input.value;
        } else {
            delete view.aktiverDino[input.className];
        }
    })
    
    // Aktiven Dino ggf rekursiv Lebensraum und anderes eintragen
    const eintragen = (tier, sel, data) => {
        tier[sel] = {};
        //console.log(data);

        // Daten für dieses Tier eintragen
        [...data.querySelectorAll('input')].forEach(el => {
            tier[sel][el.getAttribute('data-typ')] = el.checked;
        })
        // Wenn der Knoten Kinder hat, rekursiv diese mit der Eigenschaft erweitern
        if (tier.children) {
            Object.values(tier.children).forEach(child => {
                eintragen(child, sel, data);
            })
        }
    }

    // ggf rekursiv Lebensraum für aktiven Dino eintragen
    let lebensraum = dom.$('#details .inner .cblebensraum');
    if (lebensraum) {
        eintragen(view.aktiverDino, 'lebensraum', lebensraum);
    }

    // ggf rekursiv Nahrung für aktiven Dino eintragen
    let nahrung = dom.$('#details .inner .cbnahrung');
    if (nahrung) {
        eintragen(view.aktiverDino, 'nahrung', nahrung);
    }

    // ggf rekursiv Kleid für aktiven Dino eintragen
    let kleid = dom.$('#details .inner .cbkleid');
    if (kleid) {
        eintragen(view.aktiverDino, 'kleid', kleid);
    }

    // ggf rekursiv Schmuck für aktiven Dino eintragen
    let schmuck = dom.$('#details .inner .cbschmuck');
    if (schmuck) {
        eintragen(view.aktiverDino, 'schmuck', schmuck);
    }

    // ggf rekursiv Typ für aktiven Dino eintragen
    let typ = dom.$('#details .inner .cbtyp');
    if (typ) {

        eintragen(view.aktiverDino, 'typ', typ);
    }

    //console.log(view.aktiverDino);
    sichern.aufServerSichern();
}

// Eventlistener
//selNeuesAttribut.addEventListener('change', view.attributAnhaengen);
//btnNeuesAttribut.addEventListener('click', view.attributAnhaengen);
btnNeuerKnoten.addEventListener('click', view.knotenAnlegen);

btnSave.addEventListener('click', eingabeEintragen);
inputSuche.addEventListener('input', view.filtern);
inputScrollTo.addEventListener('keyup', evt => view.scrollTo(evt));
getUp.addEventListener('click', view.scrollUp);

// Init
init();