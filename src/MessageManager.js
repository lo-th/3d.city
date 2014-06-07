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

