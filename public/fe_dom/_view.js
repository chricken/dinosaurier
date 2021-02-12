'use strict';

import dom from './dom.js';
import sichern from './sichern.js';

String.prototype.low = function () {
    return this.toLowerCase();
}

let alterAnzeigen = true;
let hueInkrement = 30;

let o = {
    // Variablen
    datensammlung: {}, // Gesamte Datensammlung
    datenMapping: new Map(), // Verknüpfung der Dino-Objekte zum DOM-Element
    aktiverDino: false, // Gerade angezeigter Dino
    dinoToMove: false, // Zu bewegendes Dinosaurier-Objekt
    attributes: [], // Array mit allen erlaubten Attributen
    bezeichnungen: [], // Alle DOM-Elemente mit den Bezeichnungen

    scrollToIndex: 0,
    maxMioJahre: 320,
    darkenChild: 2,

    // DOM
    details: dom.$('#details .inner'),

    agesZeichnen(name, beginn, ende) {
        let baum = dom.$('#baum');

        let abstand = baum.offsetWidth - (baum.offsetWidth / o.maxMioJahre * beginn);
        abstand = Math.max(abstand, 0);
        console.log(abstand);


        let breite = baum.offsetWidth / o.maxMioJahre * (beginn - ende);

        // console.log( 'AGE' , baum.offsetWidth );
        let ageFeld = dom.erzeugen({
            eltern: baum,
            klassen: ['age', 'age' + name],
            style: {
                marginLeft: alterAnzeigen ? abstand + 'px' : '10px',
                width: alterAnzeigen ? breite + 'px' : 'auto'
            },
        })
        setTimeout(() => {

            let abstand = baum.offsetWidth - (baum.offsetWidth / o.maxMioJahre * beginn);
            let breite = baum.offsetWidth / o.maxMioJahre * (beginn - ende);

            ageFeld.style.marginLeft = alterAnzeigen ? abstand + 'px' : '10px';
            ageFeld.style.width = alterAnzeigen ? breite + 'px' : 'auto';

        }, 1000);

        dom.erzeugen({
            eltern: ageFeld,
            klassen: ['beschriftung'],
            inhalt: name
        })

    },
    datenAusgeben({
        bez = '',
        daten = false,
        baumElement = false
    } = {}) {
        o.details.innerHTML = '';

        // Überschrift
        dom.erzeugen({
            eltern: o.details,
            typ: 'h1',
            inhalt: bez,
            id: 'detailsBez',
            events: {
                click() {
                    o.scrollTo(bez)
                }
            },
        })

        // Beschreibung DE
        if (daten.de || daten.en) {

            let klartext = dom.erzeugen({
                eltern: o.details,
                klassen: 'klartext'
            })

            if (daten.en) {
                dom.erzeugen({
                    eltern: klartext,
                    klassen: 'klartextEN',
                    inhalt: daten.de
                })
            }
            if (daten.de) {
                dom.erzeugen({
                    eltern: klartext,
                    klassen: 'klartextDE',
                    inhalt: daten.en
                })
            }
        }

        // Systematik
        let vorfahren = dom.erzeugen({
            eltern: o.details,
            klassen: 'alleEltern'
        })
        const vorfahrenFinden = (el, eltern) => {
            if (el.parentNode && (el.parentNode.id != 'baum')) {

                dom.erzeugen({
                    eltern,
                    typ: 'span',
                    inhalt: el.parentNode.id + ' ',
                    klassen: 'vorfahr',
                    events: {
                        click() {
                            o.scrollTo(el.parentNode.id)
                        }
                    }
                })
                vorfahrenFinden(el.parentNode, eltern);
            }
        }
        vorfahrenFinden(baumElement, vorfahren);

        // Daten eintragen
        // Attribute im Array, um die Reihenfolge zu bestimmen
        let a = o.attributes.map(el => el.bez);
        a.forEach(attr => {
            if (daten[attr]) dom.templates.detailAusgabe({ attribut: attr, value: daten[attr] });
        })

        // Links
        dom.$('#details .links').innerHTML = '';

        // Wiki-Link
        dom.erzeugen({
            inhalt: 'Wikipedia (de)',
            typ: 'a',
            attr: {
                href: 'https://de.wikipedia.org/wiki/' + bez,
                target: '_blank'
            },
            eltern: dom.erzeugen({
                eltern: dom.$('#details .links'),
                klassen: ['linkWiki']
            }),
        })
        dom.erzeugen({
            inhalt: 'Wikipedia (en)',
            typ: 'a',
            attr: {
                href: 'https://en.wikipedia.org/wiki/' + bez,
                target: '_blank'
            },
            eltern: dom.erzeugen({
                eltern: dom.$('#details .links'),
                klassen: ['linkWiki']
            }),
        })

        // dinosaurpictures.org
        dom.erzeugen({
            inhalt: 'Dinosaurpict',
            typ: 'a',
            attr: {
                href: `https://dinosaurpictures.org/${bez}-pictures`,
                target: '_blank'
            },
            eltern: dom.erzeugen({
                eltern: dom.$('#details .links'),
                klassen: ['linkWiki']
            }),
        })

        // fossilworks.org
        dom.erzeugen({
            inhalt: 'Fossilworks.org',
            typ: 'a',
            attr: {
                href: `http://fossilworks.org/bridge.pl`,
                target: '_blank'
            },
            eltern: dom.erzeugen({
                eltern: dom.$('#details .links'),
                klassen: ['linkWiki']
            }),
        })

        // dinopedia.org
        dom.erzeugen({
            inhalt: 'Dinopedia',
            typ: 'a',
            attr: {
                href: `https://dinopedia.fandom.com/wiki/${bez}`,
                target: '_blank'
            },
            eltern: dom.erzeugen({
                eltern: dom.$('#details .links'),
                klassen: ['linkWiki']
            }),
        })

        dom.translate(o.details);
    },
    baumDarstellen({
        daten = {},
        eltern = false,
        indexForRecursion = 0,
        counters = [],
        mioJhr = [],
        color = false,
        kinder = false // wird von der Gruppierung als Array übergeben, um in der Gruppierung auf die Kind-Elemente zugreifen zu können.
    } = {}) {

        let tempColor = color;

        let sortMe = Object.entries(daten);
        sortMe.sort((a, b) => a[1].children ? 1 : -1);

        // Muss eine for-in Schleife sein, damit in der Schleife die Originaldaten referenziert werden
        //for (let [key, el] of sortMe) {
        sortMe.forEach(([key, el]) => {
            
            if (el.children) tempColor.hue = (tempColor.hue + hueInkrement) % 360;

            let color = { ...tempColor };

            //for (let key in daten) {
            let DOMel = dom.erzeugen({
                klassen: [
                    'ebene',
                    'ebene' + indexForRecursion,
                    (key == o.aktiverDino) ? 'aktiv' : '',
                    (!el.children) ? 'spezies' : '',
                ],
                eltern,
                id: key,
                style: {
                    marginLeft: alterAnzeigen ? '0px' : '20px',
                }
            })
            // console.log( key, DOMel.innerWidth );

            // Dieses Element ist zum Darstellen des Inhalts eines Knotens.
            // Dieser Trick ist notwendig, um ein Kind hovern zu lassen, 
            // ohne den Eltern den Hover-Effekt zu geben

            let abstand = DOMel.offsetWidth - (DOMel.offsetWidth / this.maxMioJahre * el.mioJhrVon);
            let breite = DOMel.offsetWidth / this.maxMioJahre * (el.mioJhrVon - el.mioJhrBis);

            if (el.children) color.val -= o.darkenChild;

            let DOMInhalt = dom.erzeugen({
                eltern: DOMel,
                klassen: ['bezeichnung'],
                style: {
                    backgroundColor: o.colorToColor(color),
                    marginLeft: alterAnzeigen ? abstand + 'px' : '10px',
                    width: alterAnzeigen ? breite + 'px' : 'auto'
                },
                events: {
                    click(evt) {
                        // Wenn kein Dino bewegt werden soll
                        // Daten vor der Darstellung aufbereiten
                        let data = o.datenMapping.get(evt.currentTarget);
                        data = {
                            bez: key,
                            ...el
                        }
                        // Daten ausgeben
                        o.datenAusgeben({
                            bez: key,
                            daten: data,
                            baumElement: evt.currentTarget
                        });
                        o.aktiverDino = el;

                        // Element im Baum hervorheben
                        dom.$$('.ebene').forEach(el => el.classList.remove('aktiv'));
                        evt.currentTarget.parentNode.classList.add('aktiv');
                    }
                }
            })
            // Beschriftung
            let knoten = Object.keys(el);
            knoten = knoten.includes('children') ? knoten.length - 1 : knoten.length;

            let inhalt = `<b>${key}</b>`;

            // Wissenschaftl. Name
            let bezeichner = dom.erzeugen({
                inhalt: `${inhalt}`,
                klassen: ['bez'],
                eltern: DOMInhalt,
            })

            // DOM-Element mit den Daten mappen
            o.datenMapping.set(DOMInhalt, el);

            // Grafische Verknüpfung zur Elterngruppe
            dom.erzeugen({
                klassen: 'verknuepfung',
                eltern: DOMInhalt
            })
            // debugger;
            // Info zu Spezies
            if (el.children) {
                //color.hue += 5;

                let counter = { i: 0 };
                let mioJhrThis = { von: 0, bis: 1000 };

                // Farbe für kinder automatsch
                //if (!el.color) color = dom.zufallFarbe();
                //color.val -= 5;

                dom.erzeugen({
                    klassen: ['opener open'],
                    eltern: DOMInhalt,
                    events: {
                        click(evt) {
                            DOMel.classList.toggle('closed');
                        }
                    }
                })

                let kinder = [];

                o.baumDarstellen({
                    daten: el.children, // Rekursiv die Daten der Kind-Baumes übergeben
                    eltern: DOMel,
                    indexForRecursion: indexForRecursion + 1, // 
                    counters: [...counters, counter], // Rekursiv die Kind-Spezies zählen
                    mioJhr: [...mioJhr, mioJhrThis], // Alle Alter, um der Gruppierung rekursiv den ältesten und den jüngsten Fund zuzuordnen
                    color,
                    elternMioJahr: mioJhrThis, // Zum Zeichnen des Abhängigkeits-Indikators. Als Objekt übergeben, damit es mit dem Eltern-Scope verknüpft bleibt
                    kinder,
                })



                // Anzahl der Kindknoten darstellen
                dom.erzeugen({
                    typ: 'span',
                    eltern: bezeichner,
                    inhalt: ` (${counter.i} Spezies)`,
                    klassen: ['anzahlKinder']
                })

                let abstand = DOMel.offsetWidth - (DOMel.offsetWidth / o.maxMioJahre * mioJhrThis.von);
                let breite = DOMel.offsetWidth / o.maxMioJahre * (mioJhrThis.von - mioJhrThis.bis);

                DOMInhalt.style.backgroundColor = o.colorToColor(color);
                DOMInhalt.style.marginLeft = alterAnzeigen ? abstand + 'px' : '10px';
                DOMInhalt.style.width = alterAnzeigen ? breite + 'px' : 'auto';

                if (mioJhrThis.von < 50)
                    DOMInhalt.querySelector('.bez').style.right = '5px';


                // Indikatoren der Kinder anpassen
                kinder.forEach(({ kindKey, dom, mioJhr }) => {
                    let v = dom.querySelector('.verknuepfung');
                    let abstand = DOMel.offsetWidth / this.maxMioJahre * (mioJhrThis.von - mioJhr.von);
                    v.style.width = alterAnzeigen ? abstand + 'px' : '0';
                    v.style.left = alterAnzeigen ? '-' + abstand + 'px' : '0';
                })

            } else {
                // Alle Counter inkrementieren, um die Anzahl der Kinder zählen zu können          
                counters.forEach(el => el.i++);

                kinder.push({
                    kindKey: key,
                    dom: DOMInhalt,
                    mioJhr: { von: el.mioJhrVon, bis: el.mioJhrBis }
                });

                // Älteste und neueste Funde für Eltern anpassen
                mioJhr.forEach(elMioJhr => {
                    elMioJhr.von = el.mioJhrVon ? Math.max(el.mioJhrVon, elMioJhr.von) : elMioJhr.von;
                    elMioJhr.bis = el.mioJhrBis ? Math.min(el.mioJhrBis, elMioJhr.bis) : elMioJhr.bis;
                })

                if (el.mioJhrVon && el.mioJhrVon < 50)
                    DOMInhalt.querySelector('.bez').style.right = '5px';

                // Deutsche Bezeichnung
                if (el.de != null) {
                    dom.erzeugen({
                        eltern: bezeichner,
                        typ: 'span',
                        inhalt: ` - ${el.de}`,
                        klassen: 'de'
                    })
                }
            }
        })


        o.bezeichnungen = dom.$$('.bezeichnung');
    },
    filtern(evt) {
        let suche1 = dom.$('#inputSuche');
        o.bezeichnungen.forEach(el => {
            if (suche1.value == '') {// Ist im ersten Such-feld überhaupt eine Eingabe?
                el.classList.remove('hidden', 'parentOfFilter');
            } else if (
                el.innerHTML.low().includes(suche1.value.low())
            ) {
                el.classList.remove('hidden');
                let parent = el.parentNode;
                while (parent.classList.contains('ebene')) {
                    let el = parent.querySelector('.bezeichnung');
                    el.classList.remove('hidden');
                    el.classList.add('parentOfFilter');
                    parent = parent.parentNode;
                }
                el.classList.remove('parentOfFilter');
            } else {
                el.parentNode.classList.remove('parentOfFilter');
                el.classList.add('hidden');
            }
        })

    },
    scrollTo(evt) {
        let name = (typeof evt == 'string') ? evt : evt.currentTarget.value;
        //console.log(name);

        let elements = o.bezeichnungen.filter(el =>
            el.querySelector('.bez').innerHTML.low().indexOf(name.low()) !== -1 ||
            (
                el.querySelector('.info') &&
                el.querySelector('.info').innerHTML.low().indexOf(name.low()) !== -1
            )
        )

        if (evt.keyCode == 13) o.scrollToIndex = (o.scrollToIndex < elements.length - 1) ? o.scrollToIndex + 1 : 0;
        else o.scrollToIndex = 0;

        let el = elements[o.scrollToIndex];

        let infoDOM = document.querySelector('#scrollTo .info');
        infoDOM.innerHTML = `${o.scrollToIndex + 1} / ${elements.length}`;

        if (el) {
            let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            let top = el.getBoundingClientRect().top;

            // console.log('scroll');
            window.scrollTo(0, scrollTop + top);

        } else {
            //console.log('scroll nicht');
            window.scrollTo(0, 0);
        }
    },
    attributAnhaengen() {
        let attribut = o.selNeuesAttribut.value;

        if (!dom.$(`#details .${attribut}`)) {
            dom.templates.detaileingabe({
                attribut
            })
        }
    },
    knotenAnlegen() {
        if (o.aktiverDino) {
            if (!o.aktiverDino.children) o.aktiverDino.children = {};
            o.aktiverDino.children[inputNeuerKnoten.value] = {};
        }

        // Eingabe leeren und Fokus setzen
        inputNeuerKnoten.value = '';
        inputNeuerKnoten.focus();

        // Baum darstellen
        baum.innerHTML = '';
        o.baumDarstellen({
            daten: o.datensammlung,
            eltern: baum
        })

        sichern.aufServerSichern();


    },
    scrollUp() {
        window.scrollTo(0, 0);
    },
    leerenKnopf(el) {
        dom.erzeugen({
            inhalt: 'X',
            eltern: el.parentNode,
            klassen: ['leerenInput']
        })
    },
    colorToColor(color) {
        return `hsl(${color.hue},${color.sat}%,${color.val}%)`
    }

}

export default o;