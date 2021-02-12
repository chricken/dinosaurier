'use strict';
//import sichern from './sichern.js';

let dom = {
    erzeugen({
        inhalt = false,
        klassen = [],
        eltern = false,
        typ = 'div',
        id = false,
        events = {},
        value = false,
        src = false,
        attr = {},
        style = {},
        checked = false,
    } = {}) {
        let neu = document.createElement(typ);
        if (klassen.length) {
            neu.className = Array.isArray(klassen) ? klassen.join(' ') : klassen;
        }
        if (eltern) eltern.append(neu);
        if (inhalt) neu.innerHTML = inhalt;
        if (id) neu.id = id;
        if (value) neu.value = value;
        if (src) neu.src = src;
        if (checked) neu.checked = 'true';
        Object.entries(events).forEach(event => neu.addEventListener(...event));
        Object.entries(attr).forEach(at => neu.setAttribute(...at));
        Object.entries(style).forEach(st => neu.style[st[0]] = st[1]);
        return neu;
    },

    $(sel) {
        return document.querySelector(sel);
    },
    $$(sel) {
        return Array.from(document.querySelectorAll(sel));
    },
    translate(el) {
        //console.log(el.getAttribute('data-inhalt'));
        if (dom.language[el.getAttribute('data-inhalt')]) {
            el.innerHTML = dom.language[el.getAttribute('data-inhalt')].de
        }
    },

    templates: {
        detaileingabe({
            attribut = false,
            eltern = dom.$('#details .inner'),
            value = false,
        } = {}) {

            let p = dom.erzeugen({
                typ: 'p',
                eltern
            })
            if (attribut == "lebensraum" || attribut == "nahrung" || attribut == "kleid" || attribut == "schmuck") {
                // Lebensraum
                p.className = `cb${attribut}`;

                // Header
                dom.translate(
                    dom.erzeugen({
                        inhalt: attribut,
                        typ: 'h4',
                        eltern: p,
                        attr: {
                            'data-inhalt': attribut
                        }
                    })
                );

                // Optionen
                Object.entries(dom.attributes.find(el => el.bez == attribut).default).forEach(el => {

                    let legend = dom.erzeugen({
                        typ: 'label',
                        inhalt: el[0],
                        eltern: p,
                        attr: {
                            'data-inhalt': el[0]
                        }
                    })

                    dom.translate(legend);

                    dom.erzeugen({
                        typ: 'input',
                        attr: {
                            type: 'checkbox',
                            'data-typ': el[0],
                        },
                        checked: value[el[0]],
                        eltern: legend
                    })
                })

            } else if (attribut == "color") {
                // Farbeingabe
                let legend = dom.erzeugen({
                    eltern: p,
                    typ: 'span',
                    inhalt: attribut,
                    klassen: ['legende'],
                    attr: {
                        'data-inhalt': attribut
                    }
                })

                dom.translate(legend);

                let input = dom.erzeugen({
                    eltern: p,
                    typ: 'input',
                    attr: { type: 'color' },
                    klassen: [attribut],
                    value
                })

            } else {
                // Normale Texteingabe
                let legend = dom.erzeugen({
                    eltern: p,
                    typ: 'span',
                    inhalt: attribut,
                    klassen: ['legende'],
                    attr: {
                        'data-inhalt': attribut
                    }
                })

                dom.translate(legend);

                let input = dom.erzeugen({
                    eltern: p,
                    typ: 'input',
                    attr: { type: 'text' },
                    klassen: [attribut],
                    value
                })

                // Abschnitt, um den Text aus Wiki bzgl. des Alters zu interpretieren
                if (attribut == 'mioJhrVonBis') {
                    input.placeholder = 'z.B. "100 bis 60 Mio Jahre"';
                    input.addEventListener('change', () => {
                       
                        if (input.value.indexOf('–') > -1) {
                            //console.log (input.value.split(' ')[0].split('–'));
                            let split = input.value.split(' ')[0].split('–');
                            dom.templates.detaileingabe({
                                value: split[0],
                                eltern,
                                attribut: 'mioJhrVon'
                            });
                            dom.templates.detaileingabe({
                                value: split[1],
                                eltern,
                                attribut: 'mioJhrBis'
                            });
                        } else {
                            dom.templates.detaileingabe({
                                value: input.value.split(' ')[0].replace(',', '.'),
                                eltern,
                                attribut: 'mioJhrVon'
                            });
                            dom.templates.detaileingabe({
                                value: input.value.split(' ')[2].replace(',', '.'),
                                eltern,
                                attribut: 'mioJhrBis'
                            });
                        }
                        p.remove();
                        //sichern.eingabeEintragen();
                    })
                }
                dom.templates.emptyThis(input);
            }

            return p;
        },
        detailAusgabe({
            attribut = false,
            eltern = dom.$('#details .inner'),
            value = false,
        } = {}) {

            let p = dom.erzeugen({
                typ: 'p',
                eltern
            })
            if (attribut == "lebensraum" || attribut == "nahrung" || attribut == "kleid" || attribut == "schmuck") {
                // Lebensraum
                p.className = `cb${attribut}`;

                // Header
                dom.translate(
                    dom.erzeugen({
                        inhalt: attribut,
                        typ: 'h4',
                        eltern: p,
                        attr: {
                            'data-inhalt': attribut
                        }
                    })
                );

                // Optionen
                Object.entries(dom.attributes.find(el => el.bez == attribut).default).forEach(el => {

                    if (value[el[0]]) {
                        dom.erzeugen({
                            typ: 'img',
                            attr: {
                                src: `bilder/icon_${el[0]}.png`,
                                alt: el[0]
                            },
                            eltern: p,
                            klassen: 'icon'
                        })
                    }
                })

            } else if (attribut == "fundort") {
                // Lebensraum
                p.className = `map map${attribut}`;

                // Header
                dom.translate(
                    dom.erzeugen({
                        inhalt: attribut,
                        typ: 'h4',
                        eltern: p,
                        attr: {
                            'data-inhalt': attribut
                        }
                    })
                );

                // Links zur Karte
                let values = value.split(',').map(el => el.trim());
                // console.log(values);
                values.forEach(value => {
                    dom.translate(
                        dom.erzeugen({
                            inhalt: value,
                            typ: 'a',
                            eltern: p,
                            attr: {
                                href: `https://www.google.de/maps/place/${value}`,
                                target: '_blank'
                            }
                        })
                    )
                })
            } else if (attribut == "color" || attribut == 'de' || attribut == 'en') {

            } else {
                let legend = dom.erzeugen({
                    eltern: p,
                    typ: 'span',
                    inhalt: attribut,
                    klassen: ['output', 'legende'],
                    attr: {
                        'data-inhalt': attribut
                    }
                })

                dom.translate(legend);

                let input = dom.erzeugen({
                    eltern: p,
                    typ: 'span',
                    klassen: ['output', attribut],
                    inhalt: value
                })

            }
            //console.log( dom );

            return p;
        },
        emptyThis(el) {
            let neu = dom.erzeugen({
                klassen: ['inputEltern']
            })
            el.parentNode.insertBefore(neu, el);
            neu.append(el);
            dom.erzeugen({
                klassen: 'btnEmpty',
                eltern: neu,
                inhalt: 'X',
                events: {
                    click() {
                        el.value = '';
                        el.focus();
                        [...dom.$$('.parentOfFilter')].forEach( el => el.classList.remove('parentOfFilter'));
                        [...dom.$$('.hidden')].forEach( el => el.classList.remove('hidden'));
                    }
                }
            })
        }
    },
    // Funktionen
    zufall(min, max) {
        return ~~(Math.random() * (max - min + 1) + min);
    },
    zufallFarbe() {
        let zeichen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];
        let farbe = '#';
        for (let i = 0; i < 6; i++) {
            farbe += zeichen[dom.zufall(0, zeichen.length - 1)]
        }
        return farbe;
    }
}
export default dom;