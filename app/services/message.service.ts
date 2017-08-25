import { Injectable } from '@angular/core'
import { EventEmitter } from '@angular/core'

// Constants
// TODO: Move to constants file
const CIMS_BASE = "http://localhost:8080/CimsOps/";

// TODO: This service has not been tested/debugged

@Injectable()
// Handles web socket connection to Cims backend
export class MessageService {

    message: EventEmitter<any> = new EventEmitter();

    // Initialization
    constructor() {
        this.connect();
    };

    /* Public variables */
    connected: boolean = false;
    stompClient: Stomp.Client = null;

    /* Public methods */
    disconnect(): void {
        if (this.connected)
            this.stompClient.disconnect();
    }

    connect(): void {
        if (this.connected)
            return;
        let url: string = CIMS_BASE + 'endpoint';
        let socket: WebSocket = new SockJS(url, null, { debug: true });
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;
        let that: any = this;
        this.stompClient.connect({}, function (frame: Stomp.Frame) {
            that.stompClient.subscribe("/topic/cims/",
                function (data: any) {
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
                            // exception handling
                        }
                    }
                });
            this.connected = true;
        });
    }

    // Inform listeners of change
    broadcast(topic: any, data: any): void {
        // $rootScope.$broadcast(topic, data);
        // TODO: Implement
    }

    sendMessage(channel: any, data: any): void {
        this.stompClient.send(channel, {}, JSON.stringify(data));
    }
}