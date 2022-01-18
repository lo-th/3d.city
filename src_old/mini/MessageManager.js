/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.MessageManager = function(){
    this.data = [];
}
Micro.MessageManager.prototype = {
    constructor: Micro.MessageManager,
    sendMessage : function(message, data) {
        this.data.push({message: message, data: data});
    },
    clear : function() {
        this.data = [];
    },
    getMessages : function() {
        return this.data.slice();
    }
}

