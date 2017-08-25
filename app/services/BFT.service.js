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
var map_openlayer_service_1 = require('./map.openlayer.service');
var app_config_1 = require('../config/app.config');
require('rxjs/add/operator/map');
var BFTService = (function () {
    function BFTService(http, mapService, config) {
        this.http = http;
        this.mapService = mapService;
        this.config = config;
    }
    BFTService.prototype.initBFT = function () {
        var _this = this;
        this.http.get(this.config.BFT_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processBFT(data); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    BFTService.prototype.processBFT = function (data) {
        this.BFTlist = data;
        console.log("BFTlist", data);
        this.getORBAT();
    };
    BFTService.prototype.getORBAT = function () {
        var _this = this;
        this.http.get(this.config.ORBAT_URL)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.processORBAT(data); }, function (err) { return _this.logError(err); }, function () { return console.log(); });
    };
    BFTService.prototype.processORBAT = function (data) {
        this.ORBATlist = data;
        console.log("ORBATlist", data);
        // Process BFT & ORBAT list
        this.updateORBATlist();
        this.populateAncestor();
        this.setLocation();
        this.calcLocation();
        // Plot on map
        this.mapService.plotBFTs(this.ORBATlist);
    };
    BFTService.prototype.updateORBATlist = function () {
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
    };
    BFTService.prototype.setRange = function (entity) {
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
    };
    BFTService.prototype.populateAncestor = function () {
        for (var i = 0; (i < this.BFTlist.length); i++) {
            for (var j = 0; (j < this.ORBATlist.length)
                && (this.BFTlist[i].Ancestors == null); j++) {
                if (this.ORBATlist[j].Personnel == this.BFTlist[i].Personnel) {
                    this.BFTlist[i].Ancestors = this.ORBATlist[j].Ancestors;
                }
            }
        }
    };
    BFTService.prototype.setLocation = function () {
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
                        }
                        else {
                            this.ORBATlist[k].location.lat += this.BFTlist[i].lat;
                            this.ORBATlist[k].location.lon += this.BFTlist[i].lon;
                            this.ORBATlist[k].numActiveBaseDescendants += 1;
                        }
                    }
                }
            }
        }
    };
    BFTService.prototype.calcLocation = function () {
        for (var j = 0; j < this.ORBATlist.length; j++) {
            if (this.ORBATlist[j].numActiveBaseDescendants > 0) {
                this.ORBATlist[j].location.lat /=
                    this.ORBATlist[j].numActiveBaseDescendants;
                this.ORBATlist[j].location.lon /=
                    this.ORBATlist[j].numActiveBaseDescendants;
            }
        }
    };
    BFTService.prototype.logError = function (err) {
        console.error(err);
    };
    BFTService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, map_openlayer_service_1.OpenlayersMapService, app_config_1.AppConfigService])
    ], BFTService);
    return BFTService;
}());
exports.BFTService = BFTService;
//# sourceMappingURL=BFT.service.js.map