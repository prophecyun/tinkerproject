"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var core_2 = require('@angular/core');
// Constants
// TODO: Move to constants file
var CIMS_BASE = "http://localhost:8080/CimsOps/";
// TODO: This service has not been tested/debugged
var MessageService = (function () {
    // Initialization
    function MessageService() {
        this.message = new core_2.EventEmitter();
        /* Public variables */
        this.connected = false;
        this.stompClient = null;
        this.connect();
    }
    ;
    /* Public methods */
    MessageService.prototype.disconnect = function () {
        if (this.connected)
            this.stompClient.disconnect();
    };
    MessageService.prototype.connect = function () {
        if (this.connected)
            return;
        var url = CIMS_BASE + 'endpoint';
        var socket = new SockJS(url, null, { debug: true });
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;
        var that = this;
        this.stompClient.connect({}, function (frame) {
            that.stompClient.subscribe("/topic/cims/", function (data) {
                console.log(data);
                var messages = JSON.parse(data.body);
                for (var i = 0; i < messages.length; i++) {
                    var msgType = messages[i].messageType;
                    if (msgType === "folder.create") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    if (msgType === "folder.update") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incident.create") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incident.update") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incident.move") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incidentupdate.text.create") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incidentupdate.text.share") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incidentupdate.file.create") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "incidentupdate.file.share") {
                        this.broadcast("msg.incidents.changed", messages[i]);
                    }
                    else if (msgType === "task.create") {
                        this.broadcast("msg.tasks.changed", messages[i]);
                    }
                    else if (msgType === "task.update") {
                        this.broadcast("msg.tasks.changed", messages[i]);
                    }
                    else {
                    }
                }
            });
            this.connected = true;
        });
    };
    // Inform listeners of change
    MessageService.prototype.broadcast = function (topic, data) {
        // $rootScope.$broadcast(topic, data);
        // TODO: Implement
    };
    MessageService.prototype.sendMessage = function (channel, data) {
        this.stompClient.send(channel, {}, JSON.stringify(data));
    };
    MessageService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MessageService);
    return MessageService;
}());
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map