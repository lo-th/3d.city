/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Notification = function(){
    this.elem = document.getElementById("notifications");
}
Micro.Notification.prototype = {
    constructor: Micro.Notification,
    badNews : function(msg) {
        this.elem.className = 'bad';
        this.elem.innerHTML=(msg);
    },
    goodNews : function(msg) {
        this.elem.className = 'good';
        this.elem.innerHTML=msg;
    },
    news : function(msg) {
        this.elem.className = 'neutral';
        this.elem.innerHTML=msg;
    }
}