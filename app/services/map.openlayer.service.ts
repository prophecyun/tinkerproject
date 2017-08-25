import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/subject'
import { AppConfigService } from '../config/app.config';
import { DeploymentService } from './deployment.service';
declare var ol: any;
declare var colorbrewer: any;

const ICON_IDTF = "../img/billboard/or_idtf.png";
const ICON_SCDF = "../img/billboard/or_firetruck.png";
const ICON_SPF = "../img/billboard/or_spf.png";
const ICON_INCIDENT = '../img/icons/map-marker-icon.png';
const ICON_RESOURCE = '../img/unitlogo/no logo.jpg';
const ICON_BLINK = '../img/billboard/rft.png';

const ZOOM_LEVEL_CLUSTERING = 8;

@Injectable()
// Overarching service to handle OpenLayers map related method calls
export class OpenlayersMapService {
    // ol: any;
    private map: ol.Map;
    

    constructor(public config: AppConfigService, private deployment: DeploymentService) {
    };

    init(): void {
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
    }
    getMap(): any { return this.map; }

    initTileLayers(imap: any): void {
        //base layer
        let osmLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: this.config.OSMDARK
            })
        });
        osmLayer.set('name', "osmLayer");
        imap.addLayer(osmLayer);

        //satellite layer
        let satLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: this.config.GOOGLESAT
            })
        });
        satLayer.set('name', "satLayer");
        imap.addLayer(satLayer);
        satLayer.setVisible(false);

        //this.initMaskLayer(osmLayer);
        // this.testPulseOnClick(imap);
    }

    initSourceLayer(imap: any): void{
        let layer = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        layer.set('name', "osmLayer");
        imap.addLayer(layer);
    }

    //TODO
    initMaskLayer(iOsmLayer: any): void {

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
    }

    initVectorLayers(imap: any): void {
        this.initSgBoundaryLayer(imap);
        this.initFIRLayer(imap);
        this.initRestrictedAirspaceLayer(imap);
        //this.initDistricBoundaryLayer(imap);
        //this.initMrtLayers(imap);
        //this.initRoadLayers(imap);
        //this.initPopulationDensityLayer(imap);
        //this.initKMLLayers(imap);
    }

    initFIRLayer(imap: ol.Map): void {
        console.log("FIR layer");
        //vector layer for district boundary
        let vectorLayerFIR = new ol.layer.Vector({
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
    }
    initRestrictedAirspaceLayer(imap: ol.Map): void {
        //vector layer for district boundary
        let vectorLayerRestrictedAirspace = new ol.layer.Vector({
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
    }
    

    initSgBoundaryLayer(imap: ol.Map): void {
        //vector layer for Sg boundary
        let vectorLayerSgBoundary = new ol.layer.Vector({
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
    }

    initDistricBoundaryLayer(imap: ol.Map): void {
        //vector layer for district boundary
        let vectorLayerDistrictBoundary = new ol.layer.Vector({
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
    }

    initMrtLayers(imap: ol.Map): void {
        //vector layer for MRT lines
        interface IDictionary {
            [key: string]: string;
        };
        let lineColors: IDictionary = {};
        lineColors['North South Line (NS)'] = 'red';
        lineColors['MRT East West Line (EW)'] = 'green';
        lineColors['MRT East West Line (EW) Changi Airport Line'] = 'green';
        lineColors['North East Line (NE)'] = 'purple';
        lineColors['Circle Line MRT'] = 'orange';
        lineColors['Circle Line Extension'] = 'orange';
        lineColors['Downtown Line MRT'] = 'blue';
        let vectorLayerMRTLines = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_MRT_LINES_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: function (feature: any, resolution: any) {
                let lineName = feature.get('name');
                let lineStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: lineColors[lineName],
                        width: 8
                    })
                })
                return lineStyle;
            }
        });
        vectorLayerMRTLines.set("name", "vectorLayerMRTLines");
        imap.addLayer(vectorLayerMRTLines);
        vectorLayerMRTLines.setVisible(false);

        //vector layer for MRT stations
        let vectorLayerMRTStations = new ol.layer.Vector({
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
    }

    initRoadLayers(imap: ol.Map): void {
        //vector layer for roads
        let roadStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'orange',
                width: 1
            })
        });

        let vectorLayerRoad0 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_0.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad0.set("name", "vectorLayerRoad0");
        imap.addLayer(vectorLayerRoad0);
        vectorLayerRoad0.setVisible(false);

        let vectorLayerRoad1 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_1.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad1.set("name", "vectorLayerRoad1");
        imap.addLayer(vectorLayerRoad1);
        vectorLayerRoad1.setVisible(false);

        let vectorLayerRoad2 = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.OSMVECTOR + 'roads/roads_2.geojson',
                format: new ol.format.GeoJSON()
            }),
            style: roadStyle
        });
        vectorLayerRoad2.set("name", "vectorLayerRoad2");
        imap.addLayer(vectorLayerRoad2);
        vectorLayerRoad2.setVisible(false);
    }

    initPopulationDensityLayer(imap: ol.Map): void {
        //vector layer for population
        let colorScheme = colorbrewer.BuPu;
        let colorClasses = colorScheme[5]; // 5 classes of color
        let vectorLayerPop = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.SG_POP_VECTOR_URL,
                format: new ol.format.GeoJSON()
            }),
            style: function (feature: any, resolution: any) {
                let population = feature.get('population');
                let areaColor: string;
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
                let choropleth = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'orange',
                        width: 2

                    }),
                    fill: new ol.style.Fill({
                        color: areaColor
                    })
                })
                return choropleth;
            }
        });
        vectorLayerPop.set("name", "vectorLayerPop");
        imap.addLayer(vectorLayerPop);
        vectorLayerPop.setVisible(false);
    }

    initKMLLayers(imap: ol.Map): void {
        let clinics: ol.layer.Vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.MOH_CHAS_CLINIC_URL,
                format: new ol.format.KML({extractStyles: false})
            }),
            style: new ol.style.Style({
                text: new ol.style.Text({
                    fill:  new ol.style.Fill({
                        color: 'white'
                    }),
                    scale: 10
                })
            })
        });

        let npcBoundaries = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.config.NPC_BOUNDARY_URL,
                format: new ol.format.KML({extractStyles: false}),
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
    }

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
    plotIncidents(incidentList: any[]): void {

        let incidentFeatures: any[] = [];

        for (let incident of incidentList) {
            incidentFeatures.push(this.plotIncident(incident));
            //popup overlay
            let el = document.createElement("div");
            el.id = incident.incidentName + '_ID';
            el.classList.add("popup-incident");
            el.innerHTML = "<p class='popup-incident-label'>" + incident.incidentName + "</p>";

            let popup = new ol.Overlay({
                element: el,
                positioning: 'top-center',
                stopEvent: false,
                offset: [-50, -200],
                position: ol.proj.fromLonLat([incident.location.lon, incident.location.lat])
            });
            this.map.addOverlay(popup);

            //this.pulse([incident.location.lon, incident.location.lat], this.map);
        }

        let incidentVectorSource = new ol.source.Vector({
            features: incidentFeatures
        });

        let incidentVectorLayer = new ol.layer.Vector({
            source: incidentVectorSource
        });
        incidentVectorLayer.set("name", "incidentVectorLayer");
        this.map.addLayer(incidentVectorLayer);

    }

    plotIncident(incident: any): ol.Feature {
        let location: any = incident.location; // obj contains location.lon,  location.lat

        let iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: ICON_INCIDENT,
                scale: 0.1
            }))
        });

        let iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: incident.incidentName,
        });

        iconFeature.setStyle(iconStyle);
        return iconFeature;
    }


    //----------------RESOURCES------------------------------------
    plotResources(resourcesList: any[]): void {
        let resourceFeatures: any[] = [];

        for (let resource of resourcesList) {
            resourceFeatures.push(this.plotResource(resource));
        }
        let resourceVectorSource = new ol.source.Vector({
            features: resourceFeatures
        });

        let resourceVectorLayer = new ol.layer.Vector({
            source: resourceVectorSource
        });
        resourceVectorLayer.set("name", "resourceVectorLayer");
        this.map.addLayer(resourceVectorLayer);
    }

    // Plot a single unit on the data source by returning a resource feature
    plotResource(resource: any): ol.Feature {
        let location: any = resource.location; // obj contains location.lon,  location.lat
        let iconUrl: String;
        if (resource.icons[0]) {
            iconUrl = resource.icons[0];
        }
        else {
            iconUrl = ICON_RESOURCE;
        }
        let iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: iconUrl,
                scale: 1
            }))
        });

        let iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: resource.name,
        });

        iconFeature.setStyle(iconStyle);
        return iconFeature;
    }

    //-----------------BFT---------------------------------
    // Plot the given array of BFT units on the map (called by BFT Service)
    plotBFTs(BFTlist: any): void {
        let bftVectorLayer: any;
        let bftVectorSource: any;
        let bftFeatures: any[] = [];

        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            if (layer.get('name') === "bftClusterLayer" || layer.get('name') === "bftVectorLayer") {
                this.map.removeLayer(layer);
            }
        });

        for (let bft of BFTlist) {
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

        let clusterSource = new ol.source.Cluster({
            distance: 40,
            source: bftVectorSource
        });

        let styleCache: any = {};
        let clusterLayer = new ol.layer.Vector({
            source: clusterSource,
            minResolution: ZOOM_LEVEL_CLUSTERING,
            style: function (feature: any, resolution: any) {
                let size = feature.get('features').length;
                let style = styleCache[size];
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
    }

    // Plot a single BFT unit on the data source by returning a BFT feature
    plotBFT(bft: any): ol.Feature {
        // console.log("plot bft",bft, bft.lon, bft.lat );
        let location: any = bft.location; // obj contains location.lon,  location.lat
        let iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: ICON_IDTF,
                scale: 0.5
            }))
        });

        let iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([location.lon, location.lat])),
            name: bft.Personnel,
        });

        iconFeature.setStyle(iconStyle);
        return iconFeature;
    }


    //-------------------VIDEO---------------------------------
    plotSampleVideos(sampleVideos: any[]): void {
        for (let vid of sampleVideos) {

            //popup overlay
            let el = document.createElement("div");
            el.id = vid.name + '_ID';
            el.classList.add("popup-vid");
            el.classList.add("animated");
            el.classList.add("slideInUp");
            el.innerHTML =
                "<video width='640' height='480' autoplay loop>"
                + "<source src='" + vid.url + "' type='video/mp4'>"
                + "</video>";
            +"<p class='popup-incident-label'>" + vid.name + "</p>"
            let popup = new ol.Overlay({
                id: vid.name,
                element: el,
                positioning: 'top-center',
                stopEvent: false,
                offset: [-50, -200],
                position: ol.proj.fromLonLat([vid.location.lon, vid.location.lat])
            });
            this.map.addOverlay(popup);
        }
    }

    unplotSampleVideos(sampleVideos: any[]): void {
        for (let vid of sampleVideos) {
            let overlay = this.map.getOverlayById(vid.name);
            this.map.removeOverlay(overlay);
        }

    }

    //for testing
    initSampleIncidentMarkers(): void {

        let incidentLocations = [
            { name: "Little India", lat: 1.306348, lng: 103.849678, radius: 100 },
            { name: "Botanic Gardens", lat: 1.322168, lng: 103.814742, radius: 800 },
            { name: "City Hall", lat: 1.293149, lng: 103.852423, radius: 200 },
            { name: "NEX", lat: 1.349364, lng: 103.873732, radius: 500 },
        ];

        let iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: '../img/icons/map-marker-icon.png',
                scale: 0.1
            }))
        });
        let incidentFeatures: any[] = [];
        let incidentPopups: any[] = [];
        for (let i of incidentLocations) {
            let iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([i.lng, i.lat])),
                name: i.name,
                radius: i.radius
            });

            iconFeature.setStyle(iconStyle);
            incidentFeatures.push(iconFeature);

            //popup overlay
            // let el = document.createElement("div");
            // el.id = i.name + '_ID';
            // el.classList.add("popup-incident");
            // // document.getElementById('map').appendChild(popupDiv);
            // el.innerHTML = "<h1>" + i.name + "</h1>";

            // let popup = new ol.Overlay({
            //     element: el,
            //     positioning: 'bottom-center',
            //     stopEvent: false,
            //     offset: [0, -100]
            // });
            // popup.setPosition(ol.proj.fromLonLat([i.lng, i.lat]));
            // this.map.addOverlay(popup);
        }

        let incidentVectorSource = new ol.source.Vector({
            features: incidentFeatures
        });

        let incidentVectorLayer = new ol.layer.Vector({
            source: incidentVectorSource
        });

        this.map.addLayer(incidentVectorLayer);
    }
    setOverlayPosition(lat: number, long: number, id: string): void {
        let popup = new ol.Overlay({
            element: document.getElementById(id),
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -50]
        });
        popup.setPosition(ol.proj.fromLonLat([long, lat]));
        this.map.addOverlay(popup);
    }



    //----------------CONTROLS---------------------------------------

    //MAP CONTROLS
    home(): void {
        // console.log("home...", this.map.getView().getResolution());
        let pan = ol.animation.pan({
            duration: 2000,
            source: /** @type {ol.Coordinate} */ (ol.proj.fromLonLat([this.config.HOME_LONG, this.config.HOME_LAT]))
        });
        this.map.beforeRender(pan);
        this.map.getView().setCenter(ol.proj.fromLonLat([this.config.HOME_LONG, this.config.HOME_LAT]));

        let zoom = ol.animation.zoom({
            resolution: this.map.getView().getResolution(),
            duration: 2000
        })
        this.map.beforeRender(zoom);
        this.map.getView().setResolution(this.config.HOME_ZOOM);
    }

    toggleRoadLayer(): void {
        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            let layerName: string = layer.get('name');
            if (layerName && layerName.startsWith("vectorLayerRoad")) {
                layer.setVisible(!layer.getVisible());
                // console.log(layerName);
            }
        });
    }

    toggleLayer(): void {
        console.log("toggleLayer sat vs osm");
        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            // console.log('layerName', layer.get('name'));
            if (layer.get('name') === "satLayer" || layer.get('name') === "osmLayer") {
                layer.setVisible(!layer.getVisible());
            }
        });
    }

    toggleVector(): void {
        console.log("toggle district map");
        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            if (layer.get('name') === "vectorLayerDistrictBoundary" || layer.get('name') === "vectorLayerSgBoundary") {
                layer.setVisible(!layer.getVisible());
            }


        });
    }

    togglePopDensityLayer(): void {
        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            if (layer.get('name') === "vectorLayerPop") {
                layer.setVisible(!layer.getVisible());
            }
        });
    }

    toggleMrtLayer(): void {
        this.map.getLayers().forEach(function (layer: any, idx: number, array: any) {
            if (layer.get('name') === "vectorLayerMRTLines" || layer.get('name') === "vectorLayerMRTStations") {
                layer.setVisible(!layer.getVisible());
            }
        });
    }

    zoomToIncident(incident: any): void {
        console.log("zoom to incident...", incident);
        let iLat: number = incident.location.lat;
        let iLon: number = incident.location.lon;
        let iZoom: number = 4;

        let pan = ol.animation.pan({
            duration: 4000,
            source: /** @type {ol.Coordinate} */ (ol.proj.fromLonLat([iLon, iLat]))
        });

        let zoom = ol.animation.zoom({
            resolution: this.map.getView().getResolution(),
            duration: 2000,
        });
        this.map.beforeRender(pan);
        this.map.beforeRender(zoom);

        this.map.getView().setCenter(ol.proj.fromLonLat([iLon, iLat]));
        this.map.getView().setResolution(iZoom);
    }


}