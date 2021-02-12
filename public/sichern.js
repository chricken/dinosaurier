'use strict';

import dom from './dom.js';
import view from './view_be.js';

let o = {
    aufServerSichern() {
        // console.log( view.datensammlung );

        let saveRequest = new Request(
            '/saveData', {
                method: 'post',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(view.datensammlung, null, 4)
            }
        )

        fetch(saveRequest).then(
            antwort => antwort.json()
        ).then(
            antwort => {
                //console.log('Daten gesichert');
            }
        )
    },

}

export default o;