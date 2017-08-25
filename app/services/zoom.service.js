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
var ZoomService = (function () {
    function ZoomService() {
        this.prevRange = 0 /* None */;
        this.stored = false;
        this.showAll = true;
    }
    // Temporary workaround for the need to style vectors based on the current zoom level
    // TODO: Remove once vectors are changed to be retrieved from a map server
    ZoomService.prototype.handleZoom = function (height, dataSources) {
        this.currRange = this.getRange(height);
        if (this.currRange != this.prevRange) {
            if (!this.stored) {
                this.storeDataSources(dataSources);
            }
            // Toggle all vectors
            if (this.showAll) {
                this.toggleAll(this.currRange);
            }
            // Save current range
            this.prevRange = this.currRange;
        }
    };
    ZoomService.prototype.toggleShow = function () {
        this.showAll = !this.showAll;
        // Show vectors based on current range
        if (this.showAll) {
            this.toggleAll(this.currRange);
        }
        else {
            this.toggleAll(5 /* Hide */);
        }
    };
    /* Private methods */
    // Toggle all vectors based on the current range
    ZoomService.prototype.toggleAll = function (currRange) {
        switch (currRange) {
            case 1 /* Level1 */:
                this.toggleSource(this.roads0, true, 2);
                this.toggleSource(this.roads1, true, 1);
                this.toggleSource(this.roads2, false, 0);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, true, 0);
                break;
            case 2 /* Level2 */:
                this.toggleSource(this.roads0, true, 3);
                this.toggleSource(this.roads1, true, 2);
                this.toggleSource(this.roads2, true, 1);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, true, 0);
                break;
            case 3 /* Level3 */:
                this.toggleSource(this.roads0, true, 4);
                this.toggleSource(this.roads1, true, 3);
                this.toggleSource(this.roads2, true, 2);
                this.toggleSource(this.landusages, true, 0);
                this.toggleSource(this.ao, false, 0);
                break;
            case 4 /* Level4 */:
                this.toggleSource(this.roads0, true, 5);
                this.toggleSource(this.roads1, true, 4);
                this.toggleSource(this.roads2, true, 3);
                this.toggleSource(this.landusages, true, 0);
                this.toggleSource(this.ao, false, 0);
                break;
            case 5 /* Hide */:
                this.toggleSource(this.roads0, false, 0);
                this.toggleSource(this.roads1, false, 0);
                this.toggleSource(this.roads2, false, 0);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, false, 0);
                break;
        }
    };
    // Toggle show/hide and vector width for the given data source
    ZoomService.prototype.toggleSource = function (ds, show, width) {
        if (ds) {
            // console.log(ds, show);
            ds.show = show;
            // console.log(ds, show);
            if (show && (width > 0)) {
                ds.entities.suspendEvents();
                this.setWidth(ds, width);
                ds.entities.resumeEvents();
            }
        }
    };
    // Set the width of the given data source vector
    ZoomService.prototype.setWidth = function (ds, width) {
        var entities = ds.entities.values;
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            var entityWidth = entity.polyline.width;
            entityWidth = width;
        }
    };
    // Get the zoom range for the given height
    ZoomService.prototype.getRange = function (height) {
        if (height > 40000)
            return 1 /* Level1 */;
        else if (height > 15000)
            return 2 /* Level2 */;
        else if (height > 10000)
            return 3 /* Level3 */;
        else
            return 4 /* Level4 */;
    };
    // Store the data sources into local variables
    ZoomService.prototype.storeDataSources = function (dataSources) {
        var stored = true;
        if (!this.roads0) {
            this.roads0 = this.getDataSource("roads_0.geojson", dataSources);
            if (!this.roads0)
                stored = false;
        }
        if (!this.roads1) {
            this.roads1 = this.getDataSource("roads_1.geojson", dataSources);
            if (!this.roads1)
                stored = false;
        }
        if (!this.roads2) {
            this.roads2 = this.getDataSource("roads_2.geojson", dataSources);
            if (!this.roads2)
                stored = false;
        }
        if (!this.landusages) {
            this.landusages = this.getDataSource("landusages_mod.geojson", dataSources);
            if (!this.landusages)
                stored = false;
        }
        if (!this.ao) {
            this.ao = this.getDataSource("ao.geojson", dataSources);
            if (!this.ao)
                stored = false;
        }
        this.stored = stored;
    };
    // Get the data source object with the given name
    ZoomService.prototype.getDataSource = function (name, dataSources) {
        for (var i = 0; i < dataSources.length; i++) {
            var dataSource = dataSources.get(i);
            if (dataSource.name == name) {
                return dataSource;
            }
        }
        return null;
    };
    ZoomService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ZoomService);
    return ZoomService;
}());
exports.ZoomService = ZoomService;
//# sourceMappingURL=zoom.service.js.map