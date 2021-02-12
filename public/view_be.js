'use strict';

import dom from './dom.js';
import sichern from './sichern.js';

let o = {
    // Variablen
    datensammlung: {}, // Gesamte Datensammlung
    datenMapping: new Map(), // Verknüpfung der Dino-Objekte zum DOM-Element
    aktiverDino: false, // Gerade angezeigter Dino
    dinoToMove: false, // Zu bewegendes Dinosaurier-Objekt
    attributes: [], // Array mit allen erlaubten Attributen
    bezeichnungen: [], // Alle DOM-Elemente mit den Bezeichnungen

    scrollToIndex: 0,

    // DOM
    details: dom.$('#details .inner'),
    selNeuesAttribut: dom.$('#selNeuesAttribut'),
    attributHinzufuegen: dom.$('#attributHinzufuegen'),

    // Funktionen
    datenAusgeben({
        bez = '',
        daten = false,
        baumElement = false
    } = {}) {
        o.details.innerHTML = '';

        if( o.attributHinzufuegen){
            o.attributHinzufuegen.innerHTML = '';
            o.attributes.forEach(attr => {
                if (!daten[attr.bez]) {
                    dom.erzeugen({
                        eltern: o.attributHinzufuegen,
                        inhalt: attr.bez,
                        klassen: ['btn'],
                        events:{
                            click(evt){
                                o.attributAnhaengen(attr.bez);
                                evt.currentTarget.remove();
                            }
                        }
                    })
                }
            })
        }

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

        // Daten eintragen
        // Attribute im Array, um die Reihenfolge zu bestimmen
        let a = o.attributes.map(el => el.bez);
        a.forEach(attr => {
            if (daten[attr]) dom.templates.detaileingabe({ attribut: attr, value: daten[attr] });
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
            inhalt: 'fossilworks.org',
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
    bgRasterDarstellen() {

    },
    baumDarstellen({
        daten = {},
        eltern = false,
        indexForRecursion = 0,
        counters = [],
    } = {}) {
        // Muss eine for-in Schleife sein, damit in der Schleife die Originaldaten referenziert werden
        for (let key in daten) {
            // Erstmal alle Counter inkrementieren, um die Anzahl der Kinder zählen zu können
            if (!daten[key].children) {
                counters.forEach(el => el.i++);
            }

            let DOMel = dom.erzeugen({
                klassen: [
                    'ebene ebeneBG',
                    'ebene' + indexForRecursion,
                    (key == o.aktiverDino) ? 'aktiv' : '',
                    (!daten[key].children) ? 'spezies' : '',
                ],
                eltern,
                id: key,
                style: {
                    backgroundColor: daten[key].color
                }
            })

            // Hintergrund zum Anzeigen der Datenmenge
            if (!daten[key].children) {
                let numKnoten = Object.keys(daten[key]).length;
                let numAttributes = o.attributes.length;

                dom.erzeugen({
                    klassen: ['bg'],
                    eltern: DOMel,
                    style: {
                        width: `${100 / (numAttributes - 1) * numKnoten}%` // -1, wegen mioJhrVonBis
                    }
                })
            }

            // Dieses Element ist zum Darstellen des Inhalts eines Knotens.
            // Dieser Trick ist notwendig, um ein Kind hovern zu lassen, 
            // ohne den Eltern den Hover-Effekt zu geben
            let DOMInhalt = dom.erzeugen({
                eltern: DOMel,
                klassen: ['bezeichnung'],
                events: {
                    click(evt) {
                        if (!o.dinoToMove) {
                            // Wenn kein Dino bewegt werden soll
                            // Daten vor der Darstellung aufbereiten
                            let data = o.datenMapping.get(evt.currentTarget);
                            data = {
                                bez: key,
                                ...daten[key]
                            }
                            // Daten ausgeben
                            o.datenAusgeben({
                                bez: key,
                                daten: data,
                                baumElement: evt.currentTarget
                            });
                            o.aktiverDino = daten[key];

                            // Element im Baum hervorheben
                            dom.$$('.ebene').forEach(el => el.classList.remove('aktiv'));
                            evt.currentTarget.parentNode.classList.add('aktiv');
                        } else {
                            // Dino verschieben
                            // ggf. Children-Knoten anlegen
                            if (!daten[key].children) daten[key].children = {};

                            // Dino übertragen
                            daten[key].children[o.dinoToMove.bez] = o.dinoToMove.data;
                            delete o.dinoToMove.parent[o.dinoToMove.bez];

                            // Movepuffer leeren
                            o.dinoToMove = false;
                            dom.$$('.bezeichnung').forEach(el => el.classList.remove('moveThis'));

                            // Baum neu zeichnen
                            baum.innerHTML = '';
                            o.baumDarstellen({
                                daten: o.datensammlung,
                                eltern: baum
                            })

                            // Speichern
                            sichern.aufServerSichern();
                        }
                    }
                }
            })
            // Beschriftung
            let knoten = Object.keys(daten[key]);
            knoten = knoten.includes('children') ? knoten.length - 1 : knoten.length;

            let inhalt = `<b>${key}</b>`;

            // Wissenschaftl. Name
            let bezeichner = dom.erzeugen({
                inhalt: inhalt,
                klassen: ['bez'],
                eltern: DOMInhalt,
            })
            if (!daten[key].children) {
                let info = dom.erzeugen({
                    klassen: ['info'],
                    eltern: DOMInhalt,
                })

                // Deutsche Bezeichnung
                if (daten[key].de != null) {
                    dom.erzeugen({
                        eltern: info,
                        typ: 'span',
                        inhalt: `${daten[key].de} `
                    })
                }
                dom.erzeugen({
                    eltern: info,
                    inhalt: `(${knoten} Attribute)`,
                    typ: 'span',
                })
            }
            // Verschieber
            dom.erzeugen({
                inhalt: 'move',
                typ: 'button',
                eltern: DOMel,
                klassen: ['btnMove'],
                events: {
                    click() {
                        if (!o.dinoToMove) {
                            o.dinoToMove = {
                                bez: key,
                                data: daten[key],
                                parent: daten,
                            };
                            DOMInhalt.classList.add('moveThis');
                            //console.log(o.dinoToMove);
                        } else {
                            o.dinoToMove = false;
                            dom.$$('.bezeichnung').forEach(el => el.classList.remove('moveThis'));
                        }
                    }
                }
            })
            // entfernen
            dom.erzeugen({
                inhalt: 'Delete',
                typ: 'button',
                eltern: DOMel,
                klassen: ['btnDel'],
                events: {
                    click() {
                        if (confirm(`Delete ${key}?`)) {
                            delete daten[key];

                            // Baum neu zeichnen
                            baum.innerHTML = '';
                            o.baumDarstellen({
                                daten: o.datensammlung,
                                eltern: baum
                            })

                            // Speichern
                            sichern.aufServerSichern();
                        }
                    }
                }
            })

            // DOM-Element mit den Daten mappen
            o.datenMapping.set(DOMInhalt, daten[key]);

            // Opener
            if (daten[key].children) {
                let counter = { i: 0 };
                dom.erzeugen({
                    klassen: ['opener open'],
                    eltern: DOMInhalt,
                    events: {
                        click(evt) {
                            DOMel.classList.toggle('closed');
                        }
                    }
                })
                this.baumDarstellen({
                    daten: daten[key].children,
                    eltern: DOMel,
                    indexForRecursion: indexForRecursion + 1,
                    counters: [...counters, counter],
                })

                // Anzahl der Kindknoten darstellen
                dom.erzeugen({
                    typ: 'span',
                    eltern: bezeichner,
                    inhalt: ` (${counter.i} Spezies)`,
                    klassen: ['anzahlKinder']
                })
            }
        }

        o.bezeichnungen = dom.$$('.bezeichnung');
    },
    filtern(evt) {
        o.bezeichnungen.forEach(el => {
            if (el.innerHTML.toLowerCase().indexOf(inputSuche.value.toLowerCase()) !== -1) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        })
    },
    scrollTo(evt) {
        let name = (typeof evt == 'string') ? evt : evt.currentTarget.value;
        //console.log(name);

        let elements = o.bezeichnungen.filter(el => {
            return (
                el.querySelector('.bez').innerHTML.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
                (
                    el.querySelector('.info') &&
                    el.querySelector('.info').innerHTML.toLowerCase().indexOf(name.toLowerCase()) !== -1
                )
            );
        })

        if (evt.keyCode == 13) o.scrollToIndex = (o.scrollToIndex < elements.length - 1) ? o.scrollToIndex + 1 : 0;
        else o.scrollToIndex = 0;

        let el = elements[o.scrollToIndex];

        let infoDOM = document.querySelector('#scrollTo .info');
        infoDOM.innerHTML = `${o.scrollToIndex + 1} / ${elements.length}`;

        if (el) {
            let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            let top = el.getBoundingClientRect().top;

            //console.log('scroll');
            window.scrollTo(0, scrollTop + top);

        } else {
            //console.log('scroll nicht');
            window.scrollTo(0, 0);
        }
    },
    attributAnhaengen(attribut) {
        //let attribut = o.selNeuesAttribut.value;

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
    }
}

export default o;