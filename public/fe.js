'use strict';

// IMPORT
import dom from './fe_dom.js';
import draw from './draw_canvas.js';
import templates from './templates_fe.js';

// VARIABLEN
let c = dom.$('#c');
let ctx = c.getContext('2d');
let cAges = dom.$('#cAges');
let ctxAges = cAges.getContext('2d');

let DOMinfo = dom.$('#details .content');
let DOMSuche = dom.$('#suche');
let DOMSuchErgebnisse = dom.$('#suche .liste');
let DOMSettings = dom.$('#settings');

let baum, attr, lang, icons, schemaDino, schemaRezent;
let baumToDraw = [];

let language = 'de';

let counter = 0;

// FUNKTIONEN
const resize = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    cAges.width = window.innerWidth;
    cAges.height = window.innerHeight;
    zeichneAges();
    zeichne();
}

const zeichneGruppe = gruppe => {
    // Position des ersten sichtbaren Elemente
    if (draw.settings.firstInDisplay == 0) draw.settings.firstInDisplay = gruppe.posY;

    // Position des letzten sichtbaren Elementes
    draw.settings.lastInDisplay = gruppe.posY;

    // Dieses Objekt in die Sammlung sichtbarer Objekte schreiben
    draw.settings.sichtbareObjekte.push(gruppe);
    draw.gruppe(c, ctx, gruppe, `${gruppe.numSpecies} ${lang.spezies[language]}`);
}

const zeichneAges = () => {
    draw.age(cAges, ctxAges, lang.karbon.de, 358, 298, 0);
    draw.age(cAges, ctxAges, lang.perm.de, 298, 251.9, 80);
    draw.age(cAges, ctxAges, lang.trias.de, 251.9, 201.3, 120);
    draw.age(cAges, ctxAges, lang.jura.de, 201.3, 145, 160);
    draw.age(cAges, ctxAges, lang.kreide.de, 145, 66, 240);
    draw.age(cAges, ctxAges, lang.ceno.de, 66, 0, 300);
}

const zeichne = () => {
    draw.settings.sichtbareObjekte = [];
    draw.settings.counter = 0;
    draw.settings.firstInDisplay = 0;
    ctx.clearRect(0, 0, c.width, c.height);

    // Nach Liste zeichnen
    let baumAuswahl = baumToDraw.filter(ast =>
        ast.posY >= -20 - draw.settings.offsetY &&
        ast.posY <= c.height - draw.settings.offsetY
    );

    // Verknüpfungen zeichnen
    ctx.strokeStyle = draw.makeStrokeFarbe(0);
    ctx.lineWidth = 1;

    ctx.beginPath();
    baumAuswahl.forEach(ast => draw.verknuepfung(c, ctx, ast));
    baumToDraw.forEach(ast => draw.vertikaleVerknuepfung(c, ctx, ast));
    ctx.stroke();

    // Verknüpfungen zu den aktiven Kindern zeichnen
    let tempOpen = draw.settings.geklicktesObjekt.open || draw.settings.geklicktesObjekt.open === undefined
    if (draw.settings.geklicktesObjekt.children && tempOpen) {
        ctx.strokeStyle = draw.makeToChildrenFarbe();
        ctx.lineWidth = 3;
        ctx.beginPath();
        draw.settings.geklicktesObjekt.children.forEach(el => {
            draw.verknuepfung(c, ctx, el);
            draw.vertikaleVerknuepfung(c, ctx, el);
        })
        ctx.stroke();
    }

    // Verknüpfung zum aktiven Parent zeichnen
    if (draw.settings.geklicktesObjekt.parent) {
        ctx.strokeStyle = draw.makeToParentFarbe();
        ctx.lineWidth = 3;
        ctx.beginPath();
        draw.verknuepfung(c, ctx, draw.settings.geklicktesObjekt);
        draw.vertikaleVerknuepfung(c, ctx, draw.settings.geklicktesObjekt);
        ctx.stroke();
    }

    // Gewünschte Äste zeichnen
    baumAuswahl.forEach(ast => zeichneGruppe(ast));

    //console.timeEnd();
    // Scrollbalken zeichnen
    draw.scrollbar(c, ctx);
}

// Zusammengeklappte Elemente ausfiltern
const filterCollapsed = () => {
    // Leeren
    draw.settings.counter = 0;
    baumToDraw = [];

    const intoBaumToDraw = ast => {
        // Ast wird zum Zeichnen eingehängt
        baumToDraw.push(ast);

        // Zeichenposition eintragen
        ast.height = ast.children ? draw.settings.groupHeight : draw.settings.speciesHeight;
        ast.posY = draw.settings.counter;
        draw.settings.counter += ast.children ? draw.settings.groupHeight : draw.settings.speciesHeight;

        // Wenn das Element aufgeklappt ist, auch die Kinder zeichnen
        if ((ast.children && ast.open) || (ast.children && ast.open === undefined)) {
            ast.children.forEach(intoBaumToDraw);
        }
    }

    baum.forEach(intoBaumToDraw);
    draw.settings.last = baumToDraw[baumToDraw.length - 1].posY;
    //console.log(baumToDraw.length);

}

// Sortieren
const sortAst = (sortThis, speciesCounter) => {

    // Spezies nach Alter sortieren
    sortThis = Object.entries(sortThis)
        .map(el => {
            el[1].name = el[0]
            return el[1]
        });

    sortThis.sort((a, b) => b.mioJhrVon - a.mioJhrVon);
    sortThis.sort(a => a.children ? 1 : -1);

    sortThis = sortThis.map(el => {
        if (el.children) {
            for (let child in el.children) {
                el.children[child].parent = el;
            }
            el.children = sortAst(el.children);
        }
        return el;
    })

    return sortThis;
}

const kolorieren = ast => {
    ast.forEach(el => {
        if (el.children) {
            el.color = ~~(Math.random() * 360);
            el.children = el.children.map(child => {
                child.color = el.color;
                return child;
            })
            kolorieren(el.children);
        }
    })
}

const countSpecies = baum => {

    const count = (ast, counter) => {

        if (ast.children) {
            ast.numSpecies = [0];
            counter.push(ast.numSpecies);
            ast.children.forEach(kind => count(kind, [...counter]));
        } else {
            counter.forEach(zahl => zahl[0]++)
        }
    }

    baum.forEach(ast => {
        let counter = [0];
        count(ast, [counter]);
        ast.speciesCounter = counter;
    })
}

const getNumElemente = (ast, counter) => {
    counter[0]++;

    if (ast.children) {
        ast.children.forEach(el => {
            getNumElemente(el, counter)
        })
    }
    return counter[0]
}

const gruppenAlter = (ast, alter) => {

    ast.forEach(el => {

        if (el.children) {
            let lokalAlter = { von: 0, bis: 1000 };
            gruppenAlter(
                el.children,
                [...alter, lokalAlter]
            );

            el.mioJhrVon = lokalAlter.von;
            el.mioJhrBis = lokalAlter.bis;

        } else {
            alter = alter.map(alterEl => {
                if (el.mioJhrVon) alterEl.von = Math.max(el.mioJhrVon, alterEl.von);
                if (el.mioJhrBis) alterEl.bis = Math.min(el.mioJhrBis, alterEl.bis);
                return alterEl;
            })

        }
    })
}

const findAncestors = gruppe => {
    let kette = [];
    const ketteEinhaengen = el => {
        kette.push(el.name);
        if (el.parent) ketteEinhaengen(el.parent);
    }
    if (gruppe.parent) ketteEinhaengen(gruppe);
    return kette;
}

const showDetails = gruppe => {

    DOMinfo.innerHTML = '';

    templates.header({
        inhalt: gruppe.name,
        eltern: DOMinfo,
        events: {
            click() {
                draw.settings.offsetY = -gruppe.posY;
                zeichne();
            }
        }
    });

    templates.commonName({
        eltern: DOMinfo,
        de: gruppe.de,
        en: gruppe.en,
        language
    });
    
    //console.log(lang);
    
    templates.erbschaft({
        eltern: DOMinfo,
        kette: findAncestors(gruppe),
        baum: baumToDraw,
        draw,
        zeichne,
        inhalt: lang.abstammung[language]
    });

    // Standard-Infoboxen erzeugen
    [
        { bez: 'mioJhrVon', data: gruppe.mioJhrVon, mass: 'mioJhr' },
        { bez: 'mioJhrBis', data: gruppe.mioJhrBis, mass: 'mioJhr' },
        { bez: 'laenge', data: gruppe.laenge, mass: 'meter' },
        { bez: 'spannweite', data: gruppe.spannweite, mass: 'meter' },
        { bez: 'gewicht', data: gruppe.gewicht, mass: 'kg' },
        { bez: 'entdeckt', data: gruppe.entdeckt },
    ].forEach(el => {
        if (el.data !== undefined) {
            templates.info({
                bez: lang[el.bez][language],
                data: el.data,
                eltern: DOMinfo,
                mass: el.mass ? lang[el.mass][language] : false
            })
        } else {
            dom.erzeugen({
                klassen: ['abstand'],
                eltern: DOMinfo
            })
        }
    });

    ["lebensraum", "nahrung", "kleid", "schmuck"].forEach(key => {
        let hasTrue = false;

        for (let i in gruppe[key]) {
            if (gruppe[key][i]) hasTrue = true;
        }

        if (gruppe[key] && hasTrue) {
            templates.sammlung({
                daten: gruppe[key],
                titel: lang[key][language],
                eltern: DOMinfo,
                icons
            })
        }
    });

    // Länge
    if (gruppe.laenge) {
        let rezent = schemaRezent.filter(el => el.laenge < gruppe.laenge);
        rezent = rezent[rezent.length - 1];

        let c = dom.erzeugen({
            typ: 'canvas',
            klassen: ['laenge'],
            eltern: DOMinfo,
            attr: {
                width: '150',
                height: '150',
            }
        })
        let dinoImg = schemaDino[0].img;

        if (gruppe.typ) {
            let typ = Object.entries(gruppe.typ).find(el => el[1] == true)[0];
            console.log(schemaDino, typ);
            dinoImg = schemaDino.find(schema => schema.name == typ).img;
        }
        let size = 1 / gruppe.laenge * rezent.laenge;
        let ctx = c.getContext('2d');
        let padding = 5;

        ctx.globalAlpha = .5;
        ctx.drawImage(dinoImg, padding, padding, c.width - (padding * 2), c.height - (padding * 2));

        ctx.globalAlpha = .5;
        size = (c.width - (padding * 2)) * size;
        ctx.drawImage(rezent.img, padding, (c.height - size), size, size);

    }

    // Links
    let linksContainer = dom.erzeugen({
        typ: 'div',
        klassen: ['links'],
        eltern: DOMinfo
    });
    templates.link({
        titel: 'Wikipedia (en)',
        link: `https://en.wikipedia.org/wiki/${gruppe.name}`,
        eltern: linksContainer
    });
    templates.link({
        titel: 'Wikipedia (de)',
        link: `https://de.wikipedia.org/wiki/${gruppe.name}`,
        eltern: linksContainer
    });
    templates.link({
        titel: 'Dinosaurpicts',
        link: `https://dinosaurpictures.org/${gruppe.name}-pictures`,
        eltern: linksContainer
    });
    templates.link({
        titel: 'Dinopedia',
        link: `https://dinopedia.fandom.com/wiki/${gruppe.name}`,
        eltern: linksContainer
    });
}

const showListe = (liste, DOMListe, counter) => {
    DOMListe.innerHTML = '';
    let max = 10;
    for (
        let i = Math.max(((liste.length - counter) > max ? counter - 1 : liste.length - max - 1), 0);
        i < liste.length && i < counter + max;
        i++
    ) {
        let el = liste[i];
        let inhalt = el.name;
        let erg = dom.erzeugen({
            inhalt,
            eltern: DOMListe,
            klassen: ['listElement'],
            events: {
                click() {
                    draw.settings.aktivesObjekt = el;
                    draw.settings.geklicktesObjekt = el;
                    draw.settings.offsetY = -el.posY;
                    dom.$$('.listElement').forEach(
                        el => el.classList.remove('aktiv')
                    );
                    erg.classList.add('aktiv');
                    zeichne();
                    showDetails(el);
                }
            }
        })
        // Common
        if (el[language]) {
            dom.erzeugen({
                inhalt: ` - ${el[language]}`,
                eltern: erg,
                klassen: ['kleiner'],
                typ: 'span'
            })
        }
        // Aktiv
        if (el == draw.settings.geklicktesObjekt) erg.classList.add('aktiv');
    }
}

// Wenn eine Eingabe in die Suchmaske erfolgt ist
const sucheEinblenden = () => {
    DOMSuche.style.display = 'block';
}
const settingsEinblenden = () => {
    DOMSettings.style.display = 'block';
}

// HTML-Elemente übersetzen
const translate = () => {
    dom.$('#suche .grabber').innerHTML = lang.suche[language];
    dom.$('#settings .grabber').innerHTML = lang.settings[language];
    dom.$('#suche #inputSuche').placeholder = lang.eingabe[language];
    dom.$('#details .grabber').innerHTML = lang.details[language];
    dom.$('#settings .sprache span').innerHTML = lang.sprache[language];
}

const suchEingabe = () => {
    let counter = 1;
    return evt => {
        let eingabe = evt.currentTarget.value.toLowerCase();
        let findings = baumToDraw.filter(
            el => {
                let fund = false;
                if (el.name.toLowerCase().includes(eingabe)) fund = true;
                if (el[language] && el[language].toLowerCase().includes(eingabe)) fund = true;
                return fund;
            }
        );

        if (evt.key == 'Enter') counter = counter < findings.length ? counter + 1 : 1;
        else counter = 1;

        if (findings[counter - 1]) {
            draw.settings.offsetY = -findings[counter - 1].posY;
            draw.settings.geklicktesObjekt = findings[counter - 1];
            draw.settings.aktivesObjekt = findings[counter - 1];
            showDetails(draw.settings.geklicktesObjekt);
        }
        else draw.settings.offsetY = 0;

        showListe(findings, DOMSuchErgebnisse, counter);
        dom.$('#suche .zaehler').innerHTML = `${counter} / ${findings.length}`
        zeichne();
    }
}

const init = () => {
    //  Pattern(s) erzeugen
    draw.settings.patternRaster = ctx.createPattern(dom.$('#imgRaster'), 'repeat');

    // Mausrad
    c.addEventListener('wheel', evt => {

        if (evt.deltaY > 0) {
            draw.settings.offsetY -= draw.settings.scrollSpeed;
        } else {
            if (draw.settings.offsetY < 0)
                draw.settings.offsetY += draw.settings.scrollSpeed;
        }

        requestAnimationFrame(zeichne);
        //zeichne();
    });

    c.addEventListener('mousemove', evt => {

        if (draw.settings.scrollbarPressed) {
            draw.settings.scrollbarPressed = true;
            draw.settings.last / c.height * evt.layerY
            draw.settings.offsetY = -(draw.settings.last / c.height * evt.layerY);
            requestAnimationFrame(zeichne);
            //zeichne();
        } else {
            draw.settings.mouseX = evt.layerX;
            draw.settings.mouseY = evt.layerY;
            requestAnimationFrame(zeichne);
            //zeichne();
        }
    })

    c.addEventListener('leave', evt => {
        draw.settings.scrollbarPressed = false;
    })

    c.addEventListener('mouseup', evt => {
        draw.settings.scrollbarPressed = false;
    })

    c.addEventListener('mousedown', evt => {
        // Sichetbare Objeke mappen, um sie leichter ansprechen zu können
        let siObj = draw.settings.sichtbareObjekte;
        if (evt.layerX > draw.settings.scrollbarWidth) {
            // Details einblenden
            dom.$('#details').style.display = 'block';
            // Sichtbare Objekte iterieren
            for (let i = 0; i < siObj.length; i++) {
                // Geklicktes Element finden
                if (
                    evt.layerY > (siObj[i].posY + draw.settings.offsetY) &&
                    evt.layerY < (siObj[i].posY + siObj[i].height + draw.settings.offsetY)
                ) {
                    // Wurde der Opener getroffen?
                    if (siObj[i].children && siObj[i].overOpener) {
                        siObj[i].open = (siObj[i].open == undefined) ? false : !siObj[i].open;
                        filterCollapsed();
                        zeichne();
                    }
                }
            }
            showDetails(draw.settings.aktivesObjekt);
            draw.settings.geklicktesObjekt = draw.settings.aktivesObjekt;

        } else {

            // Scrollbar
            draw.settings.scrollbarPressed = true;
            draw.settings.last / c.height * evt.layerY
            draw.settings.offsetY = -(draw.settings.last / c.height * evt.layerY);

        }
        zeichne();
    });

    // UI-ELEMENTE
    // Drag'n'Drop
    dom.$('#details').addEventListener('dragstart', evt => {
        let el = evt.currentTarget;
        el.x = evt.x;
        el.y = evt.y;
    })
    dom.$('#details').addEventListener('drag', evt => {
        let el = evt.currentTarget;

        console.log(
            evt.x
        );
        
    })

    // EVENTLISTENER
    dom.$('#details .closer').addEventListener('click', () => {
        dom.$('#details').style.display = 'none';
    })
    dom.$('#suche .closer').addEventListener('click', () => {
        dom.$('#suche').style.display = 'none';
    })
    dom.$('#settings .closer').addEventListener('click', () => {
        dom.$('#settings').style.display = 'none';
    })
    // Sucheingabe muss aufgerufen werden, weil es die Funktion zurückgibt
    dom.$('#inputSuche').value = '';
    dom.$('#inputSuche').addEventListener('keyup', suchEingabe());

    dom.$('#maginifier').addEventListener('click', sucheEinblenden);
    dom.$('#gear').addEventListener('click', settingsEinblenden);

    // Daten laden
    Promise.all([
        fetch('data/daten.json'),
        fetch('data/attributes.json'),
        //fetch('data/languages.json'),
        fetch('data/lang.json'),
        fetch('data/icons.json'),
        fetch('data/schema_dino.json'),
        fetch('data/schema_rezent.json')
    ]).then(
        data => {
            return Promise.all([
                data[0].json(),
                data[1].json(),
                data[2].json(),
                data[3].json(),
                data[4].json(),
                data[5].json()
            ]);
        }
    ).then(
        data => {
            [baum, attr, lang, icons, schemaDino, schemaRezent] = data;
            
            //console.log(lang);
            
            // Sprache laden
            language = localStorage.getItem('language') || language;

            // Bilder laden
            schemaRezent.forEach(schema => {
                schema.img = new Image();
                schema.img.src = `bilder/schema/${schema.url}`;
            })
            schemaDino.forEach(schema => {
                schema.img = new Image();
                schema.img.src = `bilder/schema/${schema.url}`;
            })

            // Sprache im DOM anpassen
            translate();

            // Select füllen
            let settingsLanguage = dom.$('#settings .sprache select');
            settingsLanguage.innerHTML = '';
            for (let key in lang.sprache) {
                let neu = dom.erzeugen({
                    typ: 'option',
                    inhalt: key
                })
                settingsLanguage.append(neu);
            }
            settingsLanguage.value = language;

            // Change-Eventlistener für Select
            settingsLanguage.addEventListener('change', () => {
                language = settingsLanguage.value;
                translate();
                showDetails(draw.settings.geklicktesObjekt);
                localStorage.setItem('language', language);
            })

            // Sortieren nach Spezies / Gruppe
            baum = sortAst(baum, []);
            filterCollapsed(baum);

            draw.settings.last = baumToDraw[baumToDraw.length - 1].posY;

            // Jeder Gruppe eine Farbe geben
            kolorieren(baum);

            // Spezies zählen
            countSpecies(baum);

            // Höchstes und geringstes Alter für die Gruppe eintragen
            gruppenAlter(baum, []);

            // Zeichnen
            window.addEventListener('resize', resize);
            resize();
        }
    )
}

// INIT
window.onload = init;