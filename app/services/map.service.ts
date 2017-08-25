import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/subject'

import { ZoomService } from './zoom.service'
import { MessageService } from './message.service'
import { AppConfigService } from '../config/app.config';
// declare var viewer: any; // FOR DEBUGGING

// Constants
// TODO: Move to constants file
const RECHOME = { west: 103.7, south: 1.2, east: 103.9, north: 1.5, viewFactor: 0 };
const CAMERAHOME = { lon: 103.82, lat: 1.36, height: 77000 };

// has moved to AppConfigService
// const OSMDARK = "http://localhost:8080/maps/osm/tile/dark/{z}/{x}/{y}.png";
// const OSMLIGHT = "http://localhost:8080/maps/osm/tile/light/{z}/{x}/{y}.png";
// const GOOGLE = "http://localhost:8080/maps/google/{z}/{x}/{y}.png";
// const GOOGLESAT = "http://localhost:8080/maps/satmap/{z}/{x}/{y}.jpg";
// const OSMVECTOR = "http://localhost:8080/maps/osm/vector/singapore/";

const OSMLIGHTOPTS = { saturation: 1, gamma: 1, hue: 0, show: false };
const GOOGLEOPTS = { saturation: 0.05, gamma: 0.3, hue: -0.4, show: false };
const GOOGLESATOPTS = { saturation: 0.1, gamma: 0.45, hue: 0, show: false };

const ROADCOLOR1 = { r: 0, g: 239, b: 255, a: 125 };
const ROADCOLOR2 = { r: 145, g: 239, b: 255, a: 125 };
const ROADCOLOR3 = { r: 214, g: 255, b: 255, a: 100 };
const LANDSTROKE = { r: 230, g: 255, b: 255, a: 75 };
const LANDFILL = { r: 230, g: 255, b: 255, a: 20 };
const AOCOLOR = { r: 249, g: 154, b: 0, a: 100 };
const ICON_INCIDENT = "img/billboard/or_alert.png";
const ICON_VIDEO = "img/billboard/or_streetcam.png";
const ICON_3D = "img/billboard/or_3d.png";
const ICON_IDTF = "img/billboard/or_idtf.png";
const ICON_SCDF = "img/billboard/or_firetruck.png";
const ICON_SPF = "img/billboard/or_spf.png";

@Injectable()
// Overarching service to handle Cesium map related method calls
export class MapService {

    constructor(private zoomService: ZoomService,
        private messageService: MessageService, 
        private config: AppConfigService) { };

    /* Private Variables */
    private viewer: Cesium.Viewer = null;
    private showModelSource = new Subject<boolean>();
    showModel$ = this.showModelSource.asObservable();
    private set2DSource = new Subject<boolean>();
    set2D$ = this.set2DSource.asObservable();

    // Create the basic cesium viewer object with map layers and fly to the home location
    initCesium(): void {
        this.initViewer();
        this.addMapLayers();
        this.addDatabaseLayers();
        setTimeout(() => this.flyTo(Cesium.Cartesian3.fromDegrees(CAMERAHOME.lon, CAMERAHOME.lat, CAMERAHOME.height)), 5000);
    }

    // Plot the given array of BFT units on the map
    plotBFTs(BFTlist: any): void {
        let dataSource: Cesium.DataSource = this.getDataSource("BFT");
        dataSource.entities.removeAll();
        for (let i = 0; i < BFTlist.length; i++) {
            this.plotBFT(BFTlist[i], dataSource);
        }
    }

    // Plot the given array of Incidents on the map
    plotIncidents(incidentList: any): void {
        let dataSource: Cesium.DataSource = this.getDataSource("Incidents");
        dataSource.entities.removeAll();
        for (let i = 0; i < incidentList.length; i++) {
            this.plotIncident(incidentList[i], dataSource);
        }
    }

    // Plot the given array of IVSG cameras on the map
    plotIVSGs(ivsgList: any): void {
        let dataSource: Cesium.DataSource = this.getDataSource("IVSG");
        dataSource.entities.removeAll();
        for (let i = 0; i < ivsgList.length; i++) {
            this.plotIVSG(ivsgList[i], dataSource);
        }
    }

    // Fly to the given location
    flyTo(destination: Cesium.Cartesian3, orientation?: Outreach.Orientation): void {
        this.viewer.scene.camera.flyTo({
            destination: destination,
            orientation: orientation
        });
    };

    // Adds a 3D model on the map
    addModel(model: any): void {
        this.viewer.scene.primitives.add(model);
    }

    // Returns a reference to the cesium viewer object
    getViewer(): Cesium.Viewer {
        return this.viewer;
    }

    // Show or hide the specified Cesium datasource
    toggleSource(sourceName: string): void {
        var dataSource = this.getDataSource(sourceName);
        if (dataSource !== null) {
            dataSource.show = !dataSource.show;
        }
    };

    // Show or hide the specified Cesium map layer
    toggleLayer(name: string): void {
        var layer = this.getLayer(name);
        if (layer !== null) {
            layer.show = !layer.show;
        }
    };

    home(): void {
        this.showModelSource.next(false);
        this.flyTo(Cesium.Cartesian3.fromDegrees(CAMERAHOME.lon, CAMERAHOME.lat, CAMERAHOME.height));
    }

    reset2D(): void {
        this.showModelSource.next(false);
        this.set2DSource.next(true);
    }

    // Show or hide the specified Cesium datasource
    setSource(sourceName: string, show: boolean): void {
        var dataSource = this.getDataSource(sourceName);
        if (dataSource !== null) {
            dataSource.show = show;
        }
    };

    toggleVector(): void {
        this.zoomService.toggleShow();
    }

    /* Private Methods */

    // Creates the Cesium Viewer object with the dark OSM base map layer
    private initViewer(): void {
        // Set initial display rectangle
        Cesium.Camera.DEFAULT_VIEW_FACTOR = RECHOME.viewFactor;
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(RECHOME.west, RECHOME.south, RECHOME.east, RECHOME.north);
        // Create the Cesium viewer

        this.viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyvisible: false,
            scene3DOnly: true,
            imageryProvider: this.tileMap(this.config.OSMDARK, "dark"),
            creditContainer: "cesiumCredit",
            // shadows: true
        });
        // Set map detail level and tile cache size (improves performance)
        this.viewer.scene.globe.tileCacheSize = 10000;
        this.viewer.scene.globe.maximumScreenSpaceError = 4;

        // window.viewer = this.viewer; // FOR DEBUGGING
    }

    // Adds all map layers to the Cesium object
    private addMapLayers(): void {
        this.addTileLayers();
        this.addVectorLayers();
        this.initVectorScaleListener();
    }

    // Adds the tile maps
    private addTileLayers(): void {
        this.addTileLayer(this.config.OSMLIGHT, "light", OSMLIGHTOPTS);
        this.addTileLayer(this.config.GOOGLE, "google", GOOGLEOPTS);
        this.addTileLayer(this.config.GOOGLESAT, "sat", GOOGLESATOPTS);
    }

    // Adds a single tile map layer with the given options
    private addTileLayer(url: string, name: string, options?: Outreach.LayerOptions): void {
        let imageryProvider: Cesium.ImageryProvider = this.tileMap(url, name);
        let layer: Cesium.ImageryLayer = new Cesium.ImageryLayer(imageryProvider);
        this.viewer.scene.imageryLayers.add(layer);
        if (options) {
            layer.show = options.show;
            layer.hue = options.hue;
            layer.saturation = options.saturation;
            layer.gamma = options.gamma;
        }
    }

    // Adds the vector maps
    private addVectorLayers(): void {
        let roadStyle0: Outreach.Style = this.newStyle(false, ROADCOLOR1, 1, null);
        let roadStyle1: Outreach.Style = this.newStyle(false, ROADCOLOR1, 1, null);
        let roadStyle2: Outreach.Style = this.newStyle(false, ROADCOLOR1, 1, null);
        let landStyle: Outreach.Style = this.newStyle(true, LANDSTROKE, 1, LANDFILL);
        let AOStyle: Outreach.Style = this.newStyle(true, AOCOLOR, 1, AOCOLOR);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_0.geojson', roadStyle0);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_1.geojson', roadStyle1);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_2.geojson', roadStyle2);
        this.addVectorLayer(this.config.OSMVECTOR + 'landusages_mod.geojson', landStyle);
        this.addVectorLayer(this.config.OSMVECTOR + 'ao.geojson', AOStyle);
    }

    // Creates a new vector style
    private newStyle(filled: Boolean, strokeColor: Outreach.Color, width: number, fillColor: Outreach.Color): Outreach.Style {
        return {
            stroke: this.newColor(strokeColor),
            fill: filled ? this.newColor(fillColor) : Cesium.Color.TRANSPARENT,
            strokeWidth: width,
            markerSymbol: '?'
        };
    }

    // Creates a new Cesium color object from the given rgba
    private newColor(color: Outreach.Color): Cesium.Color {
        let abgr: number = (color.a << 24) | (color.b << 16) | (color.g << 8) | color.r;
        return Cesium.Color.fromRgba(abgr);
    }

    // Adds a vector layer from the given geojson source
    private addVectorLayer(url: string, style: Outreach.Style): void {
        let source: Promise<Cesium.GeoJsonDataSource> = Cesium.GeoJsonDataSource.load(url, style);
        this.viewer.dataSources.add(source);
    }

    // Initializes the camera listener to show/hide & switch vector width when changing the map viewer
    // TODO: Remove when vector map is moved to a map server
    private initVectorScaleListener(): void {
        this.viewer.camera.moveEnd.addEventListener(this.handleZoom, this);
    }

    // Function to run when camera move event listener is triggered
    private handleZoom() {
        let height: number = this.viewer.camera.positionCartographic.height;
        this.zoomService.handleZoom(height, this.viewer.dataSources);
    }

    // Add the map layers for data retrieved from the CIMS server
    private addDatabaseLayers(): void {
        this.addDataSource('Incidents');
        this.addDataSource('BFT');
        this.addDataSource('IVSG');
    }

    // Add a new data source with the given name
    private addDataSource(name: string): void {
        let dataSource: Cesium.CustomDataSource = new Cesium.CustomDataSource(name);
        this.viewer.dataSources.add(dataSource);
    }

    // Create an imagery provider from the given url
    private tileMap(url: string, name: string): Cesium.ImageryProvider {
        let provider: Cesium.UrlTemplateImageryProvider = new Cesium.UrlTemplateImageryProvider({ url: url, credit: name });
        provider.errorEvent.addEventListener(function (event: Event) {
            // Suppressing missing tile errors
        });
        return provider;
    };

    // Get the data source object with the given name
    private getDataSource(name: String): Cesium.DataSource {
        let dataSources: Cesium.DataSourceCollection = this.viewer.dataSources;
        for (let i = 0; i < dataSources.length; i++) {
            let dataSource: Cesium.DataSource = dataSources.get(i);
            if (dataSource.name == name) {
                return dataSource;
            }
        }
        return null;
    }

    // Get the imagery layer with the given name
    private getLayer(name: string): Cesium.ImageryLayer {
        let layers: Cesium.ImageryLayerCollection = this.viewer.imageryLayers;
        for (let i = 0; i < layers.length; i++) {
            let layer: Cesium.ImageryLayer = layers.get(i);
            if (layer.imageryProvider.credit.text == name) {
                return layer;
            }
        }
        return null;
    }

    // Plot a single BFT unit on the data source
    private plotBFT(bft: any, dataSource: Cesium.DataSource): void {
        // TODO: create bft class
        let entity: any = dataSource.entities.getOrCreateEntity(bft.Personnel);
        let icon: any = this.getIcon(bft.Ancestors[0]);
        // TODO: Move hardcoded options to config file
        entity.label = new Cesium.LabelGraphics({
            text: new Cesium.ConstantProperty(bft.Personnel),
            fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#67DD3E')),
            horizontalOrigin: new Cesium.ConstantProperty(Cesium.HorizontalOrigin.LEFT),
            font: new Cesium.ConstantProperty('150px sans-serif'),
            pixelOffset: new Cesium.ConstantProperty(new Cesium.Cartesian2(80, -135)),
            pixelOffsetScaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1.5e4, 1.0, 3.0e5, 0.05)),
            scale: new Cesium.ConstantProperty(0.25),
            distanceDisplayCondition: new Cesium.ConstantProperty(new Cesium.DistanceDisplayCondition(bft.near, bft.far)),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -750))
        });
        entity.billboard = new Cesium.BillboardGraphics({
            image: new Cesium.ConstantProperty(icon),
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            scaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1.5e4, 1.0, 3.0e5, 0.05)),
            scale: new Cesium.ConstantProperty(0.4),
            distanceDisplayCondition: new Cesium.ConstantProperty(new Cesium.DistanceDisplayCondition(bft.near, bft.far)),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -750))
        });
        entity.position = new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(bft.location.lon, bft.location.lat));
        entity.description = new Cesium.ConstantProperty({
            type: "BFT",
            id: bft.Personnel
        });
    }

    // Plot a single BFT unit on the data source
    private plotIncident(incident: any, dataSource: Cesium.DataSource): void {
        let entity: any = dataSource.entities.getOrCreateEntity(incident.incidentId);
        let location: any = incident.location;
        // TODO: Move hardcoded options to config file
        entity.position = Cesium.Cartesian3.fromDegrees(location.lon, location.lat, location.height);
        entity.billboard = new Cesium.BillboardGraphics({
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            scale: new Cesium.ConstantProperty(0.35),
            scaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1.5e3, 1.0, 3.0e5, 0.1)),
            translucencyByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(8.0e4, 1.0, 1.2e5, 0.0)),
            image: new Cesium.ConstantProperty(ICON_INCIDENT),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -1000))
        });
        entity.label = new Cesium.LabelGraphics({
            text: new Cesium.ConstantProperty(incident.incidentName),
            fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#E74C3C')),//Cesium.Color.RED,
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            font: new Cesium.ConstantProperty('168px sans-serif'),
            translucencyByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(8.0e4, 1.0, 1.2e5, 0.0)),
            pixelOffset: new Cesium.ConstantProperty(new Cesium.Cartesian2(0, 1)),
            pixelOffsetScaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1.5e3, 80.0, 8.0e4, 40.0)),
            scale: new Cesium.ConstantProperty(0.25),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -1000))
        });
        entity.description = {
            type: "Incident",
            incidentId: incident.incidentId,
            locationName: incident.locationName
        };
    }

    private plotIVSG(ivsg: any, dataSource: Cesium.DataSource): void {
        var img = "";
        if (ivsg.type === "video") {
            img = ICON_VIDEO;
        } else if (ivsg.type === "3d") {
            img = ICON_3D;
        } else {
            console.error("Invalid icon type specified");
        }
        var entity = new Cesium.Entity();
        entity.name = ivsg.camId;
        entity.position = new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(ivsg.lon, ivsg.lat, ivsg.height));
        entity.billboard = new Cesium.BillboardGraphics({
            image: new Cesium.ConstantProperty(img),
            scaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1500, 1.0, 5.0e3, 0.5)),
            translucencyByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(5.0e3, 1.0, 8.0e3, 0.0)),
            scale: new Cesium.ConstantProperty(0.23),
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500))
        });
        entity.label = new Cesium.LabelGraphics({
            text: new Cesium.ConstantProperty(ivsg.camId),
            fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#F99A00')),
            verticalOrigin: new Cesium.ConstantProperty(Cesium.VerticalOrigin.BOTTOM),
            font: new Cesium.ConstantProperty('150px sans-serif'),
            translucencyByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(5.0e3, 1.0, 8.0e3, 0.0)),
            pixelOffset: new Cesium.ConstantProperty(new Cesium.Cartesian2(0, -1)),
            pixelOffsetScaleByDistance: new Cesium.ConstantProperty(new Cesium.NearFarScalar(1500, 260.0, 5.0e3, 130.0)),
            scale: new Cesium.ConstantProperty(0.25),
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500))
        });
        entity.description = new Cesium.ConstantProperty({
            type: ivsg.type,
            url: ivsg.rtspURL,
            id: ivsg.camId
        });
        dataSource.entities.add(entity);
    }

    // Get the correct icon for the given unit
    private getIcon(unit: string) {
        switch (unit) {
            case "SCDF":
                return ICON_SCDF;
            case "SPF":
                return ICON_SPF;
            case "IDTF":
                return ICON_IDTF;
            default:
                return null;
        }
    }
}