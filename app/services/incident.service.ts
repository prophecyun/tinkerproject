import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Rx'
import { MapService } from './map.service'
import { OpenlayersMapService } from './map.openlayer.service'
import { UtilService } from './util.service'
import { Subject } from 'rxjs/subject'
import { AppConfigService } from '../config/app.config';
import 'rxjs/add/operator/map'



@Injectable()
// Service to request incidents & updates from server
export class IncidentService {

    // TODO: Create typedef for Incident

    constructor(private http: Http,
        private mapService: MapService,
        private openlayersMapService: OpenlayersMapService, 
        private utilService: UtilService,
        private config: AppConfigService) { }

    
    private incidents: any = [];
    private activeIncidentSource = new Subject<any>();
    activeIncident$ = this.activeIncidentSource.asObservable();
    private incidentsSource = new Subject<any>();
    incidents$ = this.incidentsSource.asObservable();

    initIncidents(): void {
        this.getFolders();
    }

    setActiveIncident(incidentId: string): void {
        for (let i = 0; i < this.incidents.length; i++) {
            if (this.incidents[i].incidentId == incidentId) {
                this.activeIncidentSource.next(this.incidents[i]);
                return;
            }
        }
        console.error("Cannot find incident with id: " + incidentId);
    }

    private getFolders(): void {
        this.http.get(this.config.FOLDERS_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processFolders(data),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processFolders(data: any): void {
        this.getIncidents(data);
        console.log("incidents from CIMS: ", this.incidents);
    }

    private getIncidents(folders: any): void {
        for (let i = 0; i < folders.length; i++) {
            folders[i].incidentList = this.loadIncidents(folders[i].folderId);
        }
    }

    private loadIncidents(folderId: string): void {
        let incident_URL: string = this.config.FOLDERS_URL + '/' + folderId + '/incidents';
        this.http.get(incident_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processIncident(data),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processIncident(list: any) {
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
    }

    private loadUpdates(incidentId: string, incident: any): any {
        let textData: any = this.loadUpdatesText(incidentId, incident);
        let fileData: any = this.loadUpdatesFiles(incidentId, incident);
    }

    private loadUpdatesText(incidentId: string, incident: any): any {
        let text_URL: string = this.config.INCIDENTS_URL + incidentId + '/textupdates';
        this.http.get(text_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processUpdatesText(data, incident),
            err => this.logError(err),
            () => console.log()
            );
    }

    private loadUpdatesFiles(incidentId: string, incident: any): any {
        let file_URL: string = this.config.INCIDENTS_URL + incidentId + '/fileupdates';
        this.http.get(file_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processUpdatesFiles(data, incident),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processUpdatesText(data: any, incident: any) {
        for (let i = 0; i < data.length; i++) {
            data[i].startTimestamp = new Date(data[i].timestamp);
            data[i].fav = false;
            data[i].image = "";
            data[i].video = "";
            data[i].audio = "";
            incident.updates.push(data[i]);
        }
    }

    private processUpdatesFiles(data: any, incident: any) {
        for (let i = 0; i < data.length; i++) {
            let mimeType: any = data[i].mimetype;
            data[i].startTimestamp = new Date(data[i].timestamp);
            data[i].incidentUpdate = data[i].description;
            data[i].fav = false;
            if (mimeType == 'image/png' || mimeType === 'image/jpg' || mimeType === 'image/jpeg') {
                data[i].image = this.config.FILE_UPDATE_URL + data[i].updateId;
                data[i].video = "";
                data[i].audio = "";
                incident.updates.push(data[i]);
            } else if (mimeType === 'application/octet-stream' || mimeType === 'video/mp4') {
                data[i].image = "";
                data[i].video = this.config.FILE_UPDATE_URL + data[i].updateId;
                data[i].audio = "";
                incident.updates.push(data[i]);
            }
        }
    }

    private loadTasks(incidentId: string, incident: any): any {
        let task_URL: string = this.config.TASK_URL + incidentId;
        this.http.get(task_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processTask(data, incident),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processTask(data: any, incident: any): void {
        incident.tasks = data;
        this.incidentsSource.next(this.incidents);
    }

    private logError(err: string) {
        console.error(err);
    }

    public loadDummyIncidents(): any {
        // let incidentLocations = [
        //     { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
        //     { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
        //     { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
        //     { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        // ];
        // return incidentLocations;

        let sampleIncidents: any = [
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
    }
}