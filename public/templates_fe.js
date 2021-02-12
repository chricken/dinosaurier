'use strict';

import dom from './fe_dom.js';
import draw from './draw_canvas.js';

let templates = {
    // Überschrift
    header({
        inhalt = '',
        eltern = false,
        events = {},
    }) {
        dom.erzeugen({
            typ: 'h2',
            klassen: ['header'],
            inhalt,
            eltern,
            events
        })
    },
    // Deutscher / Englischer Name
    commonName({
        de = false,
        en = false,
        eltern = false,
        language = 'de'
    }) {
        if (de || en) {
            dom.erzeugen({
                eltern,
                klassen: ['zoologisch'],
                inhalt: language == 'de' ? de : en,
            })
        }
    },
    // Vorangegangene Tiere als Liste
    erbschaft({
        eltern = false,
        kette = [],
        baum = [],
        draw=()=>{},
        zeichne=()=>{},
        inhalt='',
    }) {
        let neu = dom.erzeugen({
            klassen: ['erbschaftskette'],
            eltern
        })

        let kettenHeader = dom.erzeugen({
            eltern: neu,
            typ: 'h3',
            inhalt: inhalt,
            events:{
                click(){
                    neu.classList.toggle('offen');
                }
            }
        })

        dom.erzeugen({
            eltern: kettenHeader,
            klassen: 'offenIndikator'
        })

        let kettencontainer = dom.erzeugen({
            eltern: neu,
            klassen: ['kette']
        })

        kette.forEach(el => {
            dom.erzeugen({
                typ: 'span',
                inhalt: el,
                eltern: kettencontainer,
                klassen: ['vorfahr'],
                events: {
                    click() {
                        draw.settings.offsetY = -baum.find(ast => ast.name == el).posY;
                        zeichne();
                    }
                }
            })
        })
    },
    // Simples Info-Element
    info({
        bez = '',
        data = undefined,
        eltern = false,
        mass = '',
    }) {
        let info = dom.erzeugen({
            eltern,
            klassen: ['infoattribut']
        });
        dom.erzeugen({
            klassen: ['legend'],
            typ: 'span',
            inhalt: bez,
            eltern: info
        });
        dom.erzeugen({
            klassen: ['data'],
            typ: 'span',
            inhalt: data + (mass ? ` ${mass}` : ''),
            eltern: info
        });
    },
    // Datensammlung wie Nahrung, Lebensraum
    sammlung({
        daten = {},
        titel = false,
        eltern = false,
        icons = {}
    }) {

        let container = dom.erzeugen({
            eltern,
            klassen: ['datensammlung']
        })

        dom.erzeugen({
            eltern: container,
            typ: 'span',
            inhalt: titel,
            klassen: ['spanHead']
        })

        for (let key in daten) {
            if (daten[key]) {
                let ding = dom.erzeugen({
                    eltern: container,
                    klassen:['bildcontainer']
                })
                dom.erzeugen({
                    eltern: ding,
                    typ: 'img',
                    src: `bilder/${icons[key]}.png`,
                })
                dom.erzeugen({
                    inhalt: key,
                    eltern: ding,
                    klassen:['sammlungBeschriftung']
                })
            }
        }

    },
    link({
        link = '',
        titel = '',
        eltern = false
    }) {
        dom.erzeugen({
            typ: 'a',
            attr: {
                href: link,
                target: '_blank'
            },
            inhalt: titel,
            eltern
        })
    }
}

export default templates;