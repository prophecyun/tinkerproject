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
var http_1 = require('@angular/http');
var map_service_1 = require('./map.service');
var map_openlayer_service_1 = require('./map.openlayer.service');
var util_service_1 = require('./util.service');
var subject_1 = require('rxjs/subject');
var app_config_1 = require('../config/app.config');
require('rxjs/add/operator/map');
var IncidentService = (function () {
    // TODO: Create typedef for Incident
    function IncidentService(http, mapService, openlayersMapService, utilService, config) {
        this.http = http;
        this.mapService = mapService;
        this.openlayersMapService = openlayersMapService;
        this.utilService = utilService;
        this.config = config;
        this.incidents = [];
        this.activeIncidentSource = new subject_1.Subject();
        this.activeIncident$ = this.activeIncidentSource.asObservable();
        this.incidentsSource = new subject_1.Subject();
        this.incidents$ = this.incidentsSource.asObservable();
    }
    IncidentService.prototype.initIncidents = function () {
        this.getFolders();
    };
    IncidentService.prototype.setActiveIncident = function (incidentId) {
        for (var i = 0; i < this.incidents.length; i++) {
            if (this.incidents[i].incidentId == incidentId) {
                this.activeIncidentSource.next(this.incidents[i]);
                return;
            }
        }
        console.error("Cannot find incident with id: " + incidentId);
    };
    IncidentService.prototype.getFolders = function () {
        var _this = this;
        this.http.get(this.config.FOLDERS_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processFolders(data); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    IncidentService.prototype.processFolders = function (data) {
        this.getIncidents(data);
        console.log("incidents from CIMS: ", this.incidents);
    };
    IncidentService.prototype.getIncidents = function (folders) {
        for (var i = 0; i < folders.length; i++) {
            folders[i].incidentList = this.loadIncidents(folders[i].folderId);
        }
    };
    IncidentService.prototype.loadIncidents = function (folderId) {
        var _this = this;
        var incident_URL = this.config.FOLDERS_URL + '/' + folderId + '/incidents';
        this.http.get(incident_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processIncident(data); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    IncidentService.prototype.processIncident = function (list) {
        for (var i = 0; i < list.length; i++) {
            list[i].startTimestamp = new Date(list[i].startTimestamp);
            list[i].unitLogo = this.utilService.getOrgLogo(list[i].reportedBy);
            list[i].folder = JSON.parse(list[i].folder);
            list[i].tasks = [];
            list[i].updates = [];
            this.loadTasks(list[i].incidentId, list[i]);
            this.loadUpdates(list[i].incidentId, list[i]);
            this.incidents.push(list[i]);
        }
        this.openlayersMapService.plotIncidents(this.incidents);
    };
    IncidentService.prototype.loadUpdates = function (incidentId, incident) {
        var textData = this.loadUpdatesText(incidentId, incident);
        var fileData = this.loadUpdatesFiles(incidentId, incident);
    };
    IncidentService.prototype.loadUpdatesText = function (incidentId, incident) {
        var _this = this;
        var text_URL = this.config.INCIDENTS_URL + incidentId + '/textupdates';
        this.http.get(text_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processUpdatesText(data, incident); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    IncidentService.prototype.loadUpdatesFiles = function (incidentId, incident) {
        var _this = this;
        var file_URL = this.config.INCIDENTS_URL + incidentId + '/fileupdates';
        this.http.get(file_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processUpdatesFiles(data, incident); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    IncidentService.prototype.processUpdatesText = function (data, incident) {
        for (var i = 0; i < data.length; i++) {
            data[i].startTimestamp = new Date(data[i].timestamp);
            data[i].fav = false;
            data[i].image = "";
            data[i].video = "";
            data[i].audio = "";
            incident.updates.push(data[i]);
        }
    };
    IncidentService.prototype.processUpdatesFiles = function (data, incident) {
        for (var i = 0; i < data.length; i++) {
            var mimeType = data[i].mimetype;
            data[i].startTimestamp = new Date(data[i].timestamp);
            data[i].incidentUpdate = data[i].description;
            data[i].fav = false;
            if (mimeType == 'image/png' || mimeType === 'image/jpg' || mimeType === 'image/jpeg') {
                data[i].image = this.config.FILE_UPDATE_URL + data[i].updateId;
                data[i].video = "";
                data[i].audio = "";
                incident.updates.push(data[i]);
            }
            else if (mimeType === 'application/octet-stream' || mimeType === 'video/mp4') {
                data[i].image = "";
                data[i].video = this.config.FILE_UPDATE_URL + data[i].updateId;
                data[i].audio = "";
                incident.updates.push(data[i]);
            }
        }
    };
    IncidentService.prototype.loadTasks = function (incidentId, incident) {
        var _this = this;
        var task_URL = this.config.TASK_URL + incidentId;
        this.http.get(task_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processTask(data, incident); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    IncidentService.prototype.processTask = function (data, incident) {
        incident.tasks = data;
        this.incidentsSource.next(this.incidents);
    };
    IncidentService.prototype.logError = function (err) {
        console.error(err);
    };
    IncidentService.prototype.loadDummyIncidents = function () {
        // let incidentLocations = [
        //     { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
        //     { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
        //     { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
        //     { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        // ];
        // return incidentLocations;
        var sampleIncidents = [
            {
                "summary": "Suspected bomb threat at Terminal 2. All planes currently grounded. Awaiting update from IDTF Platoon 1.",
                "locationName": "Changi Airport",
                "updatedBy": "SCDF OpsOfficer",
                "reportedBy": "IDTF HQ",
                "folderId": "8085b78d-dfe3-41cb-88bf-8865ee1e3719",
                "natureOfIncident": "Patrol",
                "updatedDateTime": 1461832170634,
                "syncIncidentId": ["b13e5139-9413-40a5-8694-64c8157c91c4-WOG"],
                "folder": "{\"folder\":\"SCDF\",\"messageType\":\"folder.create\",\"createdBy\":\"SCDF OpsOfficer\",\"permission\":[\"SCDF HQ\",\"MHA HCCC\"],\"reportedBy\":\"SCDF HQ\",\"folderId\":\"8085b78d-dfe3-41cb-88bf-8865ee1e3719\",\"timestamp\":1461826855681,\"incidentList\":[],\"$$mdSelectId\":2}",
                "createdBy": "SCDF OpsOfficer",
                "location": { "lon": 103.98744, "lat": 1.35343, "height": 85 },
                "_id": "5721b692de191f1134e4b0c4",
                "incidentName": "Bomb Threat",
                "incidentId": "4f95c0b4-bcf5-408c-940a-b0f78cf848bc",
                "startTimestamp": "2016-05-28T07:22:00.000Z",
                "status": "CLOSED",
                "timestamp": 1461827218309
            }
        ];
        return sampleIncidents;
    };
    IncidentService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, map_service_1.MapService, map_openlayer_service_1.OpenlayersMapService, util_service_1.UtilService, app_config_1.AppConfigService])
    ], IncidentService);
    return IncidentService;
}());
exports.IncidentService = IncidentService;
//# sourceMappingURL=incident.service.js.map