import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Rx'
import { MapService } from './map.service'
import { OpenlayersMapService } from './map.openlayer.service'
import { AppConfigService } from '../config/app.config';
import 'rxjs/add/operator/map'


@Injectable()
// Service to request BFT/ORBAT data from server
export class BFTService {

    constructor(private http: Http, private mapService: OpenlayersMapService, private config: AppConfigService) { }

    private BFTlist: any;
    private ORBATlist: any;

    initBFT(): void {
        this.http.get(this.config.BFT_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processBFT(data),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processBFT(data: any): void {
        this.BFTlist = data;
        console.log("BFTlist", data);
        this.getORBAT();
    }

    private getORBAT(): void {
        this.http.get(this.config.ORBAT_URL)
            .map(res => res.json())
            .subscribe(
            data => this.processORBAT(data),
            err => this.logError(err),
            () => console.log()
            );
    }

    private processORBAT(data: any): void {
        this.ORBATlist = data;
        console.log("ORBATlist", data);
        // Process BFT & ORBAT list
        this.updateORBATlist();
        this.populateAncestor();
        this.setLocation();
        this.calcLocation();
        // Plot on map
        this.mapService.plotBFTs(this.ORBATlist);
    }

    private updateORBATlist(): void {
        for (var j = 0; j < this.ORBATlist.length; j++) {
            this.ORBATlist[j].level = this.ORBATlist[j].Ancestors.length;
            this.setRange(this.ORBATlist[j]);
            this.ORBATlist[j].location = {
                lat: -999,
                lon: -999
            };
            for (var i = 0; (i < this.BFTlist.length)
                && (this.ORBATlist[j].location.lat == -999); i++) {
                if (this.ORBATlist[j].Personnel == this.BFTlist[i].Personnel) {
                    this.ORBATlist[j].location.lat = this.BFTlist[i].lat;
                    this.ORBATlist[j].location.lon = this.BFTlist[i].lon;
                }
            }
            this.ORBATlist[j].numActiveBaseDescendants = 0;
        }
    }

    private setRange(entity: any): void {
        switch (entity.level) {
            case 0:
                entity.near = 100001;
                entity.far = 200000;
                break;
            case 1:
                entity.near = 50001;
                entity.far = 100000;
                break;
            case 2:
                entity.near = 20001;
                entity.far = 50000;
                break;
            case 3:
                entity.near = 0;
                entity.far = 20000;
                break;
        }
    }

    private populateAncestor(): void {
        for (var i = 0; (i < this.BFTlist.length); i++) {
            for (var j = 0; (j < this.ORBATlist.length)
                && (this.BFTlist[i].Ancestors == null); j++) {
                if (this.ORBATlist[j].Personnel == this.BFTlist[i].Personnel) {
                    this.BFTlist[i].Ancestors = this.ORBATlist[j].Ancestors;
                }
            }
        }
    }

    private setLocation(): void {
        for (var i = 0; (i < this.BFTlist.length); i++) {
            // loop through all ancestors
            for (var j = 0; j < this.BFTlist[i].Ancestors.length; j++) {
                // find the ancestor in this.ORBATlist to
                // increment its location value
                for (var k = 0; k < this.ORBATlist.length; k++) {
                    if (this.ORBATlist[k].Personnel == this.BFTlist[i].Ancestors[j]) {
                        // 1st descendant found
                        if (this.ORBATlist[k].location.lat == -999) {
                            this.ORBATlist[k].location.lat = this.BFTlist[i].lat;
                            this.ORBATlist[k].location.lon = this.BFTlist[i].lon;
                            this.ORBATlist[k].numActiveBaseDescendants = 1;
                        } else { // not the 1st descendant found
                            this.ORBATlist[k].location.lat += this.BFTlist[i].lat;
                            this.ORBATlist[k].location.lon += this.BFTlist[i].lon;
                            this.ORBATlist[k].numActiveBaseDescendants += 1;
                        }
                    }
                }
            }
        }
    }

    private calcLocation(): void {
        for (var j = 0; j < this.ORBATlist.length; j++) {
            if (this.ORBATlist[j].numActiveBaseDescendants > 0) {
                this.ORBATlist[j].location.lat /=
                    this.ORBATlist[j].numActiveBaseDescendants;
                this.ORBATlist[j].location.lon /=
                    this.ORBATlist[j].numActiveBaseDescendants;
            }
        }
    }

    private logError(err: string) {
        console.error(err);
    }
}