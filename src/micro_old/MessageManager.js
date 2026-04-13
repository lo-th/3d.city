/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */



export class MessageManager {

    constructor () {
        this.data = [];
    }

    sendMessage (message, data) {
        this.data.push({message: message, data: data});
    }
    
    clear () {
        this.data = [];
    }

    getMessages () {
        return this.data.slice();
    }

}

