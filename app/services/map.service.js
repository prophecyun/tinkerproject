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
var subject_1 = require('rxjs/subject');
var zoom_service_1 = require('./zoom.service');
var message_service_1 = require('./message.service');
var app_config_1 = require('../config/app.config');
// declare var viewer: any; // FOR DEBUGGING
// Constants
// TODO: Move to constants file
var RECHOME = { west: 103.7, south: 1.2, east: 103.9, north: 1.5, viewFactor: 0 };
var CAMERAHOME = { lon: 103.82, lat: 1.36, height: 77000 };
// has moved to AppConfigService
// const OSMDARK = "http://localhost:8080/maps/osm/tile/dark/{z}/{x}/{y}.png";
// const OSMLIGHT = "http://localhost:8080/maps/osm/tile/light/{z}/{x}/{y}.png";
// const GOOGLE = "http://localhost:8080/maps/google/{z}/{x}/{y}.png";
// const GOOGLESAT = "http://localhost:8080/maps/satmap/{z}/{x}/{y}.jpg";
// const OSMVECTOR = "http://localhost:8080/maps/osm/vector/singapore/";
var OSMLIGHTOPTS = { saturation: 1, gamma: 1, hue: 0, show: false };
var GOOGLEOPTS = { saturation: 0.05, gamma: 0.3, hue: -0.4, show: false };
var GOOGLESATOPTS = { saturation: 0.1, gamma: 0.45, hue: 0, show: false };
var ROADCOLOR1 = { r: 0, g: 239, b: 255, a: 125 };
var ROADCOLOR2 = { r: 145, g: 239, b: 255, a: 125 };
var ROADCOLOR3 = { r: 214, g: 255, b: 255, a: 100 };
var LANDSTROKE = { r: 230, g: 255, b: 255, a: 75 };
var LANDFILL = { r: 230, g: 255, b: 255, a: 20 };
var AOCOLOR = { r: 249, g: 154, b: 0, a: 100 };
var ICON_INCIDENT = "img/billboard/or_alert.png";
var ICON_VIDEO = "img/billboard/or_streetcam.png";
var ICON_3D = "img/billboard/or_3d.png";
var ICON_IDTF = "img/billboard/or_idtf.png";
var ICON_SCDF = "img/billboard/or_firetruck.png";
var ICON_SPF = "img/billboard/or_spf.png";
var MapService = (function () {
    function MapService(zoomService, messageService, config) {
        this.zoomService = zoomService;
        this.messageService = messageService;
        this.config = config;
        /* Private Variables */
        this.viewer = null;
        this.showModelSource = new subject_1.Subject();
        this.showModel$ = this.showModelSource.asObservable();
        this.set2DSource = new subject_1.Subject();
        this.set2D$ = this.set2DSource.asObservable();
    }
    ;
    // Create the basic cesium viewer object with map layers and fly to the home location
    MapService.prototype.initCesium = function () {
        var _this = this;
        this.initViewer();
        this.addMapLayers();
        this.addDatabaseLayers();
        setTimeout(function () { return _this.flyTo(Cesium.Cartesian3.fromDegrees(CAMERAHOME.lon, CAMERAHOME.lat, CAMERAHOME.height)); }, 5000);
    };
    // Plot the given array of BFT units on the map
    MapService.prototype.plotBFTs = function (BFTlist) {
        var dataSource = this.getDataSource("BFT");
        dataSource.entities.removeAll();
        for (var i = 0; i < BFTlist.length; i++) {
            this.plotBFT(BFTlist[i], dataSource);
        }
    };
    // Plot the given array of Incidents on the map
    MapService.prototype.plotIncidents = function (incidentList) {
        var dataSource = this.getDataSource("Incidents");
        dataSource.entities.removeAll();
        for (var i = 0; i < incidentList.length; i++) {
            this.plotIncident(incidentList[i], dataSource);
        }
    };
    // Plot the given array of IVSG cameras on the map
    MapService.prototype.plotIVSGs = function (ivsgList) {
        var dataSource = this.getDataSource("IVSG");
        dataSource.entities.removeAll();
        for (var i = 0; i < ivsgList.length; i++) {
            this.plotIVSG(ivsgList[i], dataSource);
        }
    };
    // Fly to the given location
    MapService.prototype.flyTo = function (destination, orientation) {
        this.viewer.scene.camera.flyTo({
            destination: destination,
            orientation: orientation
        });
    };
    ;
    // Adds a 3D model on the map
    MapService.prototype.addModel = function (model) {
        this.viewer.scene.primitives.add(model);
    };
    // Returns a reference to the cesium viewer object
    MapService.prototype.getViewer = function () {
        return this.viewer;
    };
    // Show or hide the specified Cesium datasource
    MapService.prototype.toggleSource = function (sourceName) {
        var dataSource = this.getDataSource(sourceName);
        if (dataSource !== null) {
            dataSource.show = !dataSource.show;
        }
    };
    ;
    // Show or hide the specified Cesium map layer
    MapService.prototype.toggleLayer = function (name) {
        var layer = this.getLayer(name);
        if (layer !== null) {
            layer.show = !layer.show;
        }
    };
    ;
    MapService.prototype.home = function () {
        this.showModelSource.next(false);
        this.flyTo(Cesium.Cartesian3.fromDegrees(CAMERAHOME.lon, CAMERAHOME.lat, CAMERAHOME.height));
    };
    MapService.prototype.reset2D = function () {
        this.showModelSource.next(false);
        this.set2DSource.next(true);
    };
    // Show or hide the specified Cesium datasource
    MapService.prototype.setSource = function (sourceName, show) {
        var dataSource = this.getDataSource(sourceName);
        if (dataSource !== null) {
            dataSource.show = show;
        }
    };
    ;
    MapService.prototype.toggleVector = function () {
        this.zoomService.toggleShow();
    };
    /* Private Methods */
    // Creates the Cesium Viewer object with the dark OSM base map layer
    MapService.prototype.initViewer = function () {
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
        });
        // Set map detail level and tile cache size (improves performance)
        this.viewer.scene.globe.tileCacheSize = 10000;
        this.viewer.scene.globe.maximumScreenSpaceError = 4;
        // window.viewer = this.viewer; // FOR DEBUGGING
    };
    // Adds all map layers to the Cesium object
    MapService.prototype.addMapLayers = function () {
        this.addTileLayers();
        this.addVectorLayers();
        this.initVectorScaleListener();
    };
    // Adds the tile maps
    MapService.prototype.addTileLayers = function () {
        this.addTileLayer(this.config.OSMLIGHT, "light", OSMLIGHTOPTS);
        this.addTileLayer(this.config.GOOGLE, "google", GOOGLEOPTS);
        this.addTileLayer(this.config.GOOGLESAT, "sat", GOOGLESATOPTS);
    };
    // Adds a single tile map layer with the given options
    MapService.prototype.addTileLayer = function (url, name, options) {
        var imageryProvider = this.tileMap(url, name);
        var layer = new Cesium.ImageryLayer(imageryProvider);
        this.viewer.scene.imageryLayers.add(layer);
        if (options) {
            layer.show = options.show;
            layer.hue = options.hue;
            layer.saturation = options.saturation;
            layer.gamma = options.gamma;
        }
    };
    // Adds the vector maps
    MapService.prototype.addVectorLayers = function () {
        var roadStyle0 = this.newStyle(false, ROADCOLOR1, 1, null);
        var roadStyle1 = this.newStyle(false, ROADCOLOR1, 1, null);
        var roadStyle2 = this.newStyle(false, ROADCOLOR1, 1, null);
        var landStyle = this.newStyle(true, LANDSTROKE, 1, LANDFILL);
        var AOStyle = this.newStyle(true, AOCOLOR, 1, AOCOLOR);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_0.geojson', roadStyle0);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_1.geojson', roadStyle1);
        this.addVectorLayer(this.config.OSMVECTOR + 'roads/roads_2.geojson', roadStyle2);
        this.addVectorLayer(this.config.OSMVECTOR + 'landusages_mod.geojson', landStyle);
        this.addVectorLayer(this.config.OSMVECTOR + 'ao.geojson', AOStyle);
    };
    // Creates a new vector style
    MapService.prototype.newStyle = function (filled, strokeColor, width, fillColor) {
        return {
            stroke: this.newColor(strokeColor),
            fill: filled ? this.newColor(fillColor) : Cesium.Color.TRANSPARENT,
            strokeWidth: width,
            markerSymbol: '?'
        };
    };
    // Creates a new Cesium color object from the given rgba
    MapService.prototype.newColor = function (color) {
        var abgr = (color.a << 24) | (color.b << 16) | (color.g << 8) | color.r;
        return Cesium.Color.fromRgba(abgr);
    };
    // Adds a vector layer from the given geojson source
    MapService.prototype.addVectorLayer = function (url, style) {
        var source = Cesium.GeoJsonDataSource.load(url, style);
        this.viewer.dataSources.add(source);
    };
    // Initializes the camera listener to show/hide & switch vector width when changing the map viewer
    // TODO: Remove when vector map is moved to a map server
    MapService.prototype.initVectorScaleListener = function () {
        this.viewer.camera.moveEnd.addEventListener(this.handleZoom, this);
    };
    // Function to run when camera move event listener is triggered
    MapService.prototype.handleZoom = function () {
        var height = this.viewer.camera.positionCartographic.height;
        this.zoomService.handleZoom(height, this.viewer.dataSources);
    };
    // Add the map layers for data retrieved from the CIMS server
    MapService.prototype.addDatabaseLayers = function () {
        this.addDataSource('Incidents');
        this.addDataSource('BFT');
        this.addDataSource('IVSG');
    };
    // Add a new data source with the given name
    MapService.prototype.addDataSource = function (name) {
        var dataSource = new Cesium.CustomDataSource(name);
        this.viewer.dataSources.add(dataSource);
    };
    // Create an imagery provider from the given url
    MapService.prototype.tileMap = function (url, name) {
        var provider = new Cesium.UrlTemplateImageryProvider({ url: url, credit: name });
        provider.errorEvent.addEventListener(function (event) {
            // Suppressing missing tile errors
        });
        return provider;
    };
    ;
    // Get the data source object with the given name
    MapService.prototype.getDataSource = function (name) {
        var dataSources = this.viewer.dataSources;
        for (var i = 0; i < dataSources.length; i++) {
            var dataSource = dataSources.get(i);
            if (dataSource.name == name) {
                return dataSource;
            }
        }
        return null;
    };
    // Get the imagery layer with the given name
    MapService.prototype.getLayer = function (name) {
        var layers = this.viewer.imageryLayers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers.get(i);
            if (layer.imageryProvider.credit.text == name) {
                return layer;
            }
        }
        return null;
    };
    // Plot a single BFT unit on the data source
    MapService.prototype.plotBFT = function (bft, dataSource) {
        // TODO: create bft class
        var entity = dataSource.entities.getOrCreateEntity(bft.Personnel);
        var icon = this.getIcon(bft.Ancestors[0]);
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
    };
    // Plot a single BFT unit on the data source
    MapService.prototype.plotIncident = function (incident, dataSource) {
        var entity = dataSource.entities.getOrCreateEntity(incident.incidentId);
        var location = incident.location;
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
            fillColor: new Cesium.ConstantProperty(Cesium.Color.fromCssColorString('#E74C3C')),
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
    };
    MapService.prototype.plotIVSG = function (ivsg, dataSource) {
        var img = "";
        if (ivsg.type === "video") {
            img = ICON_VIDEO;
        }
        else if (ivsg.type === "3d") {
            img = ICON_3D;
        }
        else {
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
    };
    // Get the correct icon for the given unit
    MapService.prototype.getIcon = function (unit) {
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
    };
    MapService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [zoom_service_1.ZoomService, message_service_1.MessageService, app_config_1.AppConfigService])
    ], MapService);
    return MapService;
}());
exports.MapService = MapService;
//# sourceMappingURL=map.service.js.map