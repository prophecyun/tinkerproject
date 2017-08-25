import { Injectable } from '@angular/core'

@Injectable()
// Service to handle show/hide and width changes for map vectors
export class ZoomService {

    // Temporary workaround for the need to style vectors based on the current zoom level
    // TODO: Remove once vectors are changed to be retrieved from a map server
    handleZoom(height: number, dataSources: Cesium.DataSourceCollection): void {
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
    }

    toggleShow(): void {
        this.showAll = !this.showAll;
        // Show vectors based on current range
        if (this.showAll) {
            this.toggleAll(this.currRange);
        }
        // Hide all vectors
        else {
            this.toggleAll(Range.Hide);
        }
    }

    /* Private variables */
    private currRange: Range;
    private prevRange: Range = Range.None;
    private stored: boolean = false;
    private roads0: Cesium.DataSource;
    private roads1: Cesium.DataSource;
    private roads2: Cesium.DataSource;
    private landusages: Cesium.DataSource;
    private ao: Cesium.DataSource;
    private showAll: boolean = true;

    /* Private methods */

    // Toggle all vectors based on the current range
    private toggleAll(currRange: Range): void {
        switch (currRange) {
            case Range.Level1:
                this.toggleSource(this.roads0, true, 2);
                this.toggleSource(this.roads1, true, 1);
                this.toggleSource(this.roads2, false, 0);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, true, 0);
                break;
            case Range.Level2:
                this.toggleSource(this.roads0, true, 3);
                this.toggleSource(this.roads1, true, 2);
                this.toggleSource(this.roads2, true, 1);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, true, 0);
                break;
            case Range.Level3:
                this.toggleSource(this.roads0, true, 4);
                this.toggleSource(this.roads1, true, 3);
                this.toggleSource(this.roads2, true, 2);
                this.toggleSource(this.landusages, true, 0);
                this.toggleSource(this.ao, false, 0);
                break;
            case Range.Level4:
                this.toggleSource(this.roads0, true, 5);
                this.toggleSource(this.roads1, true, 4);
                this.toggleSource(this.roads2, true, 3);
                this.toggleSource(this.landusages, true, 0);
                this.toggleSource(this.ao, false, 0);
                break;
            case Range.Hide:
                this.toggleSource(this.roads0, false, 0);
                this.toggleSource(this.roads1, false, 0);
                this.toggleSource(this.roads2, false, 0);
                this.toggleSource(this.landusages, false, 0);
                this.toggleSource(this.ao, false, 0);
                break;
        }
    }

    // Toggle show/hide and vector width for the given data source
    private toggleSource(ds: Cesium.DataSource, show: boolean, width: number): void {
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
    }

    // Set the width of the given data source vector
    private setWidth(ds: Cesium.DataSource, width: number): void {
        let entities: Cesium.Entity[] = ds.entities.values;
        for (let entity of entities) {
            let entityWidth: any = entity.polyline.width;
            entityWidth = width;
        }
    }

    // Get the zoom range for the given height
    private getRange(height: number): number {
        if (height > 40000) return Range.Level1;
        else if (height > 15000) return Range.Level2;
        else if (height > 10000) return Range.Level3;
        else return Range.Level4;
    }

    // Store the data sources into local variables
    private storeDataSources(dataSources: Cesium.DataSourceCollection): void {
        let stored: boolean = true;
        if (!this.roads0) {
            this.roads0 = this.getDataSource("roads_0.geojson", dataSources);
            if (!this.roads0) stored = false;
        }
        if (!this.roads1) {
            this.roads1 = this.getDataSource("roads_1.geojson", dataSources);
            if (!this.roads1) stored = false;
        }
        if (!this.roads2) {
            this.roads2 = this.getDataSource("roads_2.geojson", dataSources);
            if (!this.roads2) stored = false;
        }
        if (!this.landusages) {
            this.landusages = this.getDataSource("landusages_mod.geojson", dataSources);
            if (!this.landusages) stored = false;
        }
        if (!this.ao) {
            this.ao = this.getDataSource("ao.geojson", dataSources);
            if (!this.ao) stored = false;
        }
        this.stored = stored;
    }

    // Get the data source object with the given name
    private getDataSource(name: String, dataSources: Cesium.DataSourceCollection): Cesium.DataSource {
        for (let i = 0; i < dataSources.length; i++) {
            let dataSource: Cesium.DataSource = dataSources.get(i);
            if (dataSource.name == name) {
                return dataSource;
            }
        }
        return null;
    }

}

// Temporary range enum to differentiate between levels
const enum Range {
    None,
    Level1,
    Level2,
    Level3,
    Level4,
    Hide
}