'use strict';

import dom from './dom.js'

let draw = {
    settings: {
        speciesHeight: 30,
        groupHeight: 40,

        oldest: 358,
        newest: 0,

        counter: 0,
        offsetY: 0,

        scrollSpeed: 50,
        mouseX: -1,
        mouseY: -1,

        sichtbareObjekte: [],
        aktivesObjekt: {},
        geklicktesObjekt: {},

        firstInDisplay: 0,
        lastInDisplay: 0,
        last: 0,
        numElemente: 0,

        scrollbarWidth: 20,
        scrollbarPressed: false,

        // Bilder
        imgRaster: dom.$('#imgRaster'),
    },
    makeFillFarbe(hue) {
        return `hsl(${hue},70%,70%)`
    },
    makeFillAktivFarbe(hue) {
        return `hsl(${hue},70%,90%)`
    },
    makeStrokeFarbe(hue) {
        return `hsl(${hue},70%,20%)`
    },
    makeBGFarbe(hue) {
        return `hsla(${hue},50%,100%,.3)`
    },
    makeToChildrenFarbe(hue) {
        return `hsl(0,100%,50%)`
    },
    makeToParentFarbe(hue) {
        return `hsl(120,100%,40%)`
    },
    age(c, ctx, name, oldest, newest, hue) {
        let left = c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * oldest);
        let right = c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * newest);

        let verlauf = ctx.createLinearGradient(left, 0, right, 0);
        verlauf.addColorStop(0, `hsl(${hue},30%,90%)`);
        verlauf.addColorStop(1, `hsl(${hue},30%,80%)`);
        ctx.fillStyle = verlauf;

        ctx.fillRect(left, 0, right - left, c.height);

        ctx.strokeStyle = `hsl(${hue},30%,50%,.4)`
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(right, 0);
        ctx.lineTo(right, c.height);
        ctx.stroke();

        ctx.fillStyle = `hsl(${hue},30%,80%)`;
        ctx.textAlign = "right";
        ctx.font = '700 30px oswald';
        ctx.translate(left + 40, 40);
        ctx.rotate(-90 * Math.PI / 180);
        ctx.fillText(name, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

    },
    gruppe(c, ctx, gruppe, speziesOutput) {
        let [mouseX, mouseY] = [draw.settings.mouseX, draw.settings.mouseY];
        let left = gruppe.mioJhrVon
            ? c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * gruppe.mioJhrVon)
            : 0;

        let right = gruppe.mioJhrBis
            ? c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * gruppe.mioJhrBis)
            : c.width;

        let oben = gruppe.posY + this.settings.offsetY;
        let height = gruppe.children ? this.settings.groupHeight : this.settings.speciesHeight;

        ctx.lineWidth = 1;
        ctx.strokeStyle = this.makeStrokeFarbe(gruppe.color);

        if (gruppe == draw.settings.geklicktesObjekt) {
            this.bgAktiv(c, ctx, oben, height, 0);
        }

        if (mouseY > oben && mouseY < oben + height) {
            this.bg(c, ctx, oben, height, gruppe.color);
            draw.settings.aktivesObjekt = gruppe;
            ctx.fillStyle = this.makeFillAktivFarbe(gruppe.color);
            // Flag, ob sich die Maus über dem Opener befindet
            gruppe.overOpener = (mouseX > left - 10 && mouseX < left + 10);
        } else {
            ctx.fillStyle = this.makeFillFarbe(gruppe.color);
        }

        ctx.fillRect(
            ~~(left),
            ~~(oben),
            ~~(right - left),
            ~~(height)
        );

        ctx.strokeRect(
            ~~(left),
            ~~(oben),
            ~~(right - left),
            ~~(height)
        );

        this.beschriftung(
            c,
            ctx,
            gruppe,
            left,
            height,
            speziesOutput
        );
        if (gruppe.children) {
            this.openMarker(
                c,
                ctx,
                gruppe,
                left,
                oben,
                height,
            )
        }
    },

    openMarker(c, ctx, gruppe, left, oben, height, ) {
        // console.log(left, oben);
        ctx.lineWidth = 2;
        if (gruppe.overOpener && draw.settings.aktivesObjekt == gruppe) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
        } else {
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#fff';
        }
        ctx.beginPath();
        if (gruppe.open == undefined || gruppe.open == true) {
            ctx.moveTo(left - 7, oben + (height / 4));
            ctx.lineTo(left + 7, oben + (height / 4));
            ctx.lineTo(left, oben + (height / 5 * 4));
            ctx.lineTo(left - 7, oben + (height / 4));
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.moveTo(left - 5, oben + (height / 3));
            ctx.lineTo(left + 10, oben + (height / 2));
            ctx.lineTo(left - 5, oben + (height / 3 * 2));
            ctx.lineTo(left - 5, oben + (height / 3));
            ctx.fill();
            ctx.stroke();
        }
    },
    beschriftung(c, ctx, gruppe, left, height, speziesOutput) {
        // console.log(gruppe.name, speziesOutput);

        let beschriftung = gruppe.name;
        if (gruppe.de) beschriftung += ` (${gruppe.de})`;

        // Wenn das Element zu weit rechts ist, Text nach links anhängen
        let right = false;
        if (left > c.width * .9) {
            right = left;
        }

        // Hintergrund für Beschriftung
        if (!gruppe.children) {
            ctx.fillStyle = `hsla(0,0%,100%,1)`;
        } else {
            ctx.fillStyle = `hsla(${gruppe.color},100%,20%,1)`;
        }
        ctx.fillRect(
            ~~(right ? left - (height * .6) - 100 : left + (height * .6)),
            ~~(gruppe.posY + (height * .1) + this.settings.offsetY),
            ~~(beschriftung.length * 8),
            ~~(height * .8)
        )
        ctx.lineWidth = .3;
        ctx.strokeStyle = 'hsla(0,0%,0%,1)';
        ctx.strokeRect(
            ~~(right ? left - (height * .6) - 100 : left + (height * .6)),
            ~~(gruppe.posY + (height * .1) + this.settings.offsetY),
            ~~(beschriftung.length * 8),
            ~~(height * .8)
        )

        // Beschriftung
        ctx.textAlign = 'left';
        ctx.font = '400 11px Oswald';

        if (!gruppe.children) {
            ctx.fillStyle = `hsla(0,0%,0%,1)`;
        } else {
            ctx.fillStyle = `hsla(0,0%,100%,1)`;
        }

        ctx.fillText(
            beschriftung,
            ~~(right ? left - 100 : left + (height * 1)),
            ~~(gruppe.posY + (height * .5) + this.settings.offsetY)
        );

        // Anzahl der Spezies
        if (gruppe.children) {
            ctx.font = '400 10px Oswald';
            ctx.fillText(
                speziesOutput,
                ~~(right ? left - 100 : left + (height * 1)),
                ~~(gruppe.posY + (height * .8) + this.settings.offsetY)
            );
        }

    },
    bg(c, ctx, oben, height, color) {
        ctx.fillStyle = this.makeBGFarbe(color);
        ctx.fillRect(
            0,
            ~~(oben),
            ~~(c.width),
            ~~(height)
        );
    },
    bgAktiv(c, ctx, oben, height) {
        ctx.globalAlpha = .2;
        ctx.fillStyle = '#ff0';
        ctx.fillRect(
            0,
            ~~(oben),
            ~~(c.width),
            ~~(height)
        );

        ctx.fillStyle = draw.settings.patternRaster;
        ctx.fillRect(
            0,
            ~~(oben),
            ~~(c.width),
            ~~(height)
        );

        ctx.globalAlpha = 1;
    },
    verknuepfung(c, ctx, gruppe) {

        if (gruppe.parent) {
            let left = ~~(c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * gruppe.parent.mioJhrVon) - 10);
            let right = ~~(c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * gruppe.mioJhrVon));
            ctx.moveTo(~~(right), ~~(gruppe.posY + (gruppe.height / 2) + this.settings.offsetY));
            ctx.lineTo(~~(left), ~~(gruppe.posY + (gruppe.height / 2) + this.settings.offsetY));

        }
    },
    vertikaleVerknuepfung(c, ctx, gruppe) {
        if (gruppe.parent) {
            let left = c.width - (c.width / (draw.settings.oldest - draw.settings.newest) * gruppe.parent.mioJhrVon) - 10;
            ctx.moveTo(~~(left), ~~(gruppe.posY + (gruppe.height / 2) + this.settings.offsetY));
            ctx.lineTo(~~(left), ~~(gruppe.parent.posY + this.settings.offsetY + (gruppe.parent.height / 2)));
            ctx.lineTo(~~(left + 10), ~~(gruppe.parent.posY + this.settings.offsetY + (gruppe.parent.height / 2)));
        }
    },
    scrollbar(c, ctx) {
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#888';

        ctx.fillRect(0, 0, draw.settings.scrollbarWidth, c.height);
        ctx.strokeRect(0, 0, draw.settings.scrollbarWidth, c.height);

        ctx.fillStyle = '#888';
        let scrollOben = c.height / draw.settings.last * draw.settings.firstInDisplay;
        let scrollUnten = c.height / draw.settings.last * draw.settings.lastInDisplay;
        ctx.fillRect(0, scrollOben, draw.settings.scrollbarWidth, (scrollUnten - scrollOben));
    }
}

export default draw;