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
var app_config_1 = require('../config/app.config');
var deployment_service_1 = require('./deployment.service');
var ICON_IDTF = "../img/billboard/or_idtf.png";
var ICON_SCDF = "../img/billboard/or_firetruck.png";
var ICON_SPF = "../img/billboard/or_spf.png";
var ICON_INCIDENT = '../img/icons/map-marker-icon.png';
var ICON_RESOURCE = '../img/unitlogo/no logo.jpg';
var ICON_BLINK = '../img/billboard/rft.png';
var ZOOM_LEVEL_CLUSTERING = 8;
var OpenlayersMapService = (function () {
    function OpenlayersMapService(config, deployment) {
        this.config = config;
        this.deployment = deployment;
    }
    ;
    OpenlayersMapService.prototype.init = function () {
        this.map = new ol.Map({ target: 'map' });
        this.map.setView(new ol.View({
            center: ol.proj.fromLonLat([this.config.HOME_LONG, this.config.HOME_LAT]),
            zoom: this.config.HOME_ZOOM
        }));
        //this.initTileLayers(this.map);
        this.initSourceLayer(this.map);
        this.initVectorLayers(this.map);
        this.home();
        // let resources = this.deployment.loadSampleDeployment();
        // console.log("resources", resources);
        // this.plotResources(resources);
        // this.plotSampleVideos();
        // this.initSampleIncidentMarkers();
    };
    OpenlayersMapService.prototype.getMap = function () { return this.map; };
    OpenlayersMapService.prototype.initTileLayers = function (imap) {
        //base layer
        var osmLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: this.config.OSMDARK
            })
        });
        osmLayer.set('name', "osmLayer");
        imap.addLayer(osmLayer);
        //satellite layer
        var satLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: this.config.GOOGLESAT
            })
        });
        satLayer.set('name', "satLayer");
        imap.addLayer(satLayer);
        satLayer.setVisible(false);
        //this.initMaskLayer(osmLayer);
        // this.testPulseOnClick(imap);
    };
    OpenlayersMapService.prototype.initSourceLayer = function (imap) {
        var layer = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        layer.set('name', "osmLayer");
        imap.addLayer(layer);
    };
    //TODO
    OpenlayersMapService.prototype.initMaskLayer = function (iOsmLayer) {
        //cannot work =( 
        // let features = new ol.format.GeoJSON();
        // features.readFeatures(this.config.SG_BOUNDARY_VECTOR_URL);
        // console.log("features", features);
        // for (let f of features) {
        //     let mask = new ol.filter.Mask({ feature: f, inner: false, fill: new ol.style.Fill({ color: [255, 255, 255, 0.8] }) });
        //     iOsmLayer.addFilter(mask);
        //     mask.set('inner', true);
        //     mask.fillColor_ = 'black';
        //     // Activate
        //     mask.set('active', true);
        // }
        //mask out non-SG map
        // let clipLayer = new ol.layer.Image({
        //     source: new ol.source.ImageVector({
        //         source: new ol.source.Vector({
        //             // contains your clip polygon
        //             url: this.config.SG_BOUNDARY_VECTOR_URL,
        //             format: new ol.format.GeoJSON()
        //         }),
        //         style: new ol.style.Style({
        //             fill: new ol.style.Fill({
        //                 color: 'black'
        //             })
        //         })
        //     })
        // });
        // clipLayer.on('precompose', function (e: any) {
        //     e.context.globalCompositeOperation = 'destination-in';
        // });
        // clipLayer.on('postcompose', function (e: any) {
        //     e.context.globalCompositeOperation = 'source-over';
        // });
        // imap.addLayer(clipLayer);
    };
    OpenlayersMapService.prototype.initVectorLayers = function (imap) {
        this.initSgBoundaryLayer(imap);
        this.initFIRLayer(imap);
        this.initRestrictedAirspaceLayer(imap);
        //this.initDistricBoundaryLayer(imap);
        //this.initMrtLayers(imap);
        //this.initRoadLayers(imap);
        //this.initPopulationDensityLayer(imap);
        //this.initKMLLayers(imap);
    };
    OpenlayersMapService.prototype.initFIRLayer = function (imap) {
        console.log("FIR layer");
        //vector layer for district boundary
        var vectorLayerFIR = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.FIR_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 5
                })
            })
        });
        vectorLayerFIR.set("name", "vectorLayerFIR");
        imap.addLayer(vectorLayerFIR);
        vectorLayerFIR.setVisible(true);
    };
    OpenlayersMapService.prototype.initRestrictedAirspaceLayer = function (imap) {
        //vector layer for district boundary
        var vectorLayerRestrictedAirspace = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.RESTRICTED_AIRSPACE_URL,
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'gray',
                    width: 2
                })
            })
        });
        vectorLayerRestrictedAirspace.set("name", "vectorLayerRestrictedAirspace");
        imap.addLayer(vectorLayerRestrictedAirspace);
        vectorLayerRestrictedAirspace.setVisible(true);
    };
    OpenlayersMapService.prototype.initSgBoundaryLayer = function (imap) {
        //vector layer for Sg boundary
        var vectorLayerSgBoundary = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_BOUNDARY_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'orange',
                    width: 5
                })
            })
        });
        vectorLayerSgBoundary.set("name", "vectorLayerSgBoundary");
        imap.addLayer(vectorLayerSgBoundary);
    };
    OpenlayersMapService.prototype.initDistricBoundaryLayer = function (imap) {
        //vector layer for district boundary
        var vectorLayerDistrictBoundary = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_DISTRICT_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 2
                })
            })
        });
        vectorLayerDistrictBoundary.set("name", "vectorLayerDistrictBoundary");
        imap.addLayer(vectorLayerDistrictBoundary);
        vectorLayerDistrictBoundary.setVisible(false);
    };
    OpenlayersMapService.prototype.initMrtLayers = function (imap) {
        ;
        var lineColors = {};
        lineColors['North South Line (NS)'] = 'red';
        lineColors['MRT East West Line (EW)'] = 'green';
        lineColors['MRT East West Line (EW) Changi Airport Line'] = 'green';
        lineColors['North East Line (NE)'] = 'purple';
        lineColors['Circle Line MRT'] = 'orange';
        lineColors['Circle Line Extension'] = 'orange';
        lineColors['Downtown Line MRT'] = 'blue';
        var vectorLayerMRTLines = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_MRT_LINES_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: function (feature, resolution) {
                var lineName = feature.get('name');
                var lineStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: lineColors[lineName],
                        width: 8
                    })
                });
                return lineStyle;
            }
        });
        vectorLayerMRTLines.set("name", "vectorLayerMRTLines");
        imap.addLayer(vectorLayerMRTLines);
        vectorLayerMRTLines.setVisible(false);
        //vector layer for MRT stations
        var vectorLayerMRTStations = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_MRT_STATIONS_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 15,
                    fill: new ol.style.Fill({
                        color: 'yellow'
                    })
                })
            })
        });
        vectorLayerMRTStations.set("name", "vectorLayerMRTStations");
        imap.addLayer(vectorLayerMRTStations);
        vectorLayerMRTStations.setVisible(false);
    };
    OpenlayersMapService.prototype.initRoadLayers = function (imap) {
        //vector layer for roads
        var roadStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'orange',
                width: 1
            })
        });
        var vectorLayerRoad0 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_0.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad0.set("name", "vectorLayerRoad0");
        imap.addLayer(vectorLayerRoad0);
        vectorLayerRoad0.setVisible(false);
        var vectorLayerRoad1 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_1.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad1.set("name", "vectorLayerRoad1");
        imap.addLayer(vectorLayerRoad1);
        vectorLayerRoad1.setVisible(false);
        var vectorLayerRoad2 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_2.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad2.set("name", "vectorLayerRoad2");
        imap.addLayer(vectorLayerRoad2);
        vectorLayerRoad2.setVisible(false);
    };
    OpenlayersMapService.prototype.initPopulationDensityLayer = function (imap) {
        //vector layer for population
        var colorScheme = colorbrewer.BuPu;
        var colorClasses = colorScheme[5]; // 5 classes of color
        var vectorLayerPop = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_POP_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: function (feature, resolution) {
                var population = feature.get('population');
                var areaColor;
                if (population <= 100) {
                    areaColor = colorClasses[0];
                }
                else if (population > 100 && population <= 10000) {
                    areaColor = colorClasses[1];
                }
                else if (population > 10000 && population <= 100000) {
                    areaColor = colorClasses[2];
                }
                else if (population > 100000 && population <= 200000) {
                    areaColor = colorClasses[3];
                }
                else {
                    areaColor = colorClasses[4];
                }
                var choropleth = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'orange',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: areaColor
                    })
                });
                return choropleth;
            }
        });
        vectorLayerPop.set("name", "vectorLayerPop");
        imap.addLayer(vectorLayerPop);
        vectorLayerPop.setVisible(false);
    };
    OpenlayersMapService.prototype.initKMLLayers = function (imap) {
        var clinics = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.MOH_CHAS_CLINIC_URL,
                format: new ol.format.KML({ extractStyles: false })
            }),
            style: new ol.style.Style({
                text: new ol.style.Text({
                    fill: new ol.style.Fill({
                        color: 'white'
                    }),
                    scale: 10
                })
            })
        });
        var npcBoundaries = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.NPC_BOUNDARY_URL,
                format: new ol.format.KML({ extractStyles: false }),
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'yellow',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: [255, 255, 255, 0.1]
                }),
            })
        });
        imap.addLayer(clinics);
        // imap.addLayer(npcBoundaries);
    };
    //----------------MARKER ANIMATION-----------------------------
    //test function to render pulse on click 
    // testPulseOnClick(imap: ol.Map): void {
    //     // Pulse on click 
    //     imap.on('click', function (evt: any) {
    //         console.log("click pulse feature", evt.coordinate);
    //         let f = new ol.Feature(new ol.geom.Point(evt.coordinate));
    //         f.setStyle(new ol.style.Style(
    //             {
    //                 image: new ol.style['Circle'](
    //                     {
    //                         radius: 60,
    //                         points: 4,
    //                         stroke: new ol.style.Stroke({ color: 'red', width: 5 })
    //                     })
    //             }));
    //         imap.animateFeature(f, new ol.featureAnimation.Zoom(
    //             {
    //                 fade: ol.easing.easeOut,
    //                 duration: 3000,
    //                 easing: ol.easing['easeOut']
    //             }));
    //     });
    // }
    // Pulse at lonlat [lat, lon]
    // pulse(lonlat: number[], imap: ol.Map): void {
    //     let blinkInterval = setInterval(function () {
    //         let coord = ol.proj.transform(lonlat, 'EPSG:4326', imap.getView().getProjection());
    //         // this.pulseAnimateFeature(coord, imap);
    //         let f = new ol.Feature(new ol.geom.Point(coord));
    //         f.setStyle(new ol.style.Style(
    //             {
    //                 image: new ol.style['Circle'](
    //                     {
    //                         radius: 60,
    //                         points: 4,
    //                         stroke: new ol.style.Stroke({ color: 'red', width: 10 })
    //                     })
    //             }));
    //         imap.animateFeature(f, new ol.featureAnimation.Zoom(
    //             {
    //                 fade: ol.easing.easeOut,
    //                 duration: 3000,
    //                 easing: ol.easing['easeOut']
    //             }));
    //     }, 5000);
    //     setTimeout(function () {
    //         clearInterval(blinkInterval);
    //     }, 30000);
    // }
    //----------------INCIDENTS------------------------------------
    //called by incident service
    OpenlayersMapService.prototype.plotIncidents = function (incidentList) {
        var incidentFeatures = [];
        for (var _i = 0, incidentList_1 = incidentList; _i < incidentList_1.length; _i++) {
            var incident = incidentList_1[_i];
            incidentFeatures.push(this.plotIncident(incident));
            //popup overlay
            var el = document.createElement("div");
            el.id = incident.incidentName + '_ID';
            el.classList.add("popup-incident");
            el.innerHTML = "<p class='popup-incident-label'>" + incident.incidentName + "</p>";
            var popup = new ol.Overlay({
                element: el,
                positioning: 'top-center',
                stopEvent: false,
                offset: [-50, -200],
                position: ol.proj.fromLonLat([incident.location.lon, incident.location.lat])
            });
            this.map.addOverlay(popup);
        }
        var incidentVectorSource = new ol.source.Vector({
            features: incidentFeatures
        });
        var incidentVectorLayer = new ol.layer.Vector({
            source: incidentVectorSource
        });
        incidentVectorLayer.set("name", "incidentVectorLayer");
        this.map.addLayer(incidentVectorLayer);
    };
    OpenlayersMapService.prototype.plotIncident = function (incident) {
        var location = incident.location; // obj contains location.lon,  location.lat
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: ICON_INCIDENT,
                scale: 0.1
            }))
        });
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: incident.incidentName,
        });
        iconFeature.setStyle(iconStyle);
        return iconFeature;
    };
    //----------------RESOURCES------------------------------------
    OpenlayersMapService.prototype.plotResources = function (resourcesList) {
        var resourceFeatures = [];
        for (var _i = 0, resourcesList_1 = resourcesList; _i < resourcesList_1.length; _i++) {
            var resource = resourcesList_1[_i];
            resourceFeatures.push(this.plotResource(resource));
        }
        var resourceVectorSource = new ol.source.Vector({
            features: resourceFeatures
        });
        var resourceVectorLayer = new ol.layer.Vector({
            source: resourceVectorSource
        });
        resourceVectorLayer.set("name", "resourceVectorLayer");
        this.map.addLayer(resourceVectorLayer);
    };
    // Plot a single unit on the data source by returning a resource feature
    OpenlayersMapService.prototype.plotResource = function (resource) {
        var location = resource.location; // obj contains location.lon,  location.lat
        var iconUrl;
        if (resource.icons[0]) {
            iconUrl = resource.icons[0];
        }
        else {
            iconUrl = ICON_RESOURCE;
        }
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: iconUrl,
                scale: 1
            }))
        });
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: resource.name,
        });
        iconFeature.setStyle(iconStyle);
        return iconFeature;
    };
    //-----------------BFT---------------------------------
    // Plot the given array of BFT units on the map (called by BFT Service)
    OpenlayersMapService.prototype.plotBFTs = function (BFTlist) {
        var bftVectorLayer;
        var bftVectorSource;
        var bftFeatures = [];
        this.map.getLayers().forEach(function (layer, idx, array) {
            if (layer.get('name') === "bftClusterLayer" || layer.get('name') === "bftVectorLayer") {
                this.map.removeLayer(layer);
            }
        });
        for (var _i = 0, BFTlist_1 = BFTlist; _i < BFTlist_1.length; _i++) {
            var bft = BFTlist_1[_i];
            bftFeatures.push(this.plotBFT(bft));
        }
        // if (bftVectorLayer) {
        //     //clear existing features in layer vector source
        //     bftVectorSource = bftVectorLayer.get("source")
        //     bftVectorSource.clear(true);
        //     bftVectorSource.addFeatures(bftFeatures);
        // } else { //first rendering
        bftVectorSource = new ol.source.Vector({
            features: bftFeatures
        });
        bftVectorLayer = new ol.layer.Vector({
            source: bftVectorSource,
            maxResolution: ZOOM_LEVEL_CLUSTERING
        });
        bftVectorLayer.set("name", "bftVectorLayer");
        this.map.addLayer(bftVectorLayer);
        var clusterSource = new ol.source.Cluster({
            distance: 40,
            source: bftVectorSource
        });
        var styleCache = {};
        var clusterLayer = new ol.layer.Vector({
            source: clusterSource,
            minResolution: ZOOM_LEVEL_CLUSTERING,
            style: function (feature, resolution) {
                var size = feature.get('features').length;
                var style = styleCache[size];
                if (!style) {
                    style = [new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 30,
                                stroke: new ol.style.Stroke({
                                    color: '#fff'
                                }),
                                fill: new ol.style.Fill({
                                    color: 'orange'
                                })
                            }),
                            text: new ol.style.Text({
                                text: size.toString(),
                                fill: new ol.style.Fill({
                                    color: 'black'
                                }),
                                scale: 6
                            })
                        })];
                    styleCache[size] = style;
                }
                return style;
            }
        });
        clusterLayer.set("name", "bftClusterLayer");
        this.map.addLayer(clusterLayer);
    };
    // Plot a single BFT unit on the data source by returning a BFT feature
    OpenlayersMapService.prototype.plotBFT = function (bft) {
        // console.log("plot bft",bft, bft.lon, bft.lat );
        var location = bft.location; // obj contains location.lon,  location.lat
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: ICON_IDTF,
                scale: 0.5
            }))
        });
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: bft.Personnel,
        });
        iconFeature.setStyle(iconStyle);
        return iconFeature;
    };
    //-------------------VIDEO---------------------------------
    OpenlayersMapService.prototype.plotSampleVideos = function (sampleVideos) {
        for (var _i = 0, sampleVideos_1 = sampleVideos; _i < sampleVideos_1.length; _i++) {
            var vid = sampleVideos_1[_i];
            //popup overlay
            var el = document.createElement("div");
            el.id = vid.name + '_ID';
            el.classList.add("popup-vid");
            el.classList.add("animated");
            el.classList.add("slideInUp");
            el.innerHTML =
                "<video width='640' height='480' autoplay loop>"
                    + "<source src='" + vid.url + "' type='video/mp4'>"
                    + "</video>";
            +"<p class='popup-incident-label'>" + vid.name + "</p>";
            var popup = new ol.Overlay({
                id: vid.name,
                element: el,
                positioning: 'top-center',
                stopEvent: false,
                offset: [-50, -200],
                position: ol.proj.fromLonLat([vid.location.lon, vid.location.lat])
            });
            this.map.addOverlay(popup);
        }
    };
    OpenlayersMapService.prototype.unplotSampleVideos = function (sampleVideos) {
        for (var _i = 0, sampleVideos_2 = sampleVideos; _i < sampleVideos_2.length; _i++) {
            var vid = sampleVideos_2[_i];
            var overlay = this.map.getOverlayById(vid.name);
            this.map.removeOverlay(overlay);
        }
    };
    //for testing
    OpenlayersMapService.prototype.initSampleIncidentMarkers = function () {
        var incidentLocations = [
            { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
            { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
            { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
            { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        ];
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '../img/icons/map-marker-icon.png',
                scale: 0.1
            }))
        });
        var incidentFeatures = [];
        var incidentPopups = [];
        for (var _i = 0, incidentLocations_1 = incidentLocations; _i < incidentLocations_1.length; _i++) {
            var i = incidentLocations_1[_i];
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([i.lng, i.lat])),
                name: i.name,
                radius: i.radius
            });
            iconFeature.setStyle(iconStyle);
            incidentFeatures.push(iconFeature);
        }
        var incidentVectorSource = new ol.source.Vector({
            features: incidentFeatures
        });
        var incidentVectorLayer = new ol.layer.Vector({
            source: incidentVectorSource
        });
        this.map.addLayer(incidentVectorLayer);
    };
    OpenlayersMapService.prototype.setOverlayPosition = function (lat, long, id) {
        var popup = new ol.Overlay({
            element: document.getElementById(id),
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -50]
        });
        popup.setPosition(ol.proj.fromLonLat([long, lat]));
        this.map.addOverlay(popup);
    };
    //----------------CONTROLS---------------------------------------
    //MAP CONTROLS
    OpenlayersMapService.prototype.home = function () {
        // console.log("home...", this.map.getView().getResolution());
        var pan = ol.animation.pan({
            duration: 2000,
            source: /** @type {ol.Coordinate} */ (ol.proj.fromLonLat([this.config.HOME_LONG, this.config.HOME_LAT]))
        });
        this.map.beforeRender(pan);
        this.map.getView().setCenter(ol.proj.fromLonLat([this.config.HOME_LONG, this.config.HOME_LAT]));
        var zoom = ol.animation.zoom({
            resolution: this.map.getView().getResolution(),
            duration: 2000
        });
        this.map.beforeRender(zoom);
        this.map.getView().setResolution(this.config.HOME_ZOOM);
    };
    OpenlayersMapService.prototype.toggleRoadLayer = function () {
        this.map.getLayers().forEach(function (layer, idx, array) {
            var layerName = layer.get('name');
            if (layerName && layerName.startsWith("vectorLayerRoad")) {
                layer.setVisible(!layer.getVisible());
            }
        });
    };
    OpenlayersMapService.prototype.toggleLayer = function () {
        console.log("toggleLayer sat vs osm");
        this.map.getLayers().forEach(function (layer, idx, array) {
            // console.log('layerName', layer.get('name'));
            if (layer.get('name') === "satLayer" || layer.get('name') === "osmLayer") {
                layer.setVisible(!layer.getVisible());
            }
        });
    };
    OpenlayersMapService.prototype.toggleVector = function () {
        console.log("toggle district map");
        this.map.getLayers().forEach(function (layer, idx, array) {
            if (layer.get('name') === "vectorLayerDistrictBoundary" || layer.get('name') === "vectorLayerSgBoundary") {
                layer.setVisible(!layer.getVisible());
            }
        });
    };
    OpenlayersMapService.prototype.togglePopDensityLayer = function () {
        this.map.getLayers().forEach(function (layer, idx, array) {
            if (layer.get('name') === "vectorLayerPop") {
                layer.setVisible(!layer.getVisible());
            }
        });
    };
    OpenlayersMapService.prototype.toggleMrtLayer = function () {
        this.map.getLayers().forEach(function (layer, idx, array) {
            if (layer.get('name') === "vectorLayerMRTLines" || layer.get('name') === "vectorLayerMRTStations") {
                layer.setVisible(!layer.getVisible());
            }
        });
    };
    OpenlayersMapService.prototype.zoomToIncident = function (incident) {
        console.log("zoom to incident...", incident);
        var iLat = incident.location.lat;
        var iLon = incident.location.lon;
        var iZoom = 4;
        var pan = ol.animation.pan({
            duration: 4000,
            source: /** @type {ol.Coordinate} */ (ol.proj.fromLonLat([iLon, iLat]))
        });
        var zoom = ol.animation.zoom({
            resolution: this.map.getView().getResolution(),
            duration: 2000,
        });
        this.map.beforeRender(pan);
        this.map.beforeRender(zoom);
        this.map.getView().setCenter(ol.proj.fromLonLat([iLon, iLat]));
        this.map.getView().setResolution(iZoom);
    };
    OpenlayersMapService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [app_config_1.AppConfigService, deployment_service_1.DeploymentService])
    ], OpenlayersMapService);
    return OpenlayersMapService;
}());
exports.OpenlayersMapService = OpenlayersMapService;
//# sourceMappingURL=map.openlayer.service.js.map