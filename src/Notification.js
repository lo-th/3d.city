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